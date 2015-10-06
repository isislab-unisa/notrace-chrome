/*
 * Notifier for HTML
 */
 
const Ci = Components.interfaces;
const Cc = Components.classes;
const Cu = Components.utils;
const Cr = Components.results;

const CONVERSION = "?from=text/htmlproxy&to=*/*";
const VERSION = "2.0";
const PROG_ID = "@mozilla.org/streamconv;1" + CONVERSION;
const COMPONENT_ID = "{7f48b4de-3c5a-11dc-8314-0800200c9a66}";
const NAME = "HTMLNotifier";

Cu.import("resource://notrace/common.js");
Cu.import("resource://notrace/isisNoTraceSharedObjects.js");
Cu.import("resource://notrace/isisLogWrapper.js");  
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
const sis = Components.classes["@mozilla.org/io/string-input-stream;1"].createInstance(Components.interfaces.nsIStringInputStream);
const observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);


HTMLNotifier = function(){
};

HTMLNotifier.prototype = {
	classDescription: NAME+ " " + VERSION,
	classID:          Components.ID(COMPONENT_ID),
	contractID:       PROG_ID,
	listener: null,
	data: null,
	channel: null,
	charset: null,
	requestHost: null,
	context: null,
	statuscode: null,
	//*********************Implements the nsISupports interface*******************
	QueryInterface: XPCOMUtils.generateQI([Ci.nsIHTMLNotifier, Ci.nsIObserver,Ci.nsIStreamConverter,Ci.nsIStreamListener,Ci.nsIRequestObserver]),
	//*********************End implementation of the nsISupports interface*******************
	//*********************Implements the nsIObserver interface*******************
	observe: function(subject, topic, data) {},
	//*********************End implementation of the nsIObserver interface*******************
	//************* Begins nsIStreamConverter interface implementation *************
	// old name (before bug 242184)...
	AsyncConvertData: function(aFromType, aToType, aListener, aCtxt) {
		this.asyncConvertData(aFromType, aToType, aListener, aCtxt);
	},
	// renamed to...
	asyncConvertData: function(aFromType, aToType, aListener, aCtxt) {
		this.listener = aListener;
	},
	// Old name (before bug 242184):
	Convert: function(aFromStream, aFromType, aToType, aCtxt) {
		return this.convert(aFromStream, aFromType, aToType, aCtxt);
	},
	// renamed to...
	convert: function(aFromStream, aFromType, aToType, aCtxt) {
		return aFromStream;
	},
	//************* End nsIStreamConverter interface implementation *************
	//************* Begins nsIStreamListener interface implementation *************
	onDataAvailable: function(aRequest, aContext, aInputStream, aOffset, aCount) {
		var si = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance();
		si = si.QueryInterface(Components.interfaces.nsIScriptableInputStream);
		si.init(aInputStream);
		var tmp = si.read(aCount);
		this.data += tmp;
	},
	//************* End nsIStreamListener interface implementation *************
	//************* Begins nsIRequestObserver interface implementation *************
	onStartRequest: function(aRequest, aContext) {
		this.data = "";
		this.channel = aRequest;
		this.charset = aRequest.QueryInterface(Components.interfaces.nsIChannel).contentCharset;
		this.channel.contentType = "text/html";
		this.listener.onStartRequest(this.channel, aContext);
	},
	onStopRequest: function(aRequest, aContext, aStatusCode) {
		var httpChannel = aRequest.QueryInterface(Components.interfaces.nsIHttpChannel);
		this.requestHost = httpChannel.getRequestHeader("Host");
		observerService.notifyObservers(this,"html-aviable",this.data);
		this.context = aContext;
		this.statuscode = aStatusCode;
	},
	//************* End nsIRequestObserver interface implementation *************
	//************* Begins nsIHTMLNotifier interface implementation *************
	submitHTML: function(newdata) {
		var sis = Components.classes["@mozilla.org/io/string-input-stream;1"].createInstance(Components.interfaces.nsIStringInputStream);
		sis.setData(newdata, newdata.length);
		this.listener.onDataAvailable(this.channel, this.context, sis, 0, newdata.length);
		this.listener.onStopRequest(this.channel, this.context, this.statuscode);
	},	
	getRequestHost: function() {
		return this.requestHost;
	}
	//************* End nsIHTMLNotifier interface implementation *************
};

var components = [HTMLNotifier];
var categoryManager = Cc["@mozilla.org/categorymanager;1"]
                      .getService(Ci.nsICategoryManager);
try {
   categoryManager.addCategoryEntry("app-startup", "HTMLNotifier", "@unisa.it/contenttypemodifier;1", false, true);

} catch (anError) {
	isisLogWrapper.logToConsole("ERROR: " + anError);
}

var NSGetFactory = XPCOMUtils.generateNSGetFactory(components);