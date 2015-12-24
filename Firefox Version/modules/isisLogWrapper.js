var EXPORTED_SYMBOLS = ["isisLogWrapper"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

let isisLogWrapper = 
{
	debug: false,
	consoleService: Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService), 
	
	/**
	 * Simply and directely write to the Firefox Console
	 * */
	logToConsole : function(msg) {
		this.consoleService.logStringMessage("NTLog - " + msg);
	},
	/**
     * Write debug messages to the Firefox Console, if debug is enabled
     * */
	debugToConsole : function(msg) {
	    if (debug)
            this.consoleService.logStringMessage("NTLog DEBUG - " + msg);
    }
};