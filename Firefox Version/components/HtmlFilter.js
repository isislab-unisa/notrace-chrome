/*
 * Implements nojs, nojscookie, nometacookie, nometaredirect, nonoscript
 */
const Ci = Components.interfaces;
const Cc = Components.classes;
const Cu = Components.utils;
const Cr = Components.results;

const VERSION = "2.0";
const PROG_ID = "@unisa.it/htmlfilter;1";
const COMPONENT_ID = "{305f5aba-3c5f-11dc-8314-0800200c9a66}";//CID
const NAME = "HtmlFilter";

Cu.import("resource://notrace/common.js");
Cu.import("resource://notrace/isisNoTraceSharedObjects.js");
Cu.import("resource://notrace/isisLogWrapper.js");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
//aggiunto da FI
Cu.import("resource://gre/modules/FileUtils.jsm");
const prefserv = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
const winMed = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
const aConsoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);

// Helper function for XPCOM
function CCIN(cName, ifaceName) {
    return Cc[cName].createInstance(Ci[ifaceName]);
}

// Copy response listener implementation.
function TracingListener() {
    this.originalListener = null;
    this.receivedData = [];
	this.data=null;
	isisNoTraceShare.isisNoTraceSharedObjects.whitelist.initDB();
}

TracingListener.prototype ={
	prefs: prefserv.getBranch("extensions.notrace."),
	foStream: null,
	requestHost: null,
	reqOrig: null,
	arrayNOJSCOOKIE: ["nojscookie"],
	arrayNONOSCRIPT: ["nonoscript"],
	//aggiunto da FI
	arrayOfWhitelistCDN: null,

	/**
		When data ara available, take the stream, apply the techniques and return the altered stream
	*/
	onDataAvailable: function(request, context, inputStream, offset, count){
        var binaryInputStream = CCIN("@mozilla.org/binaryinputstream;1","nsIBinaryInputStream");
        var storageStream = CCIN("@mozilla.org/storagestream;1", "nsIStorageStream");
        var binaryOutputStream = CCIN("@mozilla.org/binaryoutputstream;1","nsIBinaryOutputStream");

        binaryInputStream.setInputStream(inputStream);
        storageStream.init(8192, count, null);
        binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));
		
        /**
			Copy received data as they come in an array receiveData.
		*/
        var dat = binaryInputStream.readBytes(count);
        this.receivedData.push(dat);
		
		var httpChannel = request.QueryInterface(Components.interfaces.nsIHttpChannel);
		this.reqOrig = httpChannel.getRequestHeader("Host");
		this.requestHost = this.getDomain(this.reqOrig);

		logpref = prefs.getBoolPref("logenabled");
		this.arrayOfWhitelistElements=isisNoTraceShare.isisNoTraceSharedObjects.whitelist.getList();
		if(logpref) 
			this.initLogger();
		
		/**
			Check the whitelist and the CDN list
		*/
		//aggiunto da FI
		this.arrayOfWhitelistCDN=isisNoTraceShare.isisNoTraceSharedObjects.whitelist.getCDNList();
		
		
		this.whitelisted = 0;
		for (curdomain in this.arrayOfWhitelistElements){
			if(this.arrayOfWhitelistElements[curdomain]==this.requestHost){
				this.whitelisted=1;
				break;
			}
		}
		
		//aggiunto da FI
		if(this.whitelisted==0){
			for (curdomain in this.arrayOfWhitelistCDN){
				if(this.arrayOfWhitelistCDN[curdomain]==this.requestHost){
					this.whitelisted=1;
					break;
				}
			}
		}
		
		/**
			If a particular techniques is enabled, apply it
		*/
		this.data=dat;
		if(prefs.getBoolPref("technique.nojscookie")&& (!this.whitelisted)){
			this.data=this.BlockJSCookie();
		}
		
		if(prefs.getBoolPref("technique.nonoscript")&& (!this.whitelisted)){
			this.data=this.BlockNoscripts();
		}
		/**
			Write data back
		*/
		var size=this.data.length;
		binaryOutputStream.writeBytes(this.data,size);
		
		try {  
				this.originalListener.onDataAvailable(request, context,storageStream.newInputStream(0), offset,size);
			}
		catch (e) {  
			isisLogWrapper.logToConsole("ERROR: "+e.name+"-"+e.message);   
		} 
		size=null;
		httpChannel=null;
		dat=null;
		binaryOutputStream=null;
		storageStream=null;
		binaryInputStream=null;
	},
	onStartRequest: function(request, context) {
		 try{		
				this.originalListener.onStartRequest(request, context);
			}
		catch (e) {  
			//isisLogWrapper.logToConsole("ERROR2: "+e.name+"-"+e.message);  
		} 
    },
	onStopRequest: function(request, context, statusCode){
        var responseSource = this.receivedData.join();
		 try{
				this.originalListener.onStopRequest(request, context, statusCode);
			}
		catch (e) {  
			isisLogWrapper.logToConsole("ERROR: "+e.name+"-"+e.message);
		} 
		responseSource=null;
		this.data=null;
    },
    QueryInterface: function (aIID) {
        if (aIID.equals(Ci.nsIStreamListener) || aIID.equals(Ci.nsISupports)) {
            return this;
        }
        throw Components.results.NS_NOINTERFACE;
    },
	
	/**
		Inspect the stream to find all possible SCRIPT tag and remove the access to cookie and referer.
	*/
	BlockJSCookie: function() {
		var temp = this.data;
		var exp = /javascript/i;
		var exp1 = /type\s?=\s?['"]?text\/javascript/i;
		var exp2 = /language\s?=\s?['"]?javascript/i;
		var scripts = this.getStartTagElements("script");
		if(scripts != null){
			var num_scripts = scripts.length;
			var re1 = new RegExp("<script[^>]*>","i");
			var re2 = new RegExp("</script[^>]*>","i");
			for(var j=0;j<num_scripts;j++){
				var sti = temp.search(re1);
				if(sti != -1){
					var eti = temp.search(re2);
					var tagLen = 9;
					var sub = "var NOTRACE_SANITIZED=new Array();var NOTRACE_STRING_SANITIZED=''; "+temp.substring(sti,eti+tagLen);
					var type = sub.match(exp1);
					var lang = sub.match(exp2);
					if( exp.test(lang) || exp.test(type) || ((type==null)&&(lang==null))){
						var sub2 = sub.replace(/document.cookie/,"NOTRACE_SANITIZED");
						var sub3 = sub2.replace(/document.referrer/,"NOTRACE_STRING_SANITIZED");
						if( prefs.getBoolPref("technique.nojscookie") && (!this.whitelisted)){
							if(sub3 != sub){
								this.data = this.data.replace(sub,sub3);
								//this.addBlocked(isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("nojscookie.label"),"nojscookie","<script> element setting cookie");
							}
						}
						if(sub2 != sub){
							isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.insertResourceInMemory(requestHost,isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("nojscookie.label"),"",this.requestHost,this.requestHost,this.getTime(),this.arrayNOJSCOOKIE, false, null);
							this.addBlocked(isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("nojscookie.label"),"nojscookie","<script> element setting cookie");
						}
					}
				}
			}
		}
		return this.data;
	},
	/**
		Auxiliary function for manage the HTML tag
	*/
	getStartTagElements: function(tagName) {
		var re = new RegExp("<"+tagName+"[^>]*/?>\\s?(</"+tagName+">)?","gi");
		var elements = null;
		elements = this.data.match(re);
		return elements;
	},
	
	//Function written by FI, it removes JS file cantaining cookie in their name
	CheckExternalJSCookie: function(){
		var temp = this.data;
		var re = new RegExp("<script[^>]*/?>\\s?</script>","gi");
		var re2= new RegExp(">\\s?</script>",'gi');
		var scripts = temp.match(re);
	
		if(scripts!=null){
			var init ;
			var src =/src=[\'\"]?(.*.js)[\'\"]?/i;
			var prova=/cookie/i;
			var end;
			var tagLen;
			var sub;
			for(var j=0;j<scripts.length;j++){
				init = temp.search(re);
				if(init != -1){
					end = temp.search(re2);
					tagLen = 10;
					sub = temp.substring(init,end+tagLen);
					temp = temp.replace(sub,"");
					if(src.test(sub) && prova.test(sub)){
						this.data = this.data.replace(sub,"");
						isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.insertResourceInMemory(requestHost,requestHost,sub,"",this.requestHost,this.requestHost,this.getTime(),this.arrayNOJSCOOKIE, false, null);
					}
				}
			}
			prova=null;
			src=null
			init=null;
			end=null;
			tagLen=null;
			sub=null;
		}
		
		//Final check on the substitution done earlier
		scripts = this.data.match(re);
		scripts=null;
		re2=null;
		re=null;
		temp=null;
		return this.data;	
	},
	
	/**
		Function written by FI, it removes every NoScript tag in the original HTML DOM
	*/
	BlockNoscripts: function() {
		var re = new RegExp("<noscript[^>]*>?",'gi');
		var noscripts = this.data.match(re);
		
		if(noscripts != null){
			var num_noscripts = noscripts.length;
			var re1 = new RegExp("<noscript[^>]*>?","i");
			var re2 = new RegExp("</noscript>","i");
			var tmp = this.data;
			var eti;
			var tagLen;
			var sub;
			var sti;
			for(var j=0;j<num_noscripts;j++){
				sti = tmp.search(re1);
				if(sti != -1){
					eti = tmp.search(re2);
					tagLen = 11;
					sub = tmp.substring(sti,eti+tagLen);
					tmp = tmp.replace(sub,"");
					this.addBlocked(sub,"nonoscript","<noscript> element");
					this.data = this.data.replace(sub,"");
					isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.insertResourceInMemory(requestHost,sub,"",this.requestHost,this.requestHost,this.getTime(),this.arrayNONOSCRIPT, false, null);
				}
			}
			sub=null;
			tagLen=null;
			eti=null;
			sti=null;
			tmp=null;
			re1=null;
			re2=null;
			num_noscripts=null;
		}
		noscripts=null;
		re=null;
		return this.data;
	},

	/**
		Used for debugging only
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
			this.foStream.init(file, 0x02 | 0x10 | 0x40, 0777, 0);
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
		Auxiliary function to handle time and domain
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
	},
	getDomain: function(url) {
		var sp = url.split(".");
		var sp_len = sp.length;
		var dom = sp[sp_len-2]+"."+sp[sp_len-1];
		sp_len=null;
		sp=null;
		return dom;
	},
	getHTTPDomain: function(url) {
		var sp = url.split("/")
		var name = sp[2];
		sp = name.split(".");
		var sp_len = sp.length;
		var dom = sp[sp_len-2]+"."+sp[sp_len-1];
		sp_len=null;
		sp=null;
		name=null;
		return dom;
	},
	
	/**
		Add the blocked resource to the panel
	*/
	addBlocked: function(resource,tech,label) {
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
		treeitem.setAttribute("class","http://"+this.reqOrig+"/");
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
	}
}
function HtmlFilter(){
	prefs = prefserv.getBranch("extensions.notrace.");
	isisNoTraceShare.isisNoTraceSharedObjects.whitelist.initDB();
}

HtmlFilter.prototype = {
	classDescription: NAME+ " " +VERSION,
	classID:          Components.ID(COMPONENT_ID),
	contractID:       PROG_ID,
	foStream: null,
	arrayOfWhitelistElements: null,
	data: null,
	arrayNOMETACOOKIE: ["nometacookie"],
	arrayNOMETAREDIRECT: ["nometaredirect"],
	arrayNOMETAREDIRECTANDCOOKIE: ["nometaredirectandcookie"],
	arrayNOJS: ["nojs"],
	//aggiunto da FI
	arrayOfWhitelistCDN: null,
	prefs: prefserv.getBranch("extensions.notrace."),
	//*********************Implements the nsISupports interface*******************
	QueryInterface: XPCOMUtils.generateQI([Ci.nsIHtmlFilter, Ci.nsIObserver]),
	//*********************End implementation of the nsISupports interface*******************
	//*********************Implements the nsIObserver interface*******************
	observe: function(subject, topic, data) {
		prefs = prefserv.getBranch("extensions.notrace.");
		if(topic == "html-aviable") {
			//isisLogWrapper.logToConsole("RECEIVED NOTIFICATION OF "+topic);
			this.arrayOfWhitelistElements=isisNoTraceShare.isisNoTraceSharedObjects.whitelist.getList();
			logpref = prefs.getBoolPref("logenabled");
			if(logpref) this.initLogger();
			var notifier = subject.QueryInterface(Ci.nsIHTMLNotifierNoTrace);
			this.data = data;
			this.reqOrig = notifier.getRequestHost();
			requestHost = this.getDomain(this.reqOrig);
			
			//aggiunto da FI
			this.arrayOfWhitelistCDN=isisNoTraceShare.isisNoTraceSharedObjects.whitelist.getCDNList();
					
			this.whitelisted = 0;
			for (curdomain in this.arrayOfWhitelistElements){
				if(this.arrayOfWhitelistElements[curdomain]==requestHost){
					this.whitelisted=1;
					break;
				}
			}
			
			//aggiunto da FI
			if(this.whitelisted==0){
				for (curdomain in this.arrayOfWhitelistCDN){
					if(this.arrayOfWhitelistCDN[curdomain]==requestHost){
						this.whitelisted=1;
						break;
					}
				}
			}
			
			var metaredirectandcookie = prefs.getBoolPref("technique.nometaredirectandcookie");
			var alljs = prefs.getBoolPref("technique.nojs");
			if (metaredirectandcookie) {
				this.BlockMetaRedirectAndCookie(requestHost);
			}
			if (alljs) {
				this.BlockAllJS();
			}
			/*var metaredirect = prefs.getBoolPref("technique.nometaredirect");
			var metacookie = prefs.getBoolPref("technique.nometacookie");
			var alljs = prefs.getBoolPref("technique.nojs");
			if (metaredirect) {
				this.BlockMetaRedirect(requestHost);
			}
			if (metacookie) {
				this.BlockMetaCookie();
			}
			if (alljs) {
				this.BlockAllJS();
			}*/
			alljs=null;
			metacookie=null;
			metaredirect=null;
			notifier.submitHTML(this.data);
			notifier=null;
		}

		
		//Function written by FI	
		if(topic == "http-on-examine-response") {
			var newListener = new TracingListener();
			subject.QueryInterface(Components.interfaces.nsITraceableChannel);
			newListener.originalListener = subject.setNewListener(newListener);
		}
		if(topic == "profile-after-change") {
			var os = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
			os.addObserver(this, "html-aviable", false);
			//Function written by FI	
			os.addObserver(this, "http-on-examine-response", false);
		}
	},
	//*********************End implementation of the nsIObserver interface*******************
	/**
	* Function that add a resource to the panel of blocked object
	**/
	addBlocked: function(resource,tech,label) {
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
		treeitem.setAttribute("class","http://"+this.reqOrig+"/");
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
			this.foStream.init(file, 0x02 | 0x10 | 0x40, 0777, 0);
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
	/*
	* Auxiliary function to manage time and domain
	**/
	getDomain: function(url) {
		var sp = url.split(".");
		var sp_len = sp.length;
		var dom = sp[sp_len-2]+"."+sp[sp_len-1];
		sp_len=null;
		sp=null;
		return dom;
	},
	getHTTPDomain: function(url) {
		var sp = url.split("/")
		var name = sp[2];
		sp = name.split(".");
		var sp_len = sp.length;
		var dom = sp[sp_len-2]+"."+sp[sp_len-1];
		sp_len=null;
		sp=null;
		name=null;
		return dom;
	},
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
	},
	/*
	* Remove the spaces from the stream
	*/
	noSpace: function(testo) {
		return testo.replace(/\s/g,"");
	},
	/*
	* tagName: string
	*
	* Returns every element (start element) "tagName" contained as an array of strings
	* Return null if no element "tagname" exists
	*/
	getStartTagElements: function(tagName) {
		var re = new RegExp("<"+tagName+"[^>]*/?>\\s?(</"+tagName+">)?","gi");
		var elements = null;
		elements = this.data.match(re);
		re=null;
		return elements;
	},
	/*
	* attribName: String
	* elements: Array of String
	*
	* Returns every attribute named "attribName" on elements of type "elements", as an array of strings
	* If no attribute exists pm this kind of element, returns null
	*/
	getAttributes: function(attribName, elements) {
		var exp1 = new RegExp(attribName+"\\s?=\\s?\"[^\"]*\"","i");
		var exp2 = new RegExp(attribName+"\\s?=\\s?'[^']*'","i");
		var exp3 = new RegExp(attribName+"\\s?=\\s?[^'\"]\[^>\\s]*[\\s>]","i");
		var num_elems = elements.length;
		var attributes = new Array();
		var cur_elem;
		var matchString;
		for(var i=0;i<num_elems;i++){
			cur_elem = elements[i];
			matchString = cur_elem.match(exp1);
			if(matchString==null){
				matchString = cur_elem.match(exp2);
				if(matchString==null){
					matchString = cur_elem.match(exp3);
				}
			}
			if(matchString!=null){
				var exprep1 = new RegExp(attribName+"=","i");
				var exprep2 = /(^\s)|(\s$)/g;
				var exprep3 = /(^")|("$)/g;
				var exprep4 = /(^')|('$)/g;
				var exprep5 = /(>$)/g;
				var attr = matchString.toString();
				attr = attr.replace(exprep1,"");
				attr = attr.replace(exprep2,"");
				attr = attr.replace(exprep3,"");
				attr = attr.replace(exprep4,"");
				attr = attr.replace(exprep5,"");
				attributes[i] = attr;
				exprep1=null;
				exprep2=null;
				exprep3=null;
				exprep4=null;
				exprep5=null;
			}
			else{
				attributes[i] = undefined;
			}
		}
		exp1=null;
		exp2=null;
		exp3=null;
		num_elems=null;
		
		cur_elem=null;
		matchString=null;
		return attributes;
	},
	/**
		Blocks all the HTTP META tag. It search for them and delete
	*/
	BlockMetaRedirectAndCookie: function(requestHost) {
		var expcookie = /cookie/i;
		var exp = /refresh/i;
		var meta_elems = this.getStartTagElements("meta");
		if(meta_elems != null){
			var num_meta_elems = meta_elems.length;
			var httpequiv = this.getAttributes("http-equiv",meta_elems);
			var content = new Array();
			num_meta = meta_elems.length;
			var cur_meta;
			var cur_httpequiv;
			var cur_content;
			for(var y=0;y<num_meta;y++)
				content[y] = meta_elems[y].match(/content\s*=\s*"\s*[^"]*"/i);
			for(var j=0;j<num_meta_elems;j++){
				cur_meta = new String(meta_elems[j]);
				cur_httpequiv = new String(httpequiv[j]);
				cur_content = new String(content[j]);
				if(cur_httpequiv != "undefined"){
					if( exp.test(cur_httpequiv) ){
						var index = cur_content.search(/http/);
						if(index != -1){
							content_len = cur_content.length;
							var url = cur_content.substring(index,content_len-1);
							sp = url.split("/");
							var host = sp[2];
							if (!host){
								sp = unescape(url).split("/");
								host = sp[2];
							}
							var sp = host.split(".");
							sp_len = sp.length;
							host = sp[sp_len-2]+"."+sp[sp_len-1];
							if( requestHost!=host ){
								if(prefs.getBoolPref("technique.nometaredirectandcookie") && (!this.whitelisted)){
									this.data = this.data.replace(cur_meta,"");
									this.addBlocked(cur_meta,"nometaredirectandcookie","<meta> element making redirect");
								}
								isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.insertResourceInMemory(requestHost,cur_meta,"",requestHost,requestHost,this.getTime(),this.arrayNOMETAREDIRECTANDCOOKIE, false, null);
							}
							host=null;
							sp=null;
						}
						index=null;
					}
					if( expcookie.test(cur_httpequiv) ){
						if(prefs.getBoolPref("technique.nometaredirectandcookie") && (!this.whitelisted)){
							this.data = this.data.replace(cur_meta,"");
							this.addBlocked(cur_meta,"nometaredirectandcookie","<meta> element setting cookie");
						}
						isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.insertResourceInMemory(requestHost,cur_meta,"",requestHost,requestHost,this.getTime(),this.arrayNOMETAREDIRECTANDCOOKIE, false, null);
					}
				}
			}
			cur_content=null;
			cur_httpequiv=null;
			num_meta_elems=null;
		}
		meta_elems=null;
		exp=null;
	},
	/**
		Blocks all the JS tag script present in the DOM. It search for script tag and replace them with nothing
	*/
	BlockAllJS: function() {
		var exp = /javascript/i;
		var exp1 = /type\s?=\s?['"]?text\/javascript/i;
		var exp2 = /language\s?=\s?['"]?javascript/i;
		var scripts = this.getStartTagElements("script");
		if(scripts != null){
			var srcAttrs = this.getAttributes("src",scripts);
			var num_scripts = scripts.length;
			var re1 = new RegExp("<script","i");
			var re2 = new RegExp("</script>","i");
			var tmp = this.data;
			var sti;
			for(var j=0;j<num_scripts;j++){
				sti = tmp.search(re1);
				if(sti != -1){
					var eti = tmp.search(re2);
					var tagLen = 9;
					var sub = tmp.substring(sti,eti+tagLen);
					var type = sub.match(exp1);
					var lang = sub.match(exp2);
					if( exp.test(lang) || exp.test(type) || ((type==null)&&(lang==null))){
						tmp = tmp.replace(sub,"");
						if(prefs.getBoolPref("technique.nojs") && (!this.whitelisted)){
							this.data = this.data.replace(sub,"");
							this.addBlocked(sub,"nojs","<script> element");
						}
					srcAttr = srcAttrs[j];
					if(srcAttr==undefined)
						isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.insertResourceInMemory(requestHost,sub,"",requestHost,requestHost,this.getTime(),this.arrayNOJS, false, null);
					}
					lang=null;
					type=null;
					sub=null;
					tagLen=null;
					eti=null;
				}
				sti=null;
			}
			tmp=null;
			re2=null;
			re1=null;
			num_scripts=null;
			srcAttrs=null;
		}
		exp=null;
		exp1=null;
		exp2=null;
		scripts=null;
	}
};

var components = [HtmlFilter];
var categoryManager = Cc["@mozilla.org/categorymanager;1"].getService(Ci.nsICategoryManager);
try {
   categoryManager.addCategoryEntry("app-startup", "HtmlFilter", "@unisa.it/htmlfilter;1", false, true);
} catch (anError) {
	isisLogWrapper.logToConsole("ERROR: " + anError);
}

var NSGetFactory = XPCOMUtils.generateNSGetFactory(components);

function escapeHTML(str) {
	if (!isNaN(parseInt(str))){return str;}
	str.replace(/[&"<>]/g, function (m) escapeHTML.replacements[m]);
	return str;
}
escapeHTML.replacements = { "&": "&amp;", '"': "&quot", "<": "&lt;", ">": "&gt;" };
function quote(str){ return "\"" + str.replace(/"/g, "'") + "\"";}
