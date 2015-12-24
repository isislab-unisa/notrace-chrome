Components.utils.import("resource://notrace/common.js");
Components.utils.import("resource://notrace/isisNoTraceSharedObjects.js");

if ("undefined" == typeof(isisNoTrace)) { 
	
	var isisNoTrace = {
		dbconn: null,
		initLocalStorageDBConnection: function() {
			if (this.dbconn==null) {
				var fileLS = Components.classes["@mozilla.org/file/directory_service;1"]
					.getService(Components.interfaces.nsIProperties)
					.get("ProfD", Components.interfaces.nsIFile);
				fileLS.append("webappsstore.sqlite");
				var storageServiceLS = Components.classes["@mozilla.org/storage/service;1"].getService(Components.interfaces.mozIStorageService);
				this.dbconn = storageServiceLS.openDatabase(fileLS);
			}
			return this.dbconn;
		},
		createTreeHTML5: function(){
			this.dbconn = this.initLocalStorageDBConnection();
			var selectOriginsStatement = this.dbconn.createStatement("SELECT DISTINCT scope FROM webappsstore2 ORDER BY scope ASC");
			var origins = new Array();
			try {
				while( selectOriginsStatement.executeStep() ) {
					var requestOrigin = selectOriginsStatement.getUTF8String(0);
					origins.push(requestOrigin);
				}
			}
			finally { selectOriginsStatement.reset(); }	  
			var selectStatement = this.dbconn.createStatement("SELECT * FROM webappsstore2 WHERE scope=?1");
			var treechildren2 = document.getElementById("notraceaddons-treechildren2");
			var num_orig = origins.length;	
			for(var i=0;i<num_orig;i++){
				var cur_orig = origins[i];
				var origin = document.createElement("treeitem");
				origin.setAttribute("container",true);
				origin.setAttribute("open",false);
				var originrow = document.createElement("treerow");
				var origincell = document.createElement("treecell");
				var tovisualize=cur_orig.substring(0,cur_orig.indexOf(":"));
				tovisualize=tovisualize.split("").reverse().join("");
				if (tovisualize.indexOf(".")==0) {
					tovisualize=tovisualize.substring(1,tovisualize.length);
				}
				origincell.setAttribute("label",tovisualize);
				origincell.setAttribute("original",cur_orig);
				origincell.setAttribute("id",tovisualize);
				originrow.appendChild(origincell);
				origin.appendChild(originrow);
				treechildren2.appendChild(origin);
				var children = document.createElement("treechildren");
				origin.appendChild(children);
				selectStatement.bindUTF8StringParameter(0, cur_orig);
				try {
					while( selectStatement.executeStep() ) {
						var resourceLocation = selectStatement.getUTF8String(0);
						var resourceType = selectStatement.getUTF8String(1);
						var resource = selectStatement.getUTF8String(2);
						var prot=resourceLocation.substring(resourceLocation.indexOf(":"),resourceLocation.lastIndexOf(":"));
						var port=resourceLocation.substring(resourceLocation.lastIndexOf(":"),resourceLocation.length);
						var domain=resourceLocation.substring(0,resourceLocation.indexOf(":"));
						domain=domain.split("").reverse().join("");
						if (domain.indexOf(".")==0) {
							domain=domain.substring(1,domain.length);
						}
						var child = document.createElement("treeitem");
						child.setAttribute("original",cur_orig);
						child.setAttribute("id",tovisualize+resourceType);
						var childrow = document.createElement("treerow");
						var childrequestOrigin = document.createElement("treecell");
						childrequestOrigin.setAttribute("label",domain);
						var childresource = document.createElement("treecell");
						childresource.setAttribute("label",resourceType);
						var childtype = document.createElement("treecell");
						childtype.setAttribute("label",resource);
						childrow.appendChild(childrequestOrigin);
						childrow.appendChild(childresource);
						childrow.appendChild(childtype);
						child.appendChild(childrow);
						children.appendChild(child);
					}
				}
				finally { selectStatement.reset(); }
			}
		},
		setTreeSize: function(){
			var w = screen.width;
			var h = screen.height;
			var tree = document.getElementById("notraceaddons-html5tree");
			var box = document.getElementById("notraceaddons-descr_box");
			tree.setAttribute("width",400);
			box.setAttribute("width",w);
		},
		deleteDB: function(){
			var conf = isisNoTraceShare.isisNoTraceSharedObjects.prompts.confirm(null,isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("titlealert.label"),isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("wanttodeletelocalstorage.label"));
			if(conf){
				this.dbconn = isisNoTraceShare.isisNoTraceSharedObjects.initDBLSConnection();
				var delstat = this.dbconn.createStatement("DELETE FROM webappsstore2");
				
				try{ delstat.execute(); }
					finally{ delstat.reset(); }
					
				var tree = document.getElementById("notraceaddons-html5tree");
				var treechildren = document.getElementById("notraceaddons-treechildren2");
				tree.removeChild(treechildren);
			}
		},
		dettagli: function(){
			var tree = document.getElementById("notraceaddons-html5tree");
			var treeview = tree.view;
			var index = treeview.selection.currentIndex;
			var col = tree.columns.getColumnAt(1);
			var coltxt = treeview.getCellText(index,col);
			if(coltxt!=""){
				window.open("chrome://notrace/content/html5dettagli.xul","","chrome");
			}
		},
		deleteSingleElement: function(tree) {
			var conf = isisNoTraceShare.isisNoTraceSharedObjects.prompts.confirm(null,isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("titlealert.label"),isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("wanttodeletelocalstorageitem.label"));
			if(conf){
				var treeview = tree.view;

				var index = treeview.selection.currentIndex;

				var colLoc = tree.columns.getColumnAt(0);
				var colRes = tree.columns.getColumnAt(1);
				var colTech = tree.columns.getColumnAt(2);

				var loctxt = treeview.getCellText(index,colLoc);
				var restxt = treeview.getCellText(index,colRes);
				var techtxt = treeview.getCellText(index,colTech);
				var element = document.getElementById(loctxt+restxt);
				var original = element.getAttribute("original");
				this.dbconn = isisNoTraceShare.isisNoTraceSharedObjects.initDBLSConnection();
				var delstat = this.dbconn.createStatement("DELETE FROM webappsstore2 WHERE scope=?1 AND key=?2");
				delstat.bindUTF8StringParameter(0, original);
				delstat.bindUTF8StringParameter(1, restxt);
				try{ delstat.execute(); }
					finally{ delstat.reset(); }
					
				var tree = document.getElementById("notraceaddons-html5tree");
				var treechildren=element.parentNode;
				treechildren.removeChild(element);
				if (treechildren.firstChild==null) {
					var treeitem=treechildren.parentNode;
					treeitem.removeChild(treechildren);
					var new_treechildren=treeitem.parentNode;
					new_treechildren.removeChild(treeitem);
				}
			}
		},
		deleteSingleElementTree: function(){
			var tree = document.getElementById("notraceaddons-html5tree");
			isisNoTrace.deleteSingleElement(tree);
		},
		deleteSingle: function(){
			var tree = document.getElementById("notraceaddons-html5tree");
			var treeview = tree.view;
			var index = treeview.selection.currentIndex;
			var col = tree.columns.getColumnAt(1);
			var coltxt = treeview.getCellText(index,col);
			var button=document.getElementById("deleteSingle");
			if(coltxt!=""){
				button.setAttribute("disabled","false");
			}
			else {
				button.setAttribute("disabled","true");
			}
		}
	}
}