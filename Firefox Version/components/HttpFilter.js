/*
 * Implements noidheader, nocookie, no3cookie
 */

const Ci = Components.interfaces;
const Cc = Components.classes;
const Cu = Components.utils;
const Cr = Components.results;

const VERSION = "2.0";
const PROG_ID = "@unisa.it/httpfilter;1";
const COMPONENT_ID = "{7f66f8fc-f4c2-11db-8314-0800200c9a66}";//CID
const NAME = "HttpFilter";
const allow = Components.interfaces.nsIContentPolicy.ACCEPT;
const block = Components.interfaces.nsIContentPolicy.REJECT_REQUEST;

Cu.import("resource://notrace/common.js");
Cu.import("resource://notrace/isisNoTraceSharedObjects.js");
Cu.import("resource://notrace/isisLogWrapper.js");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/FileUtils.jsm");
const prefserv = Components.classes["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
const winMed = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
const aConsoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
const promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
const alertsService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);

/**
	These list is an object to manage the whitelist, there were a problem using the shared whitelist module from isisNoTraceSharedObject
*/
var list = {
	addToWhiteList: function(domain){
		//isisLogWrapper.logToConsole("HTTFILTER: "+domain);
		var scelta = promptService.confirm(null,isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("titlealert.label"),isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("wanttoadd.label")+" "+escapeHTML(domain)+" "+isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("tothewhitelist.label"));
		if(scelta){
			isisNoTraceShare.isisNoTraceSharedObjects.whitelist.add(domain);
			var recentWindow = winMed.getMostRecentWindow("navigator:browser");
			var menupopup = recentWindow.document.getElementById("notraceaddons-statusbar-menupopup");
			var torem = recentWindow.document.getElementById(domain);
			menupopup.removeChild(torem);
			alertsService.showAlertNotification("chrome://notrace/content/imgs/info_24.png", isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("titlealert.label"), "\""+domain+"\"  "+isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("addedtowhitelist.label"), false, "", null, "");
			torem=null;
			recentWindow=null;
			menupopup=null;
		}
		scelta=null;
	}
};

/**
	This is needed for the redirect to work.
*/
function findWindow(channel) {
for each(var cb in [channel.notificationCallbacks,
				   channel.loadGroup && channel.loadGroup.notificationCallbacks]) {
  if (cb instanceof Ci.nsIInterfaceRequestor) {
	if (Ci.nsILoadContext) try {
	// For Gecko 1.9.1
	  return cb.getInterface(Ci.nsILoadContext).associatedWindow;
	} catch(e) {}
	
	try {
	  // For Gecko 1.9.0
	  return cb.getInterface(Ci.nsIDOMWindow);
	} catch(e) {}
  }
}
return null;
}

/**
	This is needed for the redirect to work.
*/
function queryNotificationCallbacks(chan, iid) {
var cb;
try {
  cb = chan.notificationCallbacks.getInterface(iid);
  if (cb) return cb;
} catch(e) {}

try {
  return chan.loadGroup && chan.loadGroup.notificationCallbacks.getInterface(iid);
} catch(e) {}

return null;
}


/**
	This is the listener for the redirect: CtxCapturingListener taken from ChannelRedirect.js
*/
function CtxCapturingListener(tracingChannel, captureObserver) {
  this.originalListener = tracingChannel.setNewListener(this);
  this.captureObserver = captureObserver;
}
CtxCapturingListener.prototype = {
  originalListener: null,
  originalCtx: null,
  onStartRequest: function(request, ctx) {
    this.originalCtx = ctx;
    if (this.captureObserver) {
      this.captureObserver.observeCapture(request, this);
    }
  },
  onDataAvailable: function(request, ctx, inputStream, offset, count) {},
  onStopRequest: function(request, ctx, statusCode) {},
  QueryInterface: xpcom_generateQI([Ci.nsIStreamListener])
}

/**
	This is the module that does the redirect
*/
RedirectChannel.supported = "nsITraceableChannel" in Ci;
function RedirectChannel(chan, newURI) {
  return this._init(chan, newURI);
}
RedirectChannel.runWhenPending = function(channel, callback) {
  if (channel.isPending()) {
    callback();
    return false;
  } else {
    new LoadGroupWrapper(channel, callback);
    return true;
  }
};

RedirectChannel.prototype = {
	listener: null,
	context: null,
	oldChannel: null,
	channel: null,
	window: null,
	suspended: false,
	_redirectCallback: {
		QueryInterface: xpcom_generateQI([Ci.nsIAsyncVerifyRedirectCallback]),
		onRedirectVerifyCallback: function(result) {}
	},
	_defaultCallback: function(object){
	   /*for (key in object){
	       isisLogWrapper.logToConsole("Property: "+key+"--------"+object[key]);
	   } */
	},
	
	visitHeader: function(key, val) {
		try {
		  // we skip authorization and cache-related fields which should be automatically set
		  if (/^(?:Host|Cookie|Authorization)$|Cache|^If-/.test(key)) return;
		  
		  this.channel.setRequestHeader(key, val, false);
		} catch (e) {
		  dump(e + "\n");
		}
	},
	
	_init: function(chan, newURI) {
	var newMethod = chan.requestMethod;
	if ("nsIAsyncVerifyRedirectCallback" in Ci) { _redirectCallback={
			QueryInterface: xpcom_generateQI([Ci.nsIAsyncVerifyRedirectCallback]),
			onRedirectVerifyCallback: function(result) {}
		}
	}
    if (!(RedirectChannel.supported && chan instanceof Ci.nsITraceableChannel))
      throw this._unsupportedError;
    newURI = newURI || chan.URI;
	var IOS=Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    var newChan = IOS.newChannelFromURI(newURI);
    this.oldChannel = chan;
    this.channel = newChan;
    
    // porting of http://mxr.mozilla.org/mozilla-central/source/netwerk/protocol/http/src/nsHttpChannel.cpp#2750
    
    var loadFlags = chan.loadFlags;
    
    if (chan.URI.schemeIs("https"))
      loadFlags &= ~chan.INHIBIT_PERSISTENT_CACHING;
    
    
    newChan.loadGroup = chan.loadGroup;
    newChan.notificationCallbacks = chan.notificationCallbacks;
    newChan.loadFlags = loadFlags | newChan.LOAD_REPLACE;
    
    if (!(newChan instanceof Ci.nsIHttpChannel))
      return this;
    
    // copy headers
    chan.visitRequestHeaders(this);

    if (!newMethod || newMethod === chan.requestMethod) {
      if (newChan instanceof Ci.nsIUploadChannel && chan instanceof Ci.nsIUploadChannel && chan.uploadStream ) {
        var stream = chan.uploadStream;
        if (stream instanceof Ci.nsISeekableStream) {
          stream.seek(stream.NS_SEEK_SET, 0);
        }       
        try {
          let ctype = chan.getRequestHeader("Content-type");
          let clen = chan.getRequestHeader("Content-length");
          if (ctype && clen) {
            newChan.setUploadStream(stream, ctype, parseInt(clen, 10));
          }
        } catch(e) {
          newChan.setUploadStream(stream, '', -1);
        }
        
        newChan.requestMethod = chan.requestMethod;
      }
    } else {
      newChan.requestMethod = newMethod;
    }
    
    if (chan.referrer) newChan.referrer = chan.referrer;
    newChan.allowPipelining = chan.allowPipelining;
    newChan.redirectionLimit = chan.redirectionLimit - 1;
    if (chan instanceof Ci.nsIHttpChannelInternal && newChan instanceof Ci.nsIHttpChannelInternal) {
      if (chan.URI == chan.documentURI) {
        newChan.documentURI = newURI;
      } else {
        newChan.documentURI = chan.documentURI;
      }
    }
    
    if (chan instanceof Ci.nsIEncodedChannel && newChan instanceof Ci.nsIEncodedChannel) {
      newChan.applyConversion = chan.applyConversion;
    }
    
    // we can't transfer resume information because we can't access mStartPos and mEntityID :(
    // http://mxr.mozilla.org/mozilla-central/source/netwerk/protocol/http/src/nsHttpChannel.cpp#2826
    
    if ("nsIApplicationCacheChannel" in Ci &&
      chan instanceof Ci.nsIApplicationCacheChannel && newChan instanceof Ci.nsIApplicationCacheChannel) {
      newChan.applicationCache = chan.applicationCache;
      newChan.inheritApplicationCache = chan.inheritApplicationCache;
    }
    
    if (chan instanceof Ci.nsIPropertyBag && newChan instanceof Ci.nsIWritablePropertyBag) 
      for (var properties = chan.enumerator, p; properties.hasMoreElements();)
        if ((p = properties.getNext()) instanceof Ci.nsIProperty)
          newChan.setProperty(p.name, p.value);

    if (chan.loadFlags & chan.LOAD_DOCUMENT_URI) {
      this.window = findWindow(chan);
      if (this.window) this.window._replacedChannel = chan;
    }
    //isisLogWrapper.logToConsole("Init run in ChannelReplacements-------------"+newChan.URI.spec);
    return this;
  },
	
	redirect: function(realRedirect, callback) {
		let self = this;
		let oldChan = this.oldChannel;
		this.realRedirect = !!realRedirect;
		if (typeof(callback) !== "function") {
		  callback = this._defaultCallback;
		}
		RedirectChannel.runWhenPending(oldChan, function() {
		  //if (oldChan.status) return; // channel's doom had been already defined
		  let ccl = new CtxCapturingListener(oldChan, self);
		  self.loadGroup = oldChan.loadGroup;
		  oldChan.loadGroup = null; // prevents the wheel from stopping spinning
		  
		
		  if (self._redirectCallback) { // Gecko >= 2
			// this calls asyncAbort, which calls onStartRequest on our listener
			oldChan.cancel(Cr.NS_BINDING_ABORTED); 
			//self.suspend(); // believe it or not, this will defer asyncAbort() notifications until resume()
			callback(self);
		  } else {
			// legacy (Gecko < 2)
			self.observeCapture = function(req, ccl) {
			  self.open = function() { self._redirect(ccl) }
			  callback(self);
			}
			oldChan.cancel(Cr.NS_BINDING_ABORTED);
		  }
		  

		});
	  },
	open: function(){
		this.resume();
	},
	resume: function() {
		if (this.suspended) {
			this.suspended = false;
			try {
				this.oldChannel.resume();
			} catch (e) {}
		}
	},
	observeCapture: function(req, ccl) {
		this._redirect(ccl);
	},
	_redirect: function(ccl) {
		let oldChan = this.oldChannel,
		newChan = this.channel,
		overlap;

		if (!(this.window && (overlap = this.window._replacedChannel) !== oldChan)) {
		  try {
			oldChan.loadGroup = this.loadGroup;
		
			this._onChannelRedirect();
			newChan.asyncOpen(ccl.originalListener, ccl.originalCtx);
			
			if (this.window && this.window != findWindow(newChan)) { 
			  // late diverted load, unwanted artifact, abort
			  newChan.cancel(Cr.NS_ERROR_ABORT);
			} else {
			  // safe browsing hook
			  if (this._classifierClass)
				this._classifierClass.createInstance(Ci.nsIChannelClassifier).start(newChan, true);
			}
		  } catch (e) {
			isisLogWrapper.logToConsole(e);
		  }
		} else {
			isisLogWrapper.logToConsole("Detected double load on the same window: " + oldChan.name + " - " + (overlap && overlap.name));
		}
		
		this.dispose();
	},
	_onChannelRedirect: function() {
		var oldChan = this.oldChannel;
		var newChan = this.channel;
		
		if (this.realRedirect) {
		  if (oldChan.redirectionLimit === 0) {
			oldChan.cancel(NS_ERROR_REDIRECT_LOOP);
			throw NS_ERROR_REDIRECT_LOOP;
		  }
		} else newChan.redirectionLimit += 1;
		
		
		
		// nsHttpHandler::OnChannelRedirect()

		const CES = Ci.nsIChannelEventSink;
		const flags = CES.REDIRECT_INTERNAL;
		this._callSink(
		  Cc["@mozilla.org/netwerk/global-channel-event-sink;1"].getService(CES),
		  oldChan, newChan, flags);
		var sink;
		
		for (let cess = Cc['@mozilla.org/categorymanager;1'].getService(Ci.nsICategoryManager)
				.enumerateCategory("net-channel-event-sinks");
			  cess.hasMoreElements();
			) {
		  sink = cess.getNext();
		  if (sink instanceof CES)
			this._callSink(sink, oldChan, newChan, flags);
		}
		sink = queryNotificationCallbacks(oldChan, CES);
		if (sink) this._callSink(sink, oldChan, newChan, flags);
		
		// ----------------------------------
		
		newChan.originalURI = oldChan.originalURI;
		
		sink = queryNotificationCallbacks(oldChan, Ci.nsIHttpEventSink);
		if (sink) sink.onRedirect(oldChan, newChan);
	},
	_callSink: function(sink, oldChan, newChan, flags) {
		try { 
		  if ("onChannelRedirect" in sink) sink.onChannelRedirect(oldChan, newChan, flags);
		  else sink.asyncOnChannelRedirect(oldChan, newChan, flags, this._redirectCallback);
		} catch(e) {
		  if (e.toString().indexOf("(NS_ERROR_DOM_BAD_URI)") !== -1 && oldChan.URI.spec !== newChan.URI.spec) {
			let oldURL = oldChan.URI.spec;
			try {
			  oldChan.URI.spec = newChan.URI.spec;
			  this._callSink(sink, oldChan, newChan, flags);
			} catch(e1) {
			  throw e;
			} finally {
			  oldChan.URI.spec = oldURL;
			}
		  } else if (e.message.indexOf("(NS_ERROR_NOT_AVAILABLE)") === -1) throw e;
		}
	},
	dispose: function() {
		this.resume();
		if (this.loadGroup) {
			try {
				this.loadGroup.removeRequest(this.oldChannel, null, NS_BINDING_REDIRECTED);
		} catch (e) {}
			this.loadGroup = null;
		}
	}
}

/**
	Auxiliary module taken from ChannelRedirect.js
*/
function LoadGroupWrapper(channel, callback) {
  this._channel = channel;
  this._inner = channel.loadGroup;
  this._callback = callback;
  channel.loadGroup = this;
}
LoadGroupWrapper.prototype = {
  QueryInterface: xpcom_generateQI([Ci.nsILoadGroup]),
  
  get activeCount() {
    return this._inner ? this._inner.activeCount : 0;
  },
  set defaultLoadRequest(v) {
    return this._inner ? this._inner.defaultLoadRequest = v : v;
  },
  get defaultLoadRequest() {
    return this._inner ? this._inner.defaultLoadRequest : null;
  },
  set groupObserver(v) {
    return this._inner ? this._inner.groupObserver = v : v;
  },
  get groupObserver() {
    return this._inner ? this._inner.groupObserver : null;
  },
  set notificationCallbacks(v) {
    return this._inner ? this._inner.notificationCallbacks = v : v;
  },
  get notificationCallbacks() {
    return this._inner ? this._inner.notificationCallbacks : null;
  },
  get requests() {
    return this._inner ? this._inner.requests : this._emptyEnum;
  },
  
  addRequest: function(r, ctx) {
    this.detach();
    if (this._inner) try {
      this._inner.addRequest(r, ctx);
    } catch(e) {
      // addRequest may have not been implemented
    }
    if (r === this._channel)
      try {
        this._callback(r, ctx);
      } catch (e) {}
  },
  removeRequest: function(r, ctx, status) {
    this.detach();
    if (this._inner) this._inner.removeRequest(r, ctx, status);
  },
  
  detach: function() {
    if (this._channel.loadGroup) this._channel.loadGroup = this._inner;
  },
  _emptyEnum: {
    QueryInterface: xpcom_generateQI([Ci.nsISimpleEnumerator]),
    getNext: function() { return null; },
    hasMoreElements: function() { return false; }
  }
};

function xpcom_generateQI(iids) {
  var checks = [];
  for each (var iid in iids) {
    checks.push("Ci." + iid.name + ".equals(iid)");
  }
  var iid = function(){
      if (checks.length > 0) {
          if (checks.join(" || ")){
              return this;
          }
      }
      throw Components.results.NS_ERROR_NO_INTERFACE;
  };
  return iid;
  /**
   * Access to the `Function` property is deprecated for security or other reasons.
   *
   */
  //var src = checks.length ? "if (" + checks.join(" || ") + ") return this;\n"  : "";
  //return new Function("iid", src + "throw Components.results.NS_ERROR_NO_INTERFACE;");
}


/**
	RedirectListener: old stuff, marked to be removed.
*/
function RedirectListener(oldChannel, newChannel) {
    this.originalListener = null;
	this.oldChannel = oldChannel;
	this.newChannel = newChannel;
}

RedirectListener.prototype ={
oldChannel: null,
newChannel: null,
originalListener: null,


 onDataAvailable: function(request, context, inputStream, offset, count){},
 onStartRequest: function(request, context) {
	//this.oldChannel.cancel(NS_BINDING_ABORTED);
	//this.newChannel.asyncOpen(this.originalListener, null);
 },
    onStopRequest: function(request, context, statusCode){},
    QueryInterface: function (aIID) {
        if (aIID.equals(Ci.nsIStreamListener) || aIID.equals(Ci.nsISupports)) {
            return this;
        }
        throw Components.results.NS_NOINTERFACE;
    }
}


/**
	The main module.
*/
function HttpFilter(){
	prefs = prefserv.getBranch("extensions.notrace.");
	isisNoTraceShare.isisNoTraceSharedObjects.whitelist.initDB();
}

HttpFilter.prototype = {
	classDescription: NAME,
	classID:          Components.ID(COMPONENT_ID),
	contractID:       PROG_ID,
	dbLSconn: null,
	foStream: null,
	// Array of whitelist domain
	arrayOfWhitelistElements: null,
	// hash to check whenever an url it has already altered by the nofingerprinting techniques
	hashOfVisitedLink: new Object(),
	// This one store the fake information sent to each domain, in order to be coherent when lying
	hashOfDomain: new Object(),
	// This hash keep track of site for which the identifying HTTP headere were stripepd out.
	hashOfDomainForNoIdHeader: new Object(),
	//aggiunto da FI
	arrayOfWhitelistCDN: null,
	// Three costants to use when new resources are added to the logger
	arrayNOCOOKIE: ["nocookie"],
	arrayNO3COOKIE: ["no3cookie"],
	arrayNOFINGERPRINTING: ["nofingerprinting"],
	
	prefs: prefserv.getBranch("extensions.notrace."),
	//*********************Implements the nsISupports interface*******************
	QueryInterface: XPCOMUtils.generateQI([Ci.nsIHttpFilter, Ci.nsIObserver]),
	//*********************End implementation of the nsISupports interface*******************
	//*********************Implements the nsIObserver interface*******************
	observe: function(subject, topic, data) {
		/**
			Get the whitelilst and the CDN list, and then check the topic that we subscribed for that have been triggered.
			If we just have been set-up register for http-on-modify-request and http-on-examine-response
			Otherwise check which techniques can be applied.
		*/
		this.arrayOfWhitelistElements=isisNoTraceShare.isisNoTraceSharedObjects.whitelist.getList();
		//aggiunto da FI
		this.arrayOfWhitelistCDN=isisNoTraceShare.isisNoTraceSharedObjects.whitelist.getCDNList();
		
		if(topic == "http-on-modify-request") {
			/**
				Take the channel
			*/
			var httpChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
			
			/**
				Those two line were used to debug
			*/
			logpref = prefs.getBoolPref("logenabled");
			if(logpref) this.initLogger();
			
			if(logpref){
				if (httpChannel.loadFlags & httpChannel.LOAD_INITIAL_DOCUMENT_URI) {
					var uri = httpChannel.URI.spec;
					var towrite = "\n"+uri+"\n";
					this.foStream.write(towrite,towrite.length);
				}
			}
			
			var host = null;
			try{ host = httpChannel.getRequestHeader("Host"); }
			catch(ex){}
			
			this.reqOrig = host;
			var loc_domain = isisNoTraceShare.isisNoTraceSharedObjects.domain.getDomain(host);
			
			/**
				Check the whitelist and the CDN List
			*/
			this.whitelisted = 0;
			for (curdomain in this.arrayOfWhitelistElements){
				if(this.arrayOfWhitelistElements[curdomain]==loc_domain){
					this.whitelisted=1;
					break;
				}
			}
			
			//aggiunto da FI
			if(this.whitelisted==0){
				for (curdomain in this.arrayOfWhitelistCDN){
					if(this.arrayOfWhitelistCDN[curdomain]==loc_domain){
						this.whitelisted=1;
						break;
					}
				}
			}
			
			var recentWindow = winMed.getMostRecentWindow("navigator:browser");
			if (recentWindow!=null) {
				/*var document = recentWindow.document;
				var menupopup = recentWindow.document.getElementById("notraceaddons-statusbar-menupopup");
				
				var child = menupopup.childNodes;
				var numchild = child.length;
				
				var ce = 0;
				
				for(var i=0;i<numchild;i++){
					var current = child.item(i);
					var valueAttr = current.getAttribute("value")
					if(valueAttr == loc_domain){
						ce = 1;
						break;
					}
				}
				/*valueAttr=null;
				current=null;
				numchild=null;
				child=null;
				recentWindow=null;
				if( (ce==0) && (this.whitelisted==0) ){
					/*var menuitem = document.createElement("menuitem");
					menuitem.setAttribute("id","notrace-"+loc_domain);
					menuitem.setAttribute("value",loc_domain);
					menuitem.setAttribute("label",isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("add.label")+" "+loc_domain+" "+isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("towhitelist.label"));
					menuitem.addEventListener("click", function (event) {isisNoTraceShare.isisNoTraceSharedObjects.whitelist.addToWhiteList(loc_domain);}, false); 
					menupopup.appendChild(menuitem);
					menuitem=null;
				}*/
			}
			/**
				Call noidheader and then nofingerprinting and frre some memory
			*/
			this.noidheader(httpChannel);
			this.nofingerprinting(httpChannel);
			httpChannel=null;
			loc_domain=null;
			host=null;
		}
		
		if(topic == "http-on-examine-response") {
			/**
				Take the channel
			*/
			var httpChannel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
			
			/**
				Those two line were used to debug
			*/
			logpref = prefs.getBoolPref("logenabled");
			if(logpref) this.initLogger();
			
			var host = null;
			try{ host = httpChannel.getRequestHeader("Host"); }
			catch(ex){}
			var loc_domain = isisNoTraceShare.isisNoTraceSharedObjects.domain.getDomain(host);
			this.whitelisted = 0;
			/**
				Check the whitelist and the CDN List
			*/
			for (curdomain in this.arrayOfWhitelistElements){
				if(this.arrayOfWhitelistElements[curdomain]==loc_domain){
					this.whitelisted=1;
					break;
				}
			}
			
			//aggiunto da FI
			if(this.whitelisted==0){
				for (curdomain in this.arrayOfWhitelistCDN){
					if(this.arrayOfWhitelistCDN[curdomain]==loc_domain){
						this.whitelisted=1;
						break;
					}
				}
			}
			
			
			/**
				Check if the domain is already present in the whitelist, if it is not add the possible domains to add ( the one displayed when pressing on the icon in the addons bar)
			*/
			var recentWindow = winMed.getMostRecentWindow("navigator:browser");
			var document = recentWindow.document;
			var menupopup = recentWindow.document.getElementById("notraceaddons-statusbar-menupopup");
			if (menupopup != null){
			    var child = menupopup.childNodes;
                var numchild = child.length;
                
                var ce = 0;
                
                for(var i=0;i<numchild;i++){
                    var current = child.item(i);
                    var valueAttr = current.getAttribute("value")
                    if(valueAttr == loc_domain){
                        ce = 1;
                        break;
                    }
                }
                valueAttr=null;
                current=null;
                numchild=null;
                child=null;
                recentWindow=null;
                host=null;
                if( (ce==0) && (this.whitelisted==0) ){
                    var menuitem = document.createElement("menuitem");
                    menuitem.setAttribute("id","notrace-"+loc_domain);
                    menuitem.setAttribute("value",loc_domain);
                    menuitem.setAttribute("label",isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("add.label")+" "+loc_domain+" "+isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("towhitelist.label"));
                    menuitem.addEventListener("click", function () { isisNoTraceShare.isisNoTraceSharedObjects.whitelist.addToWhiteList(loc_domain) }, false); 
                    menupopup.appendChild(menuitem);
                    menuitem=null;
                }
			}
			/**
				Invoke nocookie e no3cookie and free the memory
			*/
			this.nocookie(httpChannel);
			this.no3cookie(httpChannel);
			httpChannel=null;

		}
		if(topic == "profile-after-change") {
			var os = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
			os.addObserver(this, "http-on-modify-request", false);
			os.addObserver(this, "http-on-examine-response", false);
		}
	},
	//*********************End implementation of the nsIObserver interface*******************
	/**
		Auxiliary function to obtain the domain of a URL
	*/
	getDomain2 : function(url){
		var host = this.getServer(url);
		//var hostsplit = host.split(".");
		//var hsl = hostsplit.length;
		//var domain = hostsplit[hsl-2]+"."+hostsplit[hsl-1];
		host=null;
		hostsplit=null;
		hsl=null;
		return host;
		//return domain;
	},
	getServer: function(url){
		var urlsplit = url.split("/");
		var host = urlsplit[0];
		if (host.toLowerCase()=="https:" || host.toLowerCase()=="http:") {
			host=urlsplit[2];
		}
		if (host.match("/^www\./gi")) {
			host=host.substring(4);
		}
		urlsplit=null;
		return host;
	},
	/**
		The five subsequent module are support function for the cookie techniques.
	*/
	dividiCookie: function(testo) {
		var sp = testo.split(";")
		var len = sp.length;
		for(var i=0;i<len;i++){
			var cursp = sp[i];
			sp[i] = cursp.replace(/\s/i,"");
		}
		len=null;
		cursp=null;
		return sp;
	},
	dividiSetCookie: function(testo) {
		var sp = testo.split("\n")
		var len = sp.length;
		var cursp;
		for(var i=0;i<len;i++){
			cursp = sp[i];
			sp[i] = cursp.replace(/\s/i,"");
		}
		len=null;
		cursp=null;
		return sp;
	},
	getCookieName: function(header) {
		var sp = header.split(";")
		var name = sp[0];
		sp=null;
		return name;
	},
	//Function written by FI
	getCookieValue: function(cookieValue,tipologia,host,referer){
		var cookies=new Array();
		var arrayCook=new Array();
		if(tipologia=="Cookie"){
			cookies=this.dividiCookie(cookieValue);
			var clen = cookies.length;
			var curcookie;
			var cookiename;
			for(var i=0;i<clen;i++){
				curcookie = cookies[i];
				cookiename = this.getCookieName(curcookie);
				if(/path|domain|expires|httponly/gi.test(cookiename)!=true){
					arrayCook.push(cookiename);
				}
			}
			curcookie=null;
			cookiename=null;
			clen=null;
		}
		else
			if(tipologia=="Set-Cookie"){
				cookies=this.dividiSetCookie(cookieValue);
				var clen = cookies.length;
				var curcookie;
				var cookiename;
				for(var i=0;i<clen;i++){
					curcookie = cookies[i];
					cookiename = this.getCookieName(curcookie);
					if(/path|domain|expires|httponly/gi.test(cookiename)!=true){
						arrayCook.push(cookiename);
					}
				}
				curcookie=null;
				cookiename=null;
				clen=null;
			}
		cookies=null;
		return arrayCook;
	},
	//Function written by FI	
	getListCookie: function(cookieValue){
		var cookies=new Array();
		var singCoppie="init";
		var arrayCookie;
		
		cookies=this.dividiSetCookie(cookieValue);
		var clen = cookies.length;
		for(var i=0;i<clen;i++){
			// Reads all the line for the cookie
			var curcookie = cookies[i];
			// Split in pairs
			var spCoppia = curcookie.split(";");
			var coppiaLen = cookies.length;
			
			for(var j=0;j<coppiaLen;j++){
				var currCoppiaCookie = spCoppia[j];
				
				// Split in the pair of type name=value
				if(currCoppiaCookie!=null || currCoppiaCookie!=undefined)
					arrayCookie=currCoppiaCookie.split("=");
				else
					continue;
			
				if(arrayCookie.length!=0 && arrayCookie!=null){
					if(/path|domain|expires|httponly/gi.test(arrayCookie[0])!=true){
						if(singCoppie=="init")
							singCoppie=currCoppiaCookie;
						else{	
							singCoppie+=";"+currCoppiaCookie;
						}
					}
					else
						continue;
				}
				else
					continue;
			}
		}
		return singCoppie;
	},
	/**
		This method is used to add the blocked object to the respective panel.
	*/
	addBlocked: function(resource,tech,host) {
		var winmed = winMed.getMostRecentWindow("navigator:browser");
		var doc = winmed.document;
		
		var treecellObj = doc.createElement("treecell");
		treecellObj.setAttribute("label",resource);

		var treecellTech = doc.createElement("treecell");
		treecellTech.setAttribute("label",isisNoTraceShare.isisNoTraceSharedObjects.resources_type[tech]);
		
		var treerow = doc.createElement("treerow");
		treerow.appendChild(treecellObj);
		treerow.appendChild(treecellTech);

		var treeitem = doc.createElement("treeitem");
		treeitem.setAttribute("class",host);
		treeitem.setAttribute("hidden","false");
		
		treeitem.appendChild(treerow);		
		var treechildren = doc.getElementById("notraceaddons-blocked-list-children");
		treechildren.appendChild(treeitem);
		
		winmed=null;
		doc=null;
		treecellObj=null;
		treecellTech=null;
		treerow=null;
		treeitem=null;
		treechildren=null;	
	},
	/**
		Blocks all cookies, denying the Set-Cookie HTTP Response header
	*/
	nocookie: function(httpChannel) {
		// Cookie in the HTTP Request field
		var contentCookieReq = null;
		try{
			contentCookieReq = httpChannel.getRequestHeader("Cookie");
		}
		catch(ex){}
		
		// Cookie in the HTTP Response field
		var cookie = null;
		try{
			cookie = httpChannel.getResponseHeader("Set-Cookie");
		}
		catch(ex){}
		
		// Header host in the HTTP Request
		var host = null;
		try{
			host = httpChannel.getRequestHeader("Host"); 
		}
		catch(ex){}

		// Referer header in the HTTP Request
		var referer = null;
		try{ 
			referer = httpChannel.getRequestHeader("Referer"); 
		}
		catch(ex){}
		
		var cReqValue=new Array();
		if(contentCookieReq!=null){
			cReqValue=this.getCookieValue(contentCookieReq,"Cookie",host,referer);
		}
		if(cookie != null){
			var ref = null;
			try{ ref = httpChannel.getRequestHeader("Referer"); }
			catch(ex){}
			
			var hostsplit = host.split(".");
			var hsl = hostsplit.length;
			var objDomain = hostsplit[hsl-2]+"."+hostsplit[hsl-1];
			var refDomain = null;
			if(ref!=null)
				refDomain = isisNoTraceShare.isisNoTraceSharedObjects.domain.getDomain(ref);
					
			if(refDomain==null) refDomain=objDomain;
			var cResValue=new Array();
			var nocookieactive = prefs.getBoolPref("technique.nocookie");
			if (!this.whitelisted) {
				isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.insertResourceInMemory(refDomain,cookie,"Set-Cookie",refDomain,objDomain,this.getTime(),this.NOCOOKIE, false, null);
				if(nocookieactive){
					try{
						cResValue=this.getCookieValue(cookie,"Set-Cookie",host,referer);	
						this.checkDBLocalStorage_Cookies(host,referer,cResValue);
						httpChannel.setResponseHeader("Set-Cookie", "", false);
						if(referer != null) var page = referer;
						else var page = "http://"+host+"/";
						this.addBlocked("Set-Cookie header: "+cookie,"nocookie",page);
						page=null;
					}
					catch(ex){}
				}
			}
			// Modified by FI	
			var listCookie=this.getListCookie(cookie);	
			// Modified by FI
			if(listCookie!=null)
				isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.insertResourceInMemory(refDomain,listCookie,"",refDomain,objDomain,this.getTime(),null, false, null);
			hostsplit=null;
			hsl=null;
			objDomain=null;
			refDomain=null;
			ref=null;
			nocookieactive=null;
			cResValue=null;
			cReqValue=null;
			referer=null;
			host=null;
			cookie=null;
			contentCookieReq=null;
		}
	},
	
	//Function written by FI	
	initDBLSConnection: function() {
		if (this.dbLSconn==null) {
			var file = Components.classes["@mozilla.org/file/directory_service;1"]
					.getService(Components.interfaces.nsIProperties)
					.get("ProfD", Components.interfaces.nsIFile);
				file.append("webappsstore.sqlite");
			var storageService = Components.classes["@mozilla.org/storage/service;1"].getService(Components.interfaces.mozIStorageService);
			this.dbLSconn = storageService.openDatabase(file);
			file=null;
			storageService=null;
		}
		return this.dbLSconn;
	},
		
	//Function written by FI	
	checkDBLocalStorage_Cookies: function(objDomain,refDomain,resultCookieName){
		var dbLSconn=this.initDBLSConnection();
		if(dbLSconn==null)
			isisLogWrapper.logToConsole("Error trying to connect to the localstorage DB");
			
		//Strip out all the url appended paramenters and revers the string
		if(objDomain!=null){
			objDomain=this.changeURL(objDomain);
			objDomain=objDomain.split("").reverse().join("");
		}
		else
			objDomain="";
			
		if(refDomain!=null){
			refDomain=this.changeURL(refDomain);
			refDomain=refDomain.split("").reverse().join("");
		}
		else 
			refDomain="";
		
		for(var i=0;i<resultCookieName.length;i++){
			var selectStatement=dbLSconn.createAsyncStatement("DELETE FROM webappsstore2 WHERE scope LIKE "+quote(objDomain+"%")+" OR scope LIKE "+quote(refDomain+"%")+" AND key="+quote(resultCookieName[i]));
			selectStatement.executeAsync({
				handleResult: function(aResultSet) {
				},
				handleError: function(aError) {
					isisLogWrapper.logToConsole("Error: " + aError.message);
				},
				handleCompletion: function(aReason) {
					if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED)
						isisLogWrapper.logToConsole("Query canceled or aborted!");
				}
			});
		}	
		dbLSconn=null;
	},

	//Function written by FI	
	changeURL: function(requestOrigin){
		var re1 = new RegExp('(http(s)?(:)*([0-9])*(//)*)','ig');
		var re2 = new RegExp('((.:)?)$');
		var re3 = new RegExp('((www)([0-9])*.|(http(s)?(:)*(//)*)|^(ww([0-9])*.))','gi');
		var re4 = new RegExp('/((\\S+)*)','gi');
		
		if(re1.test(requestOrigin))
			requestOrigin=requestOrigin.replace(re1,"");
		
		if(re2.test(requestOrigin))
			requestOrigin=requestOrigin.replace(re2,"");
		
		if(re3.test(requestOrigin))
			requestOrigin=requestOrigin.replace(re3,"");
			
		if(re4.test(requestOrigin))
			requestOrigin=requestOrigin.replace(re4,"");

		re1=null;
		re2=null;
		re3=null;
		re4=null;
		return requestOrigin;
	},
	//Function written by FI	
	//Blocks all third party cookies by removing the Set-Cookie header
	no3cookie: function(httpChannel) {
		var host = null;
		try{
			host = httpChannel.getRequestHeader("Host");
		}
		catch(ex){}

		var cookie = null;
		try{
			cookie = httpChannel.getResponseHeader("Set-Cookie");
		}
		catch(ex){}
		if(cookie!=null) {
			var ref = null;
			try{
				ref = httpChannel.getRequestHeader("Referer");
			}
			catch(ex){}
			
			if(ref!=null){
				var hostsplit = host.split(".");
				var hsl = hostsplit.length;
				var objDomain = hostsplit[hsl-2]+"."+hostsplit[hsl-1];
				var refDomain = isisNoTraceShare.isisNoTraceSharedObjects.domain.getDomain(ref);
				if(refDomain!=objDomain){
					if (!this.whitelisted){
						isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.insertResourceInMemory(refDomain,cookie,"Set-Cookie",refDomain,objDomain,this.getTime(),this.NO3COOKIE, false, null);
						if(prefs.getBoolPref("technique.no3cookie")){
							var cResValue=new Array();
							cResValue=this.getCookieValue(cookie,"Set-Cookie",objDomain,refDomain);	
							this.checkDBLocalStorage_Cookies(objDomain,refDomain,cResValue);
							httpChannel.setResponseHeader("Set-Cookie", "", false);
							if(ref != null) var page = ref;
							else var page = "http://"+host+"/";
							this.addBlocked("Set-Cookie header: "+cookie,"no3cookie",page);
							page=null;
							cResValue=null;
						}
					}
				}
				refDomain=null;
				objDomain=null;
				hsl=null;
				hostsplit=null;
				ref=null;
				
			}
			cookie=null;
			host=null;
		}
	},
	/**
		If the request is for a third party resource, check if the URL embed fingerprinting information and in this case, alter those information
		Meanwhile change even the User Agent string
	*/
	nofingerprinting: function(httpChannel) {
		var full_URL=httpChannel.URI.spec;
		var loc_domain=isisNoTraceShare.isisNoTraceSharedObjects.domain.getDomain(httpChannel.URI.spec);
		var referer = null;
      	try{ referer = httpChannel.getRequestHeader("Referer"); }
      	catch(ex){}
		var reqOrig_domain = referer==null?loc_domain:isisNoTraceShare.isisNoTraceSharedObjects.domain.getDomain(referer);
		var isno3obj = (loc_domain != reqOrig_domain);
		var no3objactive = prefs.getBoolPref("technique.nofingerprinting");
		var temp=httpChannel.URI.spec;
		if(isno3obj && (isisNoTraceShare.isisNoTraceSharedObjects.regular_expression.regexp_fingerprinting.test(temp) || isisNoTraceShare.isisNoTraceSharedObjects.regular_expression.regexp_fingerprinting_1.test(temp))){
			//techArray.push("nofingerprinting");
			if(no3objactive){
				if (this.hashOfVisitedLink.hasOwnProperty(temp)) {
					return;
				}
				var newURL=httpChannel.URI.clone();
				var reg = new RegExp("([&;])(utmsr|sr|WT\.sr|sc\_r|j|brscrsz|scr)=(\\d+)x(\\d+)");
				var regCD = new RegExp("([&;])(utmsc|cd|WT\.cd|sc\_d)=(\\d+)");
				reg.test(temp);
				//isisLogWrapper.logToConsole("Found: "+RegExp.$1+RegExp.$2+"="+RegExp.$3+"x"+RegExp.$4);
				if (!this.hashOfDomain.hasOwnProperty(loc_domain)) {
					var obj=new Object();
					temp=temp.replace(reg, RegExp.$1+RegExp.$2+"="+this.getRandomScreenResolution(RegExp.$3+"x"+RegExp.$4));
					reg.test(temp);
					obj["sr"]=RegExp.$3+"x"+RegExp.$4;
					temp=temp.replace(regCD, RegExp.$1+RegExp.$2+"="+this.getRandomColorDepth(RegExp.$3));
					regCD.test(temp);
					obj["cd"]=RegExp.$3;
					//isisLogWrapper.logToConsole(obj["sr"]+"+++++++++++"+loc_domain+"++++++++++++"+obj["cd"]);
					this.hashOfDomain[loc_domain]=obj;
				}
				else {
					var obj=this.hashOfDomain[loc_domain];
					//isisLogWrapper.logToConsole(obj["sr"]+"----------------"+loc_domain+"--------------------"+obj["cd"]);
					temp=temp.replace(reg, RegExp.$1+RegExp.$2+"="+obj["sr"]);
					temp=temp.replace(regCD, RegExp.$1+RegExp.$2+"="+obj["cd"]);
				}
				newURL.spec=temp;
				this.hashOfVisitedLink[temp]=new Object();
				// Check for the new internal redirect API. If it exists, use it.
				if ("redirectTo" in httpChannel) {
					//isisLogWrapper.logToConsole("Found nsIHttpChannel.redirectTo. Using it.");
					try {
						httpChannel.redirectTo(newURL);
					} catch(e) {
					// This should not happen. We should only get exceptions if the channel was already open.
					isisLogWrapper.logToConsole("Exception on nsIHttpChannel.redirectTo: "+e);
					}
				}
				//else {isisLogWrapper.logToConsole("Not found nsIHttpChannel.redirectTo. Could not use it.");}
				if ("nsITraceableChannel" in Ci) {
					var rc = new RedirectChannel(httpChannel, newURL);
					rc.redirect(true, null);
					rc.open();
					this.addBlocked(isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("alertfingerprinting.label")+" "+loc_domain,"nofingerprinting",loc_domain);
				}
				else {isisLogWrapper.logToConsole("Not found ChannelReplacement.redirectTo. Could not use it.");}
				httpChannel.cancel(Cr.NS_ERROR_ABORT);
			}
		}
		var host = null;
      	try{ host = httpChannel.getRequestHeader("Host"); }
      	catch(ex){}
      	
      	var referer = null;
      	try{ referer = httpChannel.getRequestHeader("Referer"); }
      	catch(ex){}
		var useragent = null;
      	try{ useragent = httpChannel.getRequestHeader("User-Agent"); }
      	catch(ex){}
		var hostsplit = host.split(".");
      	var hsl = hostsplit.length;
      	var objDomain = hostsplit[hsl-2]+"."+hostsplit[hsl-1];
      	var refDomain = null;
      	if(referer!=null)
      		refDomain = isisNoTraceShare.isisNoTraceSharedObjects.domain.getDomain(referer);
      		
		if(refDomain==null) refDomain=objDomain;
		if(isno3obj && useragent!=null){ 
			isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.insertResourceInMemory(refDomain,useragent,"User-Agent",refDomain,objDomain,this.getTime(),this.arrayNOFINGERPRINTING, false, null);
		}
		if(isno3obj && prefs.getBoolPref("technique.nofingerprinting") && (!this.whitelisted)){
			if(referer != null) var page = referer;
			else var page = "http://"+host+"/";
			if(useragent!=null){
				try{
					var temp=this.getRandomUA(useragent);
					httpChannel.setRequestHeader("User-Agent", temp, false);
					//this.addBlocked("User-Agent header changed to: "+temp,"nofingerprinting",loc_domain);
				}
				catch(ex){}
			}
			page=null;
		}	
	},
	/**
		Remove User-Agent, From, Referer and Cookie header fields, it first check if they are persent and add them to the logger and then check user preferences to remove those header.
	*/
	noidheader: function(httpChannel) {
      	var host = null;
      	try{ host = httpChannel.getRequestHeader("Host"); }
      	catch(ex){}
      	
      	var referer = null;
      	try{ referer = httpChannel.getRequestHeader("Referer"); }
      	catch(ex){}
      	
      	var useragent = null;
      	try{ useragent = httpChannel.getRequestHeader("User-Agent"); }
      	catch(ex){}
      	
      	var from = null;
      	try{ from = httpChannel.getRequestHeader("From"); }
      	catch(ex){}
      	
      	var cookie = null;
      	try{ cookie = httpChannel.getRequestHeader("Cookie"); }
      	catch(ex){}
      	
		var hostsplit = host.split(".");
      	var hsl = hostsplit.length;
      	//var objDomain = hostsplit[hsl-2]+"."+hostsplit[hsl-1];
		var objDomain = host;
      	var refDomain = null;
      	if(referer!=null)
      		refDomain = this.getDomain2(referer);
      		
		if(refDomain==null) refDomain=objDomain;
		
		if(referer!=null){ 
			var hostForReferer=referer;
			hostForReferer=hostForReferer.replace(/^http(s)?:\/\//gi,"");
			hostForReferer=hostForReferer.replace(/^www\./gi,"");
			hostForReferer=hostForReferer.replace(/(.*?)\/.*/gi,"$1");
			if (host != hostForReferer) {
				isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.insertResourceInMemory(refDomain,referer,"Referer",refDomain,objDomain,this.getTime(), null, true, null);
				//this.log("[Referer HTTP header field]","noidheader");
			}
		}
		if(useragent!=null){ 
			isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.insertResourceInMemory(refDomain,useragent,"User-Agent",refDomain,objDomain,this.getTime(),null, false, null);
			//this.log("[User-Agent HTTP header field]","noidheader");
		}
		if(from!=null){ 
			isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.insertResourceInMemory(refDomain,from,"From",refDomain,objDomain,this.getTime(),null, false, null); 
			//this.log("[From HTTP header field]","noidheader");
		}
		if(cookie!=null){
			/*var cookies = this.dividiCookie(cookie)
			var clen = cookies.length;
			var curCookie;
			var cookiename;
			for(var i=0;i<clen;i++){
				curCookie = cookies[i];
				cookiename = this.getCookieName(curCookie);
				isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.insertResourceInMemory(refDomain,cookiename,"Cookie",refDomain,objDomain,this.getTime(),null, false, null);
				//this.log("[Cookie HTTP header field]","noidheader");
			}
			cookiename=null;
			curCookie=null;
			clen=null;
			cookies=null;*/
			isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.insertResourceInMemory(refDomain,cookie,"Cookie",refDomain,objDomain,this.getTime(),null, false, null);
			cookies=null;
		}
		refDomain=null;
		objDomain=null;
		hsl=null;
		hostsplit=null;
		

		if(prefs.getBoolPref("technique.noidheader") && (!this.whitelisted)){
			if(referer != null) var page = referer;
			else var page = "http://"+host+"/";
			if(useragent!=null){
				try{
					if (!this.hashOfDomainForNoIdHeader.hasOwnProperty(host)) {
						var obj=new Object();
						this.hashOfDomainForNoIdHeader[host]=obj;
					}
					httpChannel.setRequestHeader("User-Agent", "", false);
					this.addBlocked("User-Agent header for domain "+host+": "+useragent,"noidheader",page);
				}
				catch(ex){}
			}
			if(from!=null){
				try{
					httpChannel.setRequestHeader("From", "", false);
					this.addBlocked("From header: "+from,"noidheader",page);
				}
				catch(ex){}
			}
			if(referer!=null){
				try{
					var hostForReferer=referer;
					hostForReferer=hostForReferer.replace(/^http(s)?:\/\//gi,"");
					hostForReferer=hostForReferer.replace(/^www\./gi,"");
					hostForReferer=hostForReferer.replace(/(.*?)\/.*/gi,"$1");
					httpChannel.setRequestHeader("Referer", "", false);
					if (host != hostForReferer) {
						this.addBlocked("Referer header: "+referer,"noidheader",page);
					}
					
				}
				catch(ex){}
			}
			if(cookie!=null){
				try{
					httpChannel.setRequestHeader("Cookie", "", false);
					this.addBlocked("Cookie header: "+cookie,"noidheader",page);
				}
				catch(ex){}
			}
			page=null;
		}	
		cookie=null;
		from=null;
		useragent=null;
		referer=null;
		host=null;
	},
	/**
		It returns a random User Agent string that is different from the original value
	*/
	getRandomUA: function(old_useragent){
		var ua=old_useragent;
		while (ua==old_useragent) {
			ua=isisNoTraceShare.isisNoTraceSharedObjects.getRandomUA();
		}
		return ua;
	},
	/**
		It returns a random Screen resolution string that is different from the original value
	*/
	getRandomScreenResolution: function(old_sr) {
		var sr=old_sr;
		while (sr==old_sr) {
			sr=isisNoTraceShare.isisNoTraceSharedObjects.getRandomScreenResolution();
		}
		return sr;
	},
	/**
		It returns a random Color Depth that is different from the original value
	*/
	getRandomColorDepth: function(old_cd) {
		var cd=old_cd;
		while (cd==old_cd) {
			cd=isisNoTraceShare.isisNoTraceSharedObjects.getRandomColorDepth();
		}
		return cd;
	},
	/**
		It is used only for debug
	*/
	initLogger: function() {
		if(this.foStream == null){
			var file = Components.classes["@mozilla.org/file/directory_service;1"]
				.getService(Components.interfaces.nsIProperties)
				.get("ProfD", Components.interfaces.nsIFile);
			var path = prefs.getCharPref("logfilepath");
			file.initWithPath(path);
			this.foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
			this.foStream.QueryInterface(Components.interfaces.nsIOutputStream);
			this.foStream.QueryInterface(Components.interfaces.nsISeekableStream);
			this.foStream.init(file, 0x02 | 0x10 | 0x40, 777, 0);
			path=null;
			file=null;
		}
	},
	/*log: function(res,tech) {
		if(logpref){
			var towrite = res+" - "+this.reqOrig+" - "+tech+"\n";
			this.foStream.write(towrite,towrite.length);
			
		}
	},*/
	/**
		An Auxiliary function to get the time
	*/	
	getTime: function() {
		var date = new Date();
		var day = date.getDate();
		var month = date.getMonth()+1;
		var year = date.getFullYear();
		var daylen = day.toString().length;
		var monthlen = month.toString().length;
		if(daylen==1) day = 0+""+day;
		if(monthlen==1) month = 0+""+month;
		var time = year+""+month+""+day;
		date=null;
		day=null;
		month=null;
		year=null;
		daylen=null;
		monthlen=null;
		return time;
	}
};

var components = [HttpFilter];
var categoryManager = Cc["@mozilla.org/categorymanager;1"].getService(Ci.nsICategoryManager);
try {
   categoryManager.addCategoryEntry("app-startup", "HttpFilter", "@unisa.it/httpfilter;1", false, true);
} catch (anError) {
	aConsoleService.logStringMessage("ERROR: " + anError);
}

var NSGetFactory = XPCOMUtils.generateNSGetFactory(components);

function escapeHTML(str) {
	if (!isNaN(parseInt(str))){return str;}
	str.replace(/[&"<>]/g, function (m) escapeHTML.replacements[m]);
	return str;
}
escapeHTML.replacements = { "&": "&amp;", '"': "&quot", "<": "&lt;", ">": "&gt;" };
function quote(str){ return "\"" + str.replace(/"/g, "'") + "\"";}
