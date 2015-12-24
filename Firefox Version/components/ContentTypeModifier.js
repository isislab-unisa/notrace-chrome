/*
 * Modifies the contentType text/html in text/htmlproxy
 */
 
const Ci = Components.interfaces;
const Cc = Components.classes;
const Cu = Components.utils;
const Cr = Components.results;

const VERSION = "2.0";
const PROG_ID = "@unisa.it/contenttypemodifier;1";
const COMPONENT_ID = "{63ac9ce4-3c54-11dc-8314-0800200c9a66}";
const NAME = "ContentTypeModifier";

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://notrace/isisLogWrapper.js");
const prefserv = Components.classes["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
const aConsoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);

function ContentTypeModifier(){}

ContentTypeModifier.prototype = {
	classDescription: NAME+ " " + VERSION,
	classID:          Components.ID(COMPONENT_ID),
	contractID:       PROG_ID,
	//*********************Implements the nsISupports interface*******************
	QueryInterface: XPCOMUtils.generateQI([Ci.nsIContentTypeModifier, Ci.nsIObserver]),
	//*********************End implementation of the nsISupports interface*******************
	//*********************Implements the nsIObserver interface*******************
	observe: function(subject, topic, data) {
		if(topic == "profile-after-change") {
			var os = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
			os.addObserver(this, "http-on-examine-response", false);
			this.managecache();
		}
		if(topic == "http-on-examine-response") {
			this.managecache();
			var httpChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
			var originalContentType = httpChannel.contentType;
			var targetContentType = originalContentType.replace(/text\/html/,"text/htmlproxy");
			httpChannel.contentType = targetContentType;
		}
	},
	//*********************End implementation of the nsIObserver interface*******************
	//*********************Implements the nsIContentTypeModifier interface*******************
	managecache: function() {
		var mozCacheDisk = prefserv.getBranch("browser.cache.disk.").QueryInterface(Components.interfaces.nsIPrefBranch);
		var mozCacheMem = prefserv.getBranch("browser.cache.memory.").QueryInterface(Components.interfaces.nsIPrefBranch);
		mozCacheDisk.setBoolPref("enable", false);
		mozCacheMem.setBoolPref("enable", false);
	}
	//*********************End implementation of the nsIContentTypeModifier interface*******************
};

var components = [ContentTypeModifier];
var categoryManager = Cc["@mozilla.org/categorymanager;1"].getService(Ci.nsICategoryManager);
try {
   categoryManager.addCategoryEntry("profile-after-change", "ContentTypeModifier", "@unisa.it/contenttypemodifier;1", false, true);

} catch (anError) {
	isisLogWrapper.logToConsole("ERROR: " + anError);
}

var NSGetFactory = XPCOMUtils.generateNSGetFactory(components);