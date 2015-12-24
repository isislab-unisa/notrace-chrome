Components.utils.import("resource://notrace/common.js");
Components.utils.import("resource://notrace/isisNoTraceSharedObjects.js");	
Components.utils.import("resource://notrace/isisLogWrapper.js");


if ("undefined" == typeof(isisNoTrace)) { 
	var isisNoTrace = {	
		openWindowS: function(loc){
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
			var win = wm.getMostRecentWindow("global:notraceprefwin");
			if(win==null){
				var screen_w = screen.width;
				var screen_h = screen.height
				var w = 700;
				var h = 1000;
				var pos_x = 200;
				var pos_y = 200;
				window.openDialog(loc,"pref","resizable=no,toolbar=yes,width=700,height=1000");
			}
			else{
				win.focus();
			}
		},
		blockedList: {
			refresh: function(loc){
				var recentWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser");
				var treechildren = recentWindow.document.getElementById("notraceaddons-blocked-list-children");
				var items = treechildren.getElementsByTagName("treeitem");
				var numItems = items.length;
				for(var i=0;i<numItems;i++){
					var curItem = items.item(i);
					var curClass = curItem.getAttribute("class");
					if(curClass==loc){
						curItem.setAttribute("hidden","false");
					}
					else{
						curItem.setAttribute("hidden","true");
					}
				}
			},
			removeItems: function(classe){
				var recentWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser");
				var treechildren = recentWindow.document.getElementById("notraceaddons-blocked-list-children");
				const items = treechildren.getElementsByTagName("treeitem");
				var numItems = items.length;
				var toremove = new Array();
				for(var i=0;i<numItems;i++){
					var curItem = items.item(i);
					var curClass = curItem.getAttribute("class");
					if(curClass==classe){
						toremove.push(curItem);
					}
				}
				var lentorem = toremove.length;
				for(var j=0;j<lentorem;j++){
					treechildren.removeChild(toremove[j]);
				}
			}
		},
		oldInitForAddonbar: function(){
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);
			
			var browser = wm.getMostRecentWindow("navigator:browser");
			gBrowser.addProgressListener(isisNoTrace.Listener);
			isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.eraseDB();
		},
		Listener: {
			QueryInterface: function(aIID) {
				if 	(aIID.equals(Components.interfaces.nsIWebProgressListener) ||
					aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
					aIID.equals(Components.interfaces.nsISupports))
					return this;
				throw Components.results.NS_NOINTERFACE;
			},
			onLocationChange: function(aProgress, request, aURI) {
				var loc = aURI.spec;
				if(request!=null){
					isisNoTrace.blockedList.removeItems(loc);
				}
				isisNoTrace.blockedList.refresh(loc);
				if(/^http/.test(loc)){
					var dom = isisNoTraceShare.isisNoTraceSharedObjects.domain.getDomain(loc);

					isisNoTrace.list.addOption(dom);
				}
			},
			onProgressChange: function(aProgress, request , curSelfProgress , maxSelfProgress , curTotalProgress , maxTotalProgress){},
			onSecurityChange: function(aProgress , request , state){},
			onStatusChange: function(aProgress , request , status , message) {},

			onStateChange: function(aProgress ,request , aFlag , status){
				if(aFlag & isisNoTraceShare.isisNoTraceSharedObjects.STATE_STOP){
					isisNoTraceShare.isisNoTraceSharedObjects.score.start();
				}
			}
		},
		list: {
			addOption: function(domain){
				var recentWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser");
				var menupopup = recentWindow.document.getElementById("notraceaddons-statusbar-menupopup");
				var numchild = menupopup.childNodes.length;
				while(numchild>6){
					menupopup.removeChild(menupopup.lastChild);
					numchild--;
				}
				var result = isisNoTraceShare.isisNoTraceSharedObjects.whitelist.checkDomain(domain);
				if(result==false){
					var menuitem = document.createElement("menuitem");
					menuitem.setAttribute("id","notrace-"+domain);
					menuitem.setAttribute("value",domain);
					menuitem.setAttribute("label",isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("add.label")+" "+domain+" "+isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("towhitelist.label"));
					menuitem.addEventListener("click", function (event) { isisNoTrace.list.addToWhiteList(domain) }, false); 
					menupopup.appendChild(menuitem);
					numchild++
				}
			},
			addToWhiteList: function(domain){
				var scelta = confirm(isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("wanttoadd.label")+" "+isisNoTraceShare.isisNoTraceSharedObjects.escapeHTML(domain)+" "+isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("tothewhitelist.label"));
				if(scelta){
					isisNoTraceShare.isisNoTraceSharedObjects.whitelist.add(domain);
					var recentWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser");
					var menupopup = recentWindow.document.getElementById("notraceaddons-statusbar-menupopup");
					var torem = recentWindow.document.getElementById("notrace-"+domain);
					menupopup.removeChild(torem);
					isisNoTraceShare.isisNoTraceSharedObjects.alertsService.showAlertNotification("chrome://notrace/content/imgs/info_24.png", "INFO", "\""+domain+"\"  "+isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("addedtowhitelist.label"), false, "", null, "");
				}
			}
		},
		returnLastCheckDate: function() {
			var v=isisNoTraceShare.isisNoTraceSharedObjects.prefs.getCharPref("lastCheckDate");
			return v;
		},
		resetDate_Flag: function() {
			var today = new Date();
			today=today.getTime();
			var v=isisNoTraceShare.isisNoTraceSharedObjects.prefs.getCharPref("lastCheckDate");
			var intervallo=40*24*60*60*1000; //40 days * 24h * 60m * 60s * 1000ms
			var inter=today-v;
			if(inter>intervallo) {
				var today1= new Date();
				today1=today1.getTime();
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setIntPref("flag",0);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setCharPref("lastCheckDate",today1);
			}	
		},
		firstRun: function(){
			var lastCheck=returnLastCheckDate();
			var today=new Date();
			today=today.getTime();
			resetDate_Flag();
			var valueFlag=isisNoTraceShare.isisNoTraceSharedObjects.prefs.getIntPref("flag");
			if (valueFlag==0){ 
				var screen_w = screen.width;
				var screen_h = screen.height
				var win_w = screen_w*3/10;
				var win_h = screen_h*3/8;
				var pos_x = (screen_w/2)-(win_w/2);
				var pos_y = (screen_h/2)-(win_h/2);
				var win = window.openDialog("chrome://notrace/content/firstrun.xul","newdlg","modal,resizable=0,width="+win_w+",height="+win_h+",screenX="+pos_x+",screenY="+pos_y);
			}
		},
		openWindow: function(loc){
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
			var win = wm.getMostRecentWindow("global:notracehistory");
			if(win==null){
				var screen_w = screen.width;
				var screen_h = screen.height
				var win_w = screen_w*3/9;
				var win_h = screen_h*3/9;
				var pos_x = (screen_w/2)-(win_w/2);
				var pos_y = (screen_h/2)-(win_h/2);
				window.open(loc,"","chrome,resizable=1,width="+win_w+",height="+win_h+",screenX="+pos_x+",screenY="+pos_y);
			}
			else{
				win.focus();
			}
		},

		openWindowSensitiveInfo: function(loc){
			//isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.flushEverything();
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
			var win = wm.getMostRecentWindow("global:notracesensitiveinfo");
			
			if(win==null){
				var screen_w = screen.width;
				var screen_h = screen.height;
				var win_w =734;
				var win_h =435;
				var pos_x = (screen_w/2)-(win_w/2);
				var pos_y = (screen_h/3)-(win_h/2);
				
				window.open(loc,"","chrome,resizable=0,width="+win_w+",height="+win_h+",screenX="+pos_x+",screenY="+pos_y);
			}
			else{
				win.focus();
			}
		},
		
		openWindowRebuildProfile: function(loc){
			//isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.flushEverything();
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
			var win = wm.getMostRecentWindow("global:notracerebuildprofile");
			
			if(win==null){
				var screen_w = screen.width;
				var screen_h = screen.height;
				var win_w =734;
				var win_h =435;
				var pos_x = (screen_w/2)-(win_w/2);
				var pos_y = (screen_h/3)-(win_h/2);
				
				window.open(loc,"","chrome,resizable=0,width="+win_w+",height="+win_h+",screenX="+pos_x+",screenY="+pos_y);
			}
			else{
				win.focus();
			}
		},
		
		installButton: function(toolbarId, id, afterId) {
			if (!document.getElementById(id)) {
				var toolbar = document.getElementById(toolbarId);
				var before = toolbar.firstChild;
				if (afterId) {
					let elem = document.getElementById(afterId);
					if (elem && elem.parentNode == toolbar)
						before = elem.nextElementSibling;
				}
				toolbar.insertItem(id, before);
				toolbar.setAttribute("currentset", toolbar.currentSet);
				document.persist(toolbar.id, "currentset");
				if (toolbarId == "nav-bar")
					toolbar.collapsed = false;
			}
		},
		addButton: function(){
			var mediator = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);  
			var doc = mediator.getMostRecentWindow("navigator:browser").document;
			var addonBar = doc.getElementById("nav-bar");
			setToolbarVisibility(addonBar, true);
		},
		showAddonBar: function(){
		    if (isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("addonbarbutton")) {
		        var addonBar = document.getElementById("addon-bar");
                // The following piece of code mimic the setToolbarVisibility function in browser.js
                var hidingAttribute = addonBar.getAttribute("type") == "menubar" ? "autohide" : "collapsed";
                addonBar.setAttribute(hidingAttribute, false);
                document.persist(addonBar.id, hidingAttribute);
		    }
		}
	}
}

//isisNoTrace.addButton();
					
window.addEventListener("load", function() { window.removeEventListener('load', arguments.callee, true); isisNoTrace.oldInitForAddonbar(); isisNoTraceShare.isisNoTraceSharedObjects.initDBConnection(); isisNoTrace.showAddonBar();}, false);
//isisNoTraceShare.isisNoTraceSharedObjects.score.start();
