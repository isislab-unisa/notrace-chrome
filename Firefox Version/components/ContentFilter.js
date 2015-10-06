const Ci = Components.interfaces;
const Cc = Components.classes;
const Cu = Components.utils;
const Cr = Components.results;

const VERSION = "2.0";
const PROG_ID = "@unisa.it/contentfilter;1";
const COMPONENT_ID = "{2e608a18-0b5b-11dc-8314-0800200c9a66}";
const NAME = "ContentFilter";
const allow = Components.interfaces.nsIContentPolicy.ACCEPT;
const block = Components.interfaces.nsIContentPolicy.REJECT_REQUEST;

Cu.import("resource://notrace/common.js");
Cu.import("resource://notrace/isisNoTraceSharedObjects.js");
Cu.import("resource://notrace/isisLogWrapper.js");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
const prefserv = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
const winMed = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
const aConsoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
const alertsService = Components.classes['@mozilla.org/alerts-service;1'].getService(Components.interfaces.nsIAlertsService);
const promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);

// Returns "WINNT" on Windows Vista, XP, 2000, and NT systems;
// "Linux" on GNU/Linux; and "Darwin" on Mac OS X.
var os = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;

isisNoTraceShare.isisNoTraceSharedObjects.installDB();
isisNoTraceShare.isisNoTraceSharedObjects.listManager.init();
//isisNoTraceShare.isisNoTraceSharedObjects.regular_expression.init();

//var randomnumber=Math.floor(Math.random()*101);	
//createALLRequests();
//createLogFile();
ContentFilter = function(){
		prefs=prefserv.getBranch("extensions.notrace.");
		this.register();
};

ContentFilter.prototype = {
	classDescription: NAME,
	classID:          Components.ID(COMPONENT_ID),
	contractID:       PROG_ID,
	//*********************Implements the nsISupports interface*******************
	QueryInterface: XPCOMUtils.generateQI([Ci.nsIContentFilter, Ci.nsIObserver,Ci.nsIContentPolicy]),
	//*********************End implementation of the nsISupports interface*******************
	strmr: null,
	strm: null,
	docsArray: new Array(),
	flag: true,
	foStream: null,
	knowSecure3objDomain: new Array(),
	prefs: prefserv.getBranch("extensions.notrace."),
	jsonToSend: null,
	jsonToSendAdList: null,
	//aggiunto da FI
	arrayOfWhitelistCDN: null,
	k: 1,
	//*********************Implements the nsIObserver interface*******************
	observe: function(subject, topic, data) {
		if (topic=="quit-application") {
			this.initDB();
			// Flush all the pending request to log resources into the DB
			//isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.flushEverything();
			// Send the feedback
			this.checkDateAndSendFeedBack();
		}
		/**this.docsArray is used to check the url filtered in order to avoid duplicates
		It has to be flushed after a DOM is destroyed (close a tab/windows or simply change page or load a link/URL)
		*/
		if (topic=="dom-window-destroyed") {
			this.docsArray=[];
		}
	},
	//*********************End implementation of the nsIObserver interface*******************
	register: function() {
		/**
		Interested in 
			profile-after-change: to check and eventually apply all the techinques
			quit-application: to send feedback
			dom-window-destroyed: to clean this.docsArray
		*/
		var observerService = Components.classes["@mozilla.org/observer-service;1"]
							  .getService(Components.interfaces.nsIObserverService);
		observerService.addObserver(this, "profile-after-change", false);
		observerService.addObserver(this, "quit-application", false);
		observerService.addObserver(this, "dom-window-destroyed", false);
	},
	unregister: function() {
		var observerService = Components.classes["@mozilla.org/observer-service;1"]
								.getService(Components.interfaces.nsIObserverService);
		observerService.removeObserver(this, "profile-after-change");
		observerService.removeObserver(this, "quit-application");
		observerService.removeObserver(this, "dom-window-destroyed");
	},
	//*********************Implements the nsIContentPolicy interface*******************
	shouldProcess: function(contentType, contentLocation, requestOrigin, context, mimeType, extra){
		return allow;
	},
	shouldLoad:	function(contentType, contentLocation, requestOrigin, context, mimeTypeGuess, extra){
		/**
		Check the requestOrigin URL and load the whitelist and the CDNList
		*/
		var location = contentLocation.spec;
		var reqOrig="";
		try{ reqOrig = requestOrigin.spec;} //isisLogWrapper.logToConsole(contentType+"---"+location+"----"+reqOrig+"---"+context);
		catch(ex){//isisLogWrapper.logToConsole("requestOrigin is not valid");
		}
		this.knowSecure3objDomain=isisNoTraceShare.isisNoTraceSharedObjects.whitelist.getList();
		//aggiunto da FI
		this.arrayOfWhitelistCDN=isisNoTraceShare.isisNoTraceSharedObjects.whitelist.getCDNList();
		//----------------------------------------
		if( (/^http/.test(location)) && !(/^chrome/.test(reqOrig)) && (reqOrig!=undefined)){
			/**
				If there is an address and it is a HTTP/HTTPS request and not a chrome URI, get the local domain and the requestorigin domain
			*/
			// These two lines of code were used only for debugging reasons
			//logpref = prefs.getBoolPref("logenabled");
			//if(logpref) this.initLogger();
			var loc_domain = isisNoTraceShare.isisNoTraceSharedObjects.domain.getDomain(location);
			var reqOrig_domain = isisNoTraceShare.isisNoTraceSharedObjects.domain.getDomain(reqOrig);
			// whitelist and flag are used in conjuction to check for the whitelist
			var whitelisted = 0;
			var flag=0;
			// variables used to trace objects to block
			var toBlock = false;
			var tech = "";
			var techArray = new Array();
			// Web bug management that includes: first party Web bug, and Web bug from domains in the whitelist
			if(contentType == Components.interfaces.nsIContentPolicy.TYPE_IMAGE){
				//nowebbug
				try{
					var attr = context.attributes;
					var width = attr.getNamedItem("width");
					var height = attr.getNamedItem("height");
					var widthval = width.value;
					var heightval = height.value;
				}
				catch(ex){
					var widthval = null;
					var heightval = null;
				}
				//var third = (loc_domain != reqOrig_domain);
				var isnowebbug = ( ((widthval==0)&&(heightval==0)) || ((widthval==1)&&(heightval==1)) || ((widthval==2)&&(heightval==2)));
				if(isnowebbug){
					techArray.push("nowebbug");
				}
				var nowebbugactive = prefs.getBoolPref("technique.nowebbug");
				if(nowebbugactive && isnowebbug){
					toBlock = true;
					tech = "nowebbug";
					whitelisted=-1;
					flag=1;
				}	
			}
			for (curdomain in this.knowSecure3objDomain){
				if(this.knowSecure3objDomain[curdomain]==loc_domain){
					whitelisted++;
					break;
				}
			}
			
			//aggiunto da FI
			if(whitelisted!=1){
				for (curdomain in this.arrayOfWhitelistCDN){
					if(this.arrayOfWhitelistCDN[curdomain]==loc_domain){
						whitelisted++;
						break;
					}
				}
			}
			
			var recentWindow = winMed.getMostRecentWindow("navigator:browser");
			if (recentWindow!=null) {
				var document = recentWindow.document;
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
				if( (ce==0) && ((whitelisted<0) || (whitelisted==0 && flag==0)) ){
					/*var menuitem = document.createElement("menuitem");
					menuitem.setAttribute("id","notrace-"+loc_domain);
					menuitem.setAttribute("value",loc_domain);
					menuitem.setAttribute("label",isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("add.label")+" "+loc_domain+" "+isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("towhitelist.label"));
					//menuitem.setAttribute("id",loc_domain);
					menuitem.addEventListener("click", function (event) {isisNoTraceShare.isisNoTraceSharedObjects.whitelist.addToWhiteList(loc_domain);}, false); 
					menupopup.appendChild(menuitem);
					this.knowSecure3objDomain=isisNoTraceShare.isisNoTraceSharedObjects.whitelist.getList();
					menuitem=null;*/
				}
				current=null;
				valueAttr=null;
				ce=null;
				numchild=null;
				child=null;
			}
			recentWindow=null;
			/**
				isno3obj is true for third party objects
			*/
			var isno3obj = (loc_domain != reqOrig_domain);
			/**
				Here it comes the notop technique: 
					it checks for the prerequisite and if they stand it pushes the name of the techniques into the array techArray
					if the techniques is active is flags this url to be blocked using toBlock and tech
			*/
			/*var isnotop = this.notop(loc_domain) && isno3obj;
			var notopactive = prefs.getBoolPref("technique.notop");
			if(isnotop){
				techArray.push("notop");
			}
			if(notopactive && isnotop){
					toBlock = true;
					tech = "notop";
			}
			notopactive=null;
			isnotop=null;*/
			/**
				Here it comes the noad technique: 
					it checks for the prerequisite and if they stand it pushes the name of the techniques into the array techArray
					if the techniques is active is flags this url to be blocked using toBlock and tech
			*/
			var regexp_noCSS = new RegExp("\\.css");
			var isnoad = this.noad(location);
			var noadactive = prefs.getBoolPref("technique.noad")
			if(isnoad){
				techArray.push("noad");
			}
			if((noadactive && isnoad) && (!regexp_noCSS.test(location))){
					toBlock = true;
					tech = "noad";
			}
			/**
				Here it comes the no3pe technique: 
					it checks for the prerequisite and if they stand it pushes the name of the techniques into the array techArray
					if the techniques is active is flags this url to be blocked using toBlock and tech
			*/
			var no3objactive = prefs.getBoolPref("technique.no3pe");
			if(isno3obj && (isisNoTraceShare.isisNoTraceSharedObjects.regular_expression.regexp_malicious.test(location))){
				techArray.push("no3pe");
				if((no3objactive) && (!regexp_noCSS.test(location))){
					toBlock = true;
					tech = "no3pe";
				}	
			}
			no3objactive=null;
			noadactive=null;
			isnoad=null;
			/**
				Here it comes the no3objnoid technique: 
					it checks for the prerequisite and if they stand it pushes the name of the techniques into the array techArray
					if the techniques is active is flags this url to be blocked using toBlock and tech
			*/
			var tpoid = false;
			tpoid = this.no3objnoid(location);
			var isno3objnoid = ((isno3obj==true) && (tpoid==true));
			var no3objnoidactive = prefs.getBoolPref("technique.no3objnoid");
			if(isno3objnoid){
				techArray.push("no3objnoid");
			}
			if((no3objnoidactive && isno3objnoid) && (!regexp_noCSS.test(location))){
				toBlock = true;
				tech = "no3objnoid";
			}
			no3objnoidactive=null;
			isno3objnoid=null;
			tpoid=null;
			if(contentType == Components.interfaces.nsIContentPolicy.TYPE_IMAGE){
				/**
					Here it comes the noimg technique: 
						it checks for the prerequisite and if they stand it pushes the name of the techniques into the array techArray
						if the techniques is active is flags this url to be blocked using toBlock and tech
				*/
				techArray.push("noimg");
				var noimgactive = prefs.getBoolPref("technique.noimg");
				if(noimgactive){
					toBlock = true;
					tech = "noimg";
				}
				/**
					Here it comes the no3img technique: 
						it checks for the prerequisite and if they stand it pushes the name of the techniques into the array techArray
						if the techniques is active is flags this url to be blocked using toBlock and tech
				*/
				var isno3img = (loc_domain != reqOrig_domain);
				var no3imgactive = prefs.getBoolPref("technique.no3img");
				if(isno3img){
					techArray.push("no3img");
				}
				if( (no3imgactive) && isno3img){
					toBlock = true;
					tech = "no3img";
				}
				noimgactive=null;
				isno3img=null;
				no3imgactive=null;
			}
			else if(contentType == Components.interfaces.nsIContentPolicy.TYPE_SCRIPT){
				/**
					Here it comes the nojs/no3js/no3hiddenobj techniques: 
						it checks for the prerequisite and if they stand it pushes the name of the techniques into the array techArray
						if the techniques is active is flags this url to be blocked using toBlock and tech
				*/
				techArray.push("nojs");		
				var isScript=true;
				var isHidden=false;
				var i=0;
				var isScriptVer= new Array();
				isScriptVer = this.isScriptHidden();
				var escaped=null;
				var regexp_noHiddenScript=null;
				while(isScript && i<isScriptVer.length){
					//isisLogWrapper.logToConsole("SCRIPTLIST: "+i+"-----"+isScriptVer.length+"-----"+isScriptVer[0]);
					escaped = isScriptVer[i];
					escaped = escape(escaped);
					regexp_noHiddenScript = new RegExp("\/"+escaped+"[^a-zA-Z]|\/"+escaped+"$");
					if(regexp_noHiddenScript.test(location)){
						techArray.push("no3hiddenobj");	
						isScript=false;	
						isHidden=true;
						}
					i=i+1;
				}
				var no3hiddenactive = prefs.getBoolPref("technique.no3hiddenobj");
				var nojsact = prefs.getBoolPref("technique.nojs");
				if((no3hiddenactive || nojsact) && isHidden){
						toBlock = true;
						tech = "no3hiddenobj";
				}
				try{
					var attr = context.attributes;
					var type = attr.getNamedItem("type");
					var language = attr.getNamedItem("language");
					var typeval = type.value;
					var langval = language.value;
				}
				catch(ex){
					var typeval = null;
					var langval = null;
				}
				// no3js
				var exp = /javascript/i;
				var isjs = ( exp.test(typeval) || exp.test(langval) || ((typeval==null)&&(langval==null)) )
				var third = (loc_domain != reqOrig_domain);
				var isno3js = (isjs && third);
				if(isno3js){
					techArray.push("no3js");
				}
				var no3jsactive = prefs.getBoolPref("technique.no3js");
				var nojsactive = prefs.getBoolPref("technique.nojs");
				if( (no3jsactive || nojsactive) && isno3js){
					if(!isHidden){
						toBlock = true;
						tech = "no3js";
					}
					else{
						toBlock = true;
						tech = "no3hiddenobj";
					}
				}
				nojsactive=null;
				no3jsactive=null;
				isno3js=null;
				third=null;
				isjs=null;
				exp=null;
				langval=null;
				typeval=null;
				language=null;
				type=null;
				attr=null;
				nojsact=null;
				no3hiddenactive=null;
				regexp_noHiddenScript=null;
				escaped=null;
				isScriptVer=null;
				i=null;
				isHidden=null;
				isScript=null;
			}
			var locationPc = "";
			/**
				Check whetever the URL has to be blocked.
					If it is not whitelisted, it checks if it has been already blocked, if so, return block.
					If not, if there is at least onie techinques that can block the URL, insert the resource in the logger and then
						If it have to be blocked, update the docsArray, and add the resource to the panel of blocked object and return block, otherwise return allow.
				Finally free some memory.
			*/
			var techlen = techArray.length;
			if(whitelisted<=0){
				if (this.docsArray[location] != undefined) {
					return block;
				}
				if(techlen!=0){
					if(locationPc != "")
						isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.insertResourceInMemory(reqOrig_domain,locationPc,"",reqOrig_domain,loc_domain,this.getTime(),techArray, false, reqOrig);
					else
						isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.insertResourceInMemory(reqOrig_domain,location,"",reqOrig_domain,loc_domain,this.getTime(),techArray, false, reqOrig);
					/**
					* This piece of code needs to be removed. It was used to write in the log file. Only for debugging reasons.
					*/
					/*if(this.flag){
					var server = this.getServer(location);
					if(locationPc != "")
						var towrite = locationPc+" - " + server + " -";
					else				
						var towrite = location+" - " + server + " -";
					for(var i=0;i<techlen;i++){
						towrite = towrite+" "+techArray[i];					
					}				
					towrite = towrite+"\n";
					//logReq(towrite);
					}*/
				}
				if(toBlock){
					//isisLogWrapper.debugToConsole("DO NOT LOAD" + location + "BECAUSE OF "+tech);
					if(this.docsArray[location] == undefined){  
						this.docsArray[location] = 1;
					}
					else{
						this.docsArray[location]++;
					}
					var winmed = winMed.getMostRecentWindow("navigator:browser");
					var doc = winmed.document;
					
					var treecellObj = doc.createElement("treecell");
					treecellObj.setAttribute("label",location);
					
					var treecellTech = doc.createElement("treecell");
					treecellTech.setAttribute("label",isisNoTraceShare.isisNoTraceSharedObjects.resources_type[tech]);
		
					var treerow = doc.createElement("treerow");
					treerow.appendChild(treecellObj);
					treerow.appendChild(treecellTech);
		
					var treeitem = doc.createElement("treeitem");
					treeitem.setAttribute("class",reqOrig);
					treeitem.setAttribute("hidden","false");

					treeitem.appendChild(treerow);
					
					var treechildren = doc.getElementById("notraceaddons-blocked-list-children");
					treechildren.appendChild(treeitem);
					
					treechildren=null;
					treeitem=null;
					treerow=null;
					treecellTech=null;
					treecellObj=null;
					doc=null;
					winmed=null;
					tech=null;
					toBlock=null;
					return block;
				}
				else {
					toBlock=null;
					return allow;
				}
			}//end if(whitelisted==0)
			techlen=null;
			locationPc=null;
			techArray=null;
		}
		location=null;
		reqOrig=null;
		loc_domain=null;
		reqOrig_domain=null;
		tech=null;
		whitelisted=null;
		return allow;
	},
	//*********************End implementation of the nsIContentPolicy interface*******************
	/**
		This piece of code was used only debugging reasons
	*/
	initLogger: function(){
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
	getTime: function(){
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

	/**
		The core function of the notop technique, it check a regular expression.
	*/
	notop: function(domain){
		if(isisNoTraceShare.isisNoTraceSharedObjects.regexp_domanins.test(domain))
			return true;
		
		return false;
	},
	/**
		The core function of the noad technique, it check two regular expressions.
	*/
	noad: function(url){
		var myList=isisNoTraceShare.isisNoTraceSharedObjects.adlist.getList();
		var regexp_noad;
		regexp_noad = new RegExp(myList[0]);
		var urlsplit = url.split("/");
		urlsplit.splice(0,2);
		var temp="/"+urlsplit.join("/");
		if (regexp_noad.test(temp)) {
			regexp_noad=null;
			myList=null;
			urlsplit=null;
			temp=null;
			return true;
		}
		myList=isisNoTraceShare.isisNoTraceSharedObjects.adlist.getPersonalList();
		if (myList=="") {
			return false;
		}
		regexp_noad = new RegExp(myList);
		if (regexp_noad.test(temp)) {
			regexp_noad=null;
			myList=null;
			urlsplit=null;
			temp=null;
			return true;
		}
		regexp_noad=null;
		myList=null;
		urlsplit=null;
		temp=null;
		return false;
	},
	/**
		The core function of the no3objnoid technique, it check a regular expression.
	*/
	no3objnoid: function(url){
		var regexp_no3objnoid = new RegExp("[\?=&]");
		var str=this.knowSecure3objDomain[0];
		for (var i=0;i<this.knowSecure3objDomain.length;i++){
			str=str+"|"+this.knowSecure3objDomain[i];
		}
		var regexp_secure = new RegExp(str);
		str=null;
		if(regexp_no3objnoid.test(url)) {
			if (regexp_secure.test(url)){
				regexp_secure=null;
				return false;
			}
			regexp_secure=null;
			return true;
		}
		return false;
	},
	/**
		The core function of the noflashcookie technique, It removes all the lso file from the local directory, it works on Linux, Window and Mac
	*/
	noflashcookie: function(){
		var filePath;
		var appData = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("AppData", Components.interfaces.nsIFile);
		appData.append("Macromedia");
		appData.append("Flash Player");
		appData.append("#SharedObjects");
		filePath=appData.path;
		var appData2 = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("AppData", Components.interfaces.nsIFile);
		appData2.append("Macromedia");
		appData2.append("Flash Player");
		appData2.append("macromedia.com");
		appData2.append("support");
		appData2.append("flashplayer");
		apPData2.append("sys");
		var settingsFilePath=appData2.path;
		filePath = appData.path;
		settingsFilePath =  appData2.path;
		try {
			var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
			file.initWithPath(filePath);
			file.remove(true);  
			file=null;			
		} catch(ex) {}	   
		try {
			var settingsFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
			settingsFile.initWithPath(settingsFilePath);
			var cance = settingsFile.remove(true);   		  
		} catch(ex) {}
		appData2=null;
		appData=null;
		filePath=null;
		settingsFilePath=null;
		return cance;
	},
	/**
		The core function of the nohiddenobj technique, It check a regular expression
	*/
	isScriptHidden: function(ind){
		return isisNoTraceShare.isisNoTraceSharedObjects.scriptlist.getList();
	},
	/**
		Code useless, it is marked to be removed
	*/
	countScriptList: function(){
		isisNoTraceShare.isisNoTraceSharedObjects.scriptlist.initDB();
		return isisNoTraceShare.isisNoTraceSharedObjects.scriptlist.getCountOfScript();
	},
	/**
		Check the user preferences regarding the feedback and in case the preferences is set to true, is construct the string to send and make an XHR request
	*/
	checkDateAndSendFeedBack: function(){
		var feedback=isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("feedback");
		var feedbacktype=isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("feedbacktype");
		var adListFeedback=isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("AdListfeedback");
		if (feedback) {
			this.updateDataPreview(!feedbacktype);
			this.send(jsonToSend);
		}
		if (adListFeedback) {
			this.updateAdListDataPreview();
			this.sendAdList(jsonToSend);
		}
		feedback=null;
		feedbacktype=null;
	},
	toHexString: function(charCode){
		return ("0" + charCode.toString(16)).slice(-2);
	},
	/**
		Update the feedback panel, to show users, the data they could send to us.
	*/
	updateDataPreview: function(notAnonymous){
		// start to construct the json string
		jsonToSend="{";
		jsonToSend+=notAnonymous?"\"notanonymized\":":"\"anonymized\":";
		jsonToSend+="{";
		var sep="";
		var elements=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getHashtableForTechniques();
		var origins = new Object();
		var requestOrigin = null;
		var num_orig = 0;
		for (var elem in elements) {
			requestOrigin = elem;
			if (!origins.hasOwnProperty(requestOrigin)) {
				origins[requestOrigin]=requestOrigin;
				var treechildren = document.getElementById("feedback-list");
				var origin = document.createElement("treeitem");
				origin.setAttribute("container",true);
				origin.setAttribute("open",false);
				var originrow = document.createElement("treerow");
				var origincell = document.createElement("treecell");
				var temp = requestOrigin;
				if (!notAnonymous) {
					var hash = Components.classes["@mozilla.org/security/hash;1"].createInstance(Components.interfaces.nsICryptoHash);
					var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
					converter.charset = "UTF-8";
					var result = {};
					hash.init(hash.SHA1);
					var data = converter.convertToByteArray(temp, result);
					hash.update(data, data.length);
					var t = hash.finish(false);
					temp = [this.toHexString(t.charCodeAt(i)) for (i in t)].join("");
					hash=null;
					converter=null;
					result=null;
					data=null;
					t=null;
				}
				var sep2="";
				var value;
				var str;
				jsonToSend+=sep+'"'+temp+'"'+":{";
				for (var key in elements[elem]){
					var value = elements[elem][key].length;
					var str=key;
					jsonToSend+=sep2+'"'+str+'"'+":"+value;
					sep2=",";
				}
				sep2=null;
				value=null;
				str=null;
				jsonToSend+="}";
				sep=",";
				temp=null;
			}
		}
		jsonToSend+="}}";
		sep=null;
	},
	/**
		Create the data they could send to us regarding the personal adlist.
	*/
	updateAdListDataPreview: function(){
		// start to construct the json string
		jsonToSend="{";
		jsonToSend+="\"adlist\":";
		jsonToSend+="{";
		var sep="";
		var myList=isisNoTraceShare.isisNoTraceSharedObjects.adlist.getPersonalList();
		var requestOrigin = null;
		for (var elem in myList) {
			requestOrigin = myList[elem];
			var temp = requestOrigin;
			var value;
			var str;
			jsonToSend+=sep+'"'+temp+'"';
			sep=",";
		}
		jsonToSend+="}}";
		sep=null;
	},
	/**
		Send the feedback data, the data they could send to us.
	*/
	send: function (data){
		const XMLHttpRequest = Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1");
		var req = XMLHttpRequest();
		var dest = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getCharPref("feedbackurl");
		req.open("POST", dest, true);
		req.setRequestHeader("Content-Type", "text/plain");
		req.addEventListener("loadend", function(){
				if (req.status==200){
					isisNoTraceShare.isisNoTraceSharedObjects.alertsService.showAlertNotification("chrome://notrace/content/imgs/info_24.png", "INFO", isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("feedbacksent.label"), false, "", null, "");
					req=null;
				}
			},
			false);
		req.send(data);
		dest=null;
	},
	/**
		Send the personalized adlist data, the data they could send to us.
	*/
	sendAdList: function (data){
		const XMLHttpRequest = Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1");
		var req = XMLHttpRequest();
		var dest = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getCharPref("adListFeedbackurl");
		req.open("POST", dest, true);
		req.setRequestHeader("Content-Type", "text/plain");
		req.addEventListener("loadend", function(){
				if (req.status==200){
					isisNoTraceShare.isisNoTraceSharedObjects.alertsService.showAlertNotification("chrome://notrace/content/imgs/info_24.png", "INFO", isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("feedbacksent.label"), false, "", null, "");
					req=null;
				}
			},
			false);
		req.send(data);
		dest=null;
	}
};


function escape(text) {
	return text.replace(/[-\\{}()*+?.,\\^$|#\s]/g, "\\$&");
}

function createALLRequests(){
	if(this.strmr == null){
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("Home", Components.interfaces.nsIFile);
		file.append("AllRequests"+randomnumber+".txt");
		if(file.exists() == false) {
			file.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420);
		}
		this.strmr = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
		this.strmr.QueryInterface(Components.interfaces.nsIOutputStream);
		this.strmr.QueryInterface(Components.interfaces.nsISeekableStream);
		this.strmr.init( file, 0x02 | 0x10 | 0x40 | 0x20, -1, 0 );
		file=null;
	}
}

function createLogFile(){
	if(this.strm == null){
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("Home", Components.interfaces.nsIFile);
		file.append("LogFile"+randomnumber+".txt");
		if(file.exists() == false) {
			file.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420);
		} 
		this.strm = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
		this.strm.QueryInterface(Components.interfaces.nsIOutputStream);
		this.strm.QueryInterface(Components.interfaces.nsISeekableStream);
		this.strm.init( file, 0x02 | 0x10 | 0x40 | 0x20, -1, 0 );
		file=null;
	}
}

//Log into the file ALLRequests.txt
function logRequests(req2){
	this.strmr.write(req2,req2.length);
}

function logReq(requests){
	this.strm.write(requests,requests.length);
}

var components = [ContentFilter];
var categoryManager = Cc["@mozilla.org/categorymanager;1"]
                      .getService(Ci.nsICategoryManager);
try {
	categoryManager.addCategoryEntry("content-policy", "@unisa.it/contentfilter;1", "@unisa.it/contentfilter;1", false, true);
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
