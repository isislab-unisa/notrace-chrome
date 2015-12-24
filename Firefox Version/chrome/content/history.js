Components.utils.import("resource://notrace/common.js");
Components.utils.import("resource://notrace/isisNoTraceSharedObjects.js");	

if ("undefined" == typeof(isisNoTrace)) { 
	
	var isisNoTrace = {
		promptService: Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService),
		createTreeHistory: function(){
			var elements=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getAllBlockableObjects();
			var origins = new Object();
			var requestOrigin = null;
			var num_orig = 0;
			for (var elem in elements) {
				requestOrigin = elements[elem].reqOrig_domain;
				if (!origins.hasOwnProperty(requestOrigin)) {
					origins[requestOrigin]=requestOrigin;
				}
			}
			var treechildren2 = document.getElementById("notraceaddons-treechildren2");
			var num_orig = origins.length;	
			for(var i in origins){
				var cur_orig = origins[i];
				var origin = document.createElement("treeitem");
				origin.setAttribute("container",true);
				origin.setAttribute("open",false);
				var originrow = document.createElement("treerow");
				var origincell = document.createElement("treecell");
				origincell.setAttribute("label",cur_orig);
				originrow.appendChild(origincell);
				origin.appendChild(originrow);
				treechildren2.appendChild(origin);
				var children = document.createElement("treechildren");
				origin.appendChild(children);
				for (var elem in elements) {
					var resource = elements[elem].resource;
					var resourceLocation = elements[elem].loc_domain;
					var noidheader = elements[elem].optionalHeaderName;
					//alert(cur_orig+"----"+elements[elem].reqOrig_domain+"++++++"+resource);
					if (cur_orig!=elements[elem].reqOrig_domain) continue;
					// var nonoscript = selectStatement.getInt32(1);
					// var nometacookie = selectStatement.getInt32(2);
					// var nometaredirect = selectStatement.getInt32(3);
					// var nojscookie = selectStatement.getInt32(4);
					// var nojs = selectStatement.getInt32(5);
					// var noimg = selectStatement.getInt32(6);
					// var no3cookie = selectStatement.getInt32(7);
					// var no3img = selectStatement.getInt32(8);
					// var no3js = selectStatement.getInt32(9);
					// var no3malobj = selectStatement.getInt32(10);
					// var no3objnoid = selectStatement.getInt32(11);
					// var noad = selectStatement.getInt32(12);
					// var nocookie = selectStatement.getInt32(13);
					// var noidheader = selectStatement.getUTF8String(14);
					// var notop = selectStatement.getInt32(15);
					// var nowebbug = selectStatement.getInt32(16);
					
					// var resource = selectStatement.getUTF8String(18);
					// var resourceLocation = selectStatement.getUTF8String(19);
					
					// var tech = "";
					// if(nonoscript!="") tech = tech + "nonoscript ";
					// if(nometacookie!="") tech = tech + "nometacookie ";
					// if(nometaredirect!="") tech = tech + "nometaredirect ";
					// if(nojscookie!="") tech = tech + "nojscookie ";
					// if(nojs!="") tech = tech + "nojs ";
					// if(noimg!="") tech = tech + "noimg ";
					// if(no3cookie!="") tech = tech + "no3cookie ";
					// if(no3img!="") tech = tech + "no3img ";
					// if(no3js!="") tech = tech + "no3js ";
					// if(no3malobj!="") tech = tech + "no3malobj ";
					// if(no3objnoid!="") tech = tech + "no3objnoid ";
					// if(noad!="") tech = tech + "noad ";
					// if(nocookie!="") tech = tech + "nocookie ";
					// if( (noidheader=="User-Agent") || (noidheader=="From") || (noidheader=="Cookie") || (noidheader=="Referer") ) tech = tech + "noidheader ";
					// if(notop!="") tech = tech + "notop ";
					// if(nowebbug!="") tech = tech + "nowebbug ";      			
					var child = document.createElement("treeitem");
					var childrow = document.createElement("treerow");
					var childrequestOrigin = document.createElement("treecell");
					childrequestOrigin.setAttribute("label",resourceLocation);
					var childresource = document.createElement("treecell");
					if(noidheader!=null){
						childresource.setAttribute("label",noidheader+" HTTP Header: "+resource);
					}
					else{
						if( (no3cookie!="") || (nocookie!="") ){
							childresource.setAttribute("label","Cookie name: "+resource);
						}
						else{
							childresource.setAttribute("label",resource);
						}
					}
					var childtype = document.createElement("treecell");
					//childtype.setAttribute("label",tech);
					childrow.appendChild(childrequestOrigin);
					childrow.appendChild(childresource);
					childrow.appendChild(childtype);
					child.appendChild(childrow);
					children.appendChild(child);
				}
			}
		},
		setTreeSize: function(){
			var w = screen.width;
			var h = screen.height;
			var tree = document.getElementById("notraceaddons-historytree");
			var box = document.getElementById("notraceaddons-descr_box");
			tree.setAttribute("width",w);
			box.setAttribute("width",w);
		},
		deleteDB: function(){
			var conf = this.promptService.confirm(null,isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("titlealert.label"),isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("resetdb.label"));
			if(conf){
				isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.eraseDB();
				isisNoTraceShare.isisNoTraceSharedObjects.alertsService.showAlertNotification("chrome://notrace/content/imgs/info_24.png", "INFO", isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("wanttoreset.confirmed.label"), false, "", null, "");
				var tree = document.getElementById("notraceaddons-historytree");
				var treechildren = document.getElementById("notraceaddons-treechildren2");
				tree.removeChild(treechildren);
			}
		},
		dettagli: function(){
			var tree = document.getElementById("notraceaddons-historytree");
			var treeview = tree.view;
			var index = treeview.selection.currentIndex;
			var col = tree.columns.getColumnAt(1);
			var coltxt = treeview.getCellText(index,col);
			if(coltxt!=""){
				window.open("chrome://notrace/content/historydettagli.xul","","chrome");
			}
		},
	}
}