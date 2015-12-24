Components.utils.import("resource://notrace/common.js");
Components.utils.import("resource://notrace/isisNoTraceSharedObjects.js");	

if ("undefined" == typeof(isisNoTrace)) { 
	
	var isisNoTrace = {
		setTreeSize: function(){
			var w = screen.width;
			var h = screen.height;
			var tree = document.getElementById("notraceaddons-objectstree");
			var box = document.getElementById("notraceaddons-descr_box");
			tree.setAttribute("width",w);
			box.setAttribute("width",w);
		},
		createTreeHistory: function(){
			var tech = window.opener.document.getElementById("tech").getAttribute("value");
			var tech2 = window.opener.document.getElementById("tech2").getAttribute("value");
			var techdesc = document.getElementById("techdesc");
			techdesc.setAttribute("value",tech2);
			var elements=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getBlockableObjects(tech);
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
					var child = document.createElement("treeitem");
					var childrow = document.createElement("treerow");
					var childrequestOrigin = document.createElement("treecell");
					childrequestOrigin.setAttribute("label",resourceLocation);
					var childresource = document.createElement("treecell");
					if(noidheader!=null && noidheader!=""){
						childresource.setAttribute("label",noidheader+" HTTP Header: "+resource);
					}
					else{
						childresource.setAttribute("label",resource);
					}
					childrow.appendChild(childrequestOrigin);
					childrow.appendChild(childresource);
					child.appendChild(childrow);
					children.appendChild(child);
				}
			}
		},
		dettagli: function(){
			var tree = document.getElementById("notraceaddons-objectstree");
			var treeview = tree.view;
			var index = treeview.selection.currentIndex;
			var col = tree.columns.getColumnAt(1);
			var coltxt = treeview.getCellText(index,col);
			if(coltxt!=""){
				var screen_w = screen.width;
				var screen_h = screen.height
				var win_w = screen_w*3/7;
				var win_h = 500;
				var pos_x = (screen_w/2)-(win_w/2);
				var pos_y = (screen_h/2)-(win_h/2);
				window.open("chrome://notrace/content/objectsdettagli.xul","","chrome,width="+win_w+",height="+win_h+",screenX="+pos_x+",screenY="+pos_y);
			}
		}
	}
}