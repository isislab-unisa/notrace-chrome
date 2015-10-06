const alertsService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
var common = {

  _bundle: Components.classes["@mozilla.org/intl/stringbundle;1"]
           .getService(Components.interfaces.nsIStringBundleService)
           .createBundle("chrome://notrace/locale/various.properties"),

           getLocalizedMessage: function(msg) {
              return this._bundle.GetStringFromName(msg);
           }
};

function doSave() {
	var val=0;
	if (document.getElementById("1").selected) {
		val=document.getElementById("1").value;
	}
	else if (this.document.getElementById("2").selected) {
		val=document.getElementById("2").value;
	}
	else if (this.document.getElementById("3").selected) {
			val=document.getElementById("3").value;
	}
	else if (this.document.getElementById("4").selected) {
			val=document.getElementById("4").value;
	}
	else if (this.document.getElementById("5").selected) {
			val=document.getElementById("5").value;
	}
	var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
	consoleService.logStringMessage(val);
	var today= new Date();
	var tod=today.getTime();
	isisNoTraceShare.isisNoTraceSharedObjects.prefs.setIntPref("flag",val);
	isisNoTraceShare.isisNoTraceSharedObjects.prefs.setCharPref("lastCheckDate",tod);
	return val;
	}

function doCancel(){	
	alertsService.showAlertNotification("chrome://notrace/content/imgs/info_24.png", "INFO", common.getLocalizedMessage("noprotecionlevel.label"), false, "", null, "");
    doSave();
	return true;
}
