if ("undefined" == typeof(isisNoTraceSideBar)) { 
	
	var isisNoTraceSideBar = {
		closeSidebar: function(){
			document.getElementById("notraceaddons-sidebar-splitter").hidden = "true";
			document.getElementById("notraceaddons-sidebar").hidden = "true";
		},
		openSidebar: function(){
			var winMed = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
			var recentWindow = winMed.getMostRecentWindow("navigator:browser");
			recentWindow.document.getElementById("notraceaddons-sidebar-splitter").setAttribute("hidden","false");
			recentWindow.document.getElementById("notraceaddons-sidebar").setAttribute("hidden","false");
		},
		dettagli: function(){
			window.open("chrome://notrace/content/blockeddettagli.xul","","chrome");
		}
	}
}