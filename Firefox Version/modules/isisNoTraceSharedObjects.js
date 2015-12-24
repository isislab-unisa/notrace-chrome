var EXPORTED_SYMBOLS = [];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://notrace/common.js");
Cu.import("resource://notrace/isisLogWrapper.js");
Cu.import("resource://notrace/IOUtils.js");


isisNoTraceShare.isisNoTraceSharedObjects = {

	prefserv: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService),
	prefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.notrace."),
	prompts: Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService),
	alertsService: Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService),
	winMed: Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator),
	STATE_STOP: Components.interfaces.nsIWebProgressListener.STATE_STOP,
	STATE_START: Components.interfaces.nsIWebProgressListener.STATE_START,
	initialized: false,
	_dbconn_local_storage: null,
	//checkIdHeaderStatement: null,
	//insertIdHeaderStatement: null,
	//updateIdHeaderStatement: null,
	//checkSetCookieStatement: null,
	//updateSetCookieStatement: null,
	completeTechArray: new Array(),
	UAList: ["Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US) AppleWebKit/527  (KHTML, like Gecko, Safari/419.3) Arora/0.6 (Change: )","Mozilla/5.0 (Windows; U; ; en-NZ) AppleWebKit/527  (KHTML, like Gecko, Safari/419.3) Arora/0.8.0","Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Avant Browser; Avant Browser; .NET CLR 1.0.3705; .NET CLR 1.1.4322; Media Center PC 4.0; .NET CLR 2.0.50727; .NET CLR 3.0.04506.30)","Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/535.8 (KHTML, like Gecko) Beamrise/17.2.0.9 Chrome/17.0.939.0 Safari/535.8","Mozilla/5.0 (Windows NT 6.1) AppleWebKit/535.2 (KHTML, like Gecko) Chrome/18.6.872.0 Safari/535.2 UNTRUSTED/1.0 3gpp-gba UNTRUSTED/1.0","Mozilla/5.0 (Windows NT 6.2) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1061.1 Safari/536.3","Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.6 (KHTML, like Gecko) Chrome/20.0.1092.0 Safari/536.6","Mozilla/5.0 (Windows NT 6.2) AppleWebKit/536.6 (KHTML, like Gecko) Chrome/20.0.1090.0 Safari/536.6","Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/22.0.1207.1 Safari/537.1","Mozilla/5.0 (Windows NT 6.1; WOW64; rv:10.0.1) Gecko/20100101 Firefox/10.0.1","Mozilla/5.0 (Windows NT 6.1; rv:12.0) Gecko/20120403211507 Firefox/12.0","Mozilla/5.0 (Windows NT 6.0; rv:14.0) Gecko/20100101 Firefox/14.0.1","Mozilla/5.0 (Windows NT 6.1; WOW64; rv:15.0) Gecko/20120427 Firefox/15.0a1","Mozilla/5.0 (Windows NT 6.2; Win64; x64; rv:16.0) Gecko/16.0 Firefox/16.0","iTunes/9.0.2 (Windows; N)","Mozilla/5.0 (compatible; Konqueror/4.5; Windows) KHTML/4.5.4 (like Gecko)","Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US) AppleWebKit/533.1 (KHTML, like Gecko) Maxthon/3.0.8.2 Safari/533.1","Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)","Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)","Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)","Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0; Trident/4.0)","Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)","Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0; Trident/5.0)","Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)","Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.2; Trident/5.0)","Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.2; WOW64; Trident/5.0)","Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; Media Center PC 6.0; InfoPath.3; MS-RTC LM 8; Zune 4.7)","Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)","Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; Trident/6.0)","Mozilla/5.0 (compatible; MSIE 10.6; Windows NT 6.1; Trident/5.0; InfoPath.2; SLCC1; .NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET CLR 2.0.50727) 3gpp-gba UNTRUSTED/1.0","Opera/9.25 (Windows NT 6.0; U; en)","Opera/9.80 (Windows NT 5.2; U; en) Presto/2.2.15 Version/10.10","Opera/9.80 (Windows NT 5.1; U; ru) Presto/2.7.39 Version/11.00","Opera/9.80 (Windows NT 6.1; U; en) Presto/2.7.62 Version/11.01","Opera/9.80 (Windows NT 5.1; U; zh-tw) Presto/2.8.131 Version/11.10","Opera/9.80 (Windows NT 6.1; U; es-ES) Presto/2.9.181 Version/12.00","Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/531.21.8 (KHTML, like Gecko) Version/4.0.4 Safari/531.21.10","Mozilla/5.0 (Windows; U; Windows NT 5.2; en-US) AppleWebKit/533.17.8 (KHTML, like Gecko) Version/5.0.1 Safari/533.17.8","Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/533.19.4 (KHTML, like Gecko) Version/5.0.2 Safari/533.18.5","Mozilla/5.0 (Windows; U; Windows NT 6.1; en-GB; rv:1.9.1.17) Gecko/20110123 (like Firefox/3.x) SeaMonkey/2.0.12","Mozilla/5.0 (Windows NT 5.2; rv:10.0.1) Gecko/20100101 Firefox/10.0.1 SeaMonkey/2.7.1","Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:2.0.1) Gecko/20100101 Firefox/4.0.1 Camino/2.2.1","Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:2.0b6pre) Gecko/20100907 Firefox/4.0b6pre Camino/2.2a1pre","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_0) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1063.0 Safari/536.3","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.4 (KHTML like Gecko) Chrome/22.0.1229.79 Safari/537.4","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2; rv:10.0.1) Gecko/20100101 Firefox/10.0.1","Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:16.0) Gecko/20120813 Firefox/16.0","iTunes/4.2 (Macintosh; U; PPC Mac OS X 10.2)","iTunes/9.0.3 (Macintosh; U; Intel Mac OS X 10_6_2; en-ca)","Mozilla/5.0 (Macintosh; U; Intel Mac OS X; en-US) AppleWebKit/528.16 (KHTML, like Gecko, Safari/528.16) OmniWeb/v622.8.0.112941","Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_6; en-US) AppleWebKit/528.16 (KHTML, like Gecko, Safari/528.16) OmniWeb/v622.8.0","Opera/9.20 (Macintosh; Intel Mac OS X; U; en)","Opera/9.64 (Macintosh; PPC Mac OS X; U; en) Presto/2.1.1","Opera/9.80 (Macintosh; Intel Mac OS X; U; en) Presto/2.6.30 Version/10.61","Opera/9.80 (Macintosh; Intel Mac OS X 10.4.11; U; en) Presto/2.7.62 Version/11.00","Opera/9.80 (Macintosh; Intel Mac OS X 10.6.8; U; fr) Presto/2.9.168 Version/11.52","Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_2; en-us) AppleWebKit/531.21.8 (KHTML, like Gecko) Version/4.0.4 Safari/531.21.10","Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_5; de-de) AppleWebKit/534.15  (KHTML, like Gecko) Version/5.0.3 Safari/533.19.4","Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_6; en-us) AppleWebKit/533.20.25 (KHTML, like Gecko) Version/5.0.4 Safari/533.20.27","Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_7; en-us) AppleWebKit/534.20.8 (KHTML, like Gecko) Version/5.1 Safari/534.20.8","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/534.55.3 (KHTML, like Gecko) Version/5.1.3 Safari/534.53.10","Mozilla/5.0 (Macintosh; Intel Mac OS X 10.5; rv:10.0.1) Gecko/20100101 Firefox/10.0.1 SeaMonkey/2.7.1","Mozilla/5.0 (X11; U; Linux; en-US) AppleWebKit/527  (KHTML, like Gecko, Safari/419.3) Arora/0.10.1","Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/536.5 (KHTML, like Gecko) Chrome/19.0.1084.9 Safari/536.5","Mozilla/5.0 (X11; CrOS i686 2268.111.0) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.57 Safari/536.11","Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.4 (KHTML like Gecko) Chrome/22.0.1229.56 Safari/537.4","Mozilla/4.0 (compatible; Dillo 3.0)","Mozilla/5.0 (X11; U; Linux i686; en-us) AppleWebKit/528.5  (KHTML, like Gecko, Safari/528.5 ) lt-GtkLauncher","Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.1.16) Gecko/20120421 Gecko Firefox/11.0","Mozilla/5.0 (X11; Linux i686; rv:12.0) Gecko/20100101 Firefox/12.0 ","Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:14.0) Gecko/20100101 Firefox/14.0.1","Mozilla/5.0 (X11; Linux i686; rv:16.0) Gecko/20100101 Firefox/16.0","Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.8) Gecko Galeon/2.0.6 (Ubuntu 2.0.6-2)","Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.1.16) Gecko/20080716 (Gentoo) Galeon/2.0.6","Mozilla/5.0 (X11; U; Linux x86_64; en-US; rv:1.9.1.13) Gecko/20100916 Iceape/2.0.8","Mozilla/5.0 (X11; Linux i686; rv:14.0) Gecko/20100101 Firefox/14.0.1 Iceweasel/14.0.1","Mozilla/5.0 (X11; Linux x86_64; rv:15.0) Gecko/20120724 Debian Iceweasel/15.02","Mozilla/5.0 (compatible; Konqueror/4.2; Linux) KHTML/4.2.4 (like Gecko) Slackware/13.0","Mozilla/5.0 (compatible; Konqueror/4.3; Linux) KHTML/4.3.1 (like Gecko) Fedora/4.3.1-3.fc11","Mozilla/5.0 (compatible; Konqueror/4.4; Linux) KHTML/4.4.1 (like Gecko) Fedora/4.4.1-1.fc12","Mozilla/5.0 (compatible; Konqueror/4.4; Linux 2.6.32-22-generic; X11; en_US) KHTML/4.4.3 (like Gecko) Kubuntu","Midori/0.1.10 (X11; Linux i686; U; en-us) WebKit/(531).(2) ","Mozilla/5.0 (X11; U; Linux x86_64; en-US; rv:1.9.0.3) Gecko/2008092814 (Debian-3.0.1-1)","Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9a3pre) Gecko/20070330","Opera/9.64 (X11; Linux i686; U; Linux Mint; nb) Presto/2.1.1","Opera/9.80 (X11; Linux i686; U; en) Presto/2.2.15 Version/10.10","Opera/9.80 (X11; Linux x86_64; U; pl) Presto/2.7.62 Version/11.00","Mozilla/5.0 (X11; Linux i686) AppleWebKit/534.34 (KHTML, like Gecko) QupZilla/1.2.0 Safari/534.34","Mozilla/5.0 (X11; U; Linux x86_64; en-US; rv:1.9.1.17) Gecko/20110123 SeaMonkey/2.0.12","Mozilla/5.0 (X11; Linux i686; rv:10.0.1) Gecko/20100101 Firefox/10.0.1 SeaMonkey/2.7.1","Mozilla/5.0 (X11; U; Linux x86_64; us; rv:1.9.1.19) Gecko/20110430 shadowfox/7.0 (like Firefox/7.0","Mozilla/5.0 (X11; U; Linux i686; it; rv:1.9.2.3) Gecko/20100406 Firefox/3.6.3 (Swiftfox)","Uzbl (Webkit 1.3) (Linux i686 [i686])"],
	SRList: ["320x200","320x240","640x480","800x600","854x480","1024x768","1152x768","1280x800","1280x854","1280x960","1280x1024","1400x1050","1440x900","1440x960","1600x1200","1680x1050","1920x1200","2048x1536","2560x1600","2560x2048","176x144","352x288","720x480","720x486","720x540","720x576","768x576","864x486","960x720","1024x576","1280x720","1366x768","1280x1080","1440x1080","1440x1080","1440x1024","1920x1080","2880x2048"],
	CDList: ["32","24","16"],
	optOutObject: null,
	oneTechArray: new Array(),
	resources_type: new Array(),
	regexp_domanins: new RegExp("^(doubleclick\.net)|"+
						 "(2mdn\.net)|"+
						 "(atdmt\.com)|"+
						 "(google-analytics\.com)|"+
						 "(2o7\.net)|"+
						 "(googlesyndication\.com)|"+
						 "(scorecardresearch\.com)|"+
						 "(akamai\.net)|"+
						 "(advertising\.com)|"+
						 "(hitbox\.com)|"+
						 "(revsci.\net)|"+
						 "(questionmarket\.com)$"
						 ,"i"),
	common: {
	  _bundle: Components.classes["@mozilla.org/intl/stringbundle;1"]
			   .getService(Components.interfaces.nsIStringBundleService)
			   .createBundle("chrome://notrace/locale/various.properties"),

			   getLocalizedMessage: function(msg) {
				  return this._bundle.GetStringFromName(msg);
			   }
	},
	initDBConnection: function() {
		if (!this.initialized) {
			this.initialized=true;
			
			//aggiunto da FI
			isisNoTraceShare.isisNoTraceSharedObjects.whitelist.arrayOfWhitelistCDN=this.createAndReadCDNListFromFile();
			isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['nonoscript']=new Array();
			isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['nometaredirectandcookie']=new Array();
			//isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['nometaredirect']=new Array();
			isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['nojscookie']=new Array();
			isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['nojs']=new Array();
			isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['noimg']=new Array();
			isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['no3cookie']=new Array();
			isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['no3img']=new Array();
			isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['no3js']=new Array();
			isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['no3pe']=new Array();
			isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['no3objnoid']=new Array();
			isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['noad']=new Array();
			isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['nocookie']=new Array();
			isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['noidheader']=new Array();
			isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['notop']=new Array();
			isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['nowebbug']=new Array();
			isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['noflashcookie']=new Array();
			isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['no3hiddenobj']=new Array();
			isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['no3hidden']=new Array();
			isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['nofingerprinting']=new Array();
			isisNoTraceShare.isisNoTraceSharedObjects.resources_type['nonoscript']=isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("personalinformation.label");
			isisNoTraceShare.isisNoTraceSharedObjects.resources_type['nometaredirectandcookie']=isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("personalinformation.label");
			isisNoTraceShare.isisNoTraceSharedObjects.resources_type['nojscookie']=isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("personalinformation.label");
			//isisNoTraceShare.isisNoTraceSharedObjects.resources_type['nometaredirect']=isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("personalinformation.label");
			isisNoTraceShare.isisNoTraceSharedObjects.resources_type['nojs']=isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("personalinformation.label");
			isisNoTraceShare.isisNoTraceSharedObjects.resources_type['no3hiddenobj']=isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("usertracking.label");
			isisNoTraceShare.isisNoTraceSharedObjects.resources_type['no3js']=isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("usertracking.label");
			isisNoTraceShare.isisNoTraceSharedObjects.resources_type['nowebbug']=isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("usertracking.label");
			isisNoTraceShare.isisNoTraceSharedObjects.resources_type['no3img']=isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("usertracking.label");
			isisNoTraceShare.isisNoTraceSharedObjects.resources_type['noimg']=isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("personalinformation.label");
			isisNoTraceShare.isisNoTraceSharedObjects.resources_type['no3objnoid']=isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("usertracking.label");
			isisNoTraceShare.isisNoTraceSharedObjects.resources_type['no3pe']=isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("usertracking.label");
			isisNoTraceShare.isisNoTraceSharedObjects.resources_type['noad']=isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("usertracking.label");
			isisNoTraceShare.isisNoTraceSharedObjects.resources_type['notop']=isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("usertracking.label");
			isisNoTraceShare.isisNoTraceSharedObjects.resources_type['noidheader']=isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("personalinformation.label");
			isisNoTraceShare.isisNoTraceSharedObjects.resources_type['no3cookie']=isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("usertracking.label");
			isisNoTraceShare.isisNoTraceSharedObjects.resources_type['nocookie']=isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("personalinformation.label");
			isisNoTraceShare.isisNoTraceSharedObjects.resources_type['nofingerprinting']=isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("usertracking.label");
			
			var str=IOUtils.getContentFromChromeURL("chrome://notrace/content/lists/optout.txt");
            isisNoTraceShare.isisNoTraceSharedObjects.optOutObject = JSON.parse(str);
            isisNoTraceShare.isisNoTraceSharedObjects.whitelist.refreshList();
		}
	},
	initDBLSConnection: function() {
		if (this._dbconn_local_storage==null) {
			let file = Components.classes["@mozilla.org/file/directory_service;1"]
				.getService(Components.interfaces.nsIProperties)
				.get("ProfD", Components.interfaces.nsIFile);
			file.append("webappsstore.sqlite");
			let storageService = Components.classes["@mozilla.org/storage/service;1"].getService(Components.interfaces.mozIStorageService);
			this._dbconn_local_storage = storageService.openDatabase(file);
		}
		return this._dbconn_local_storage;
	},
	
	//funzione aggiunta da FI
	createAndReadCDNListFromFile: function(){
		var arrayListCDN=new Array();
		
		var parentD= Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsIFile);
		parentD.append("notracedb");
		
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsIFile);
		file.append("notracedb");
		file.append("CDNList.txt");
		if(file.exists() && file.isFile()){
			arrayListCDN=this.getListFromFile(file);
			return arrayListCDN;
		}
	},
		
	//funzione aggiunta da FI
	getListFromFile: function(f){
		var file = f;
		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream); 	
		istream.init(file, 0x01, 0444, 0);
		istream.QueryInterface(Components.interfaces.nsILineInputStream);
			
		var line = {}, hasmore;
		var lines=new Array();
		do { 
			hasmore = istream.readLine(line);
			if (line!="") {lines.push(line.value);}
		} while(hasmore); 
		istream.close();	
		
		return lines;
	},
	
	domain: {
		getDomain: function(url){
		    var host = this.getServer(url);
            var domain;
            var arrayResult = null;
            if (host == null) {
                arrayResult = null;
            }
            else {
                var arrayResult = host.match(/(\d+\.\d+\.\d+\.\d+)/);
            }
            if (arrayResult != null) {
                // It is an IP address
                domain = arrayResult[1];
            }
            else {
                if (host != null) {
                    // It is a domain name
                    var hostsplit = host.split(".");
                    var hsl = hostsplit.length;
                    domain = hostsplit[hsl-2]+"."+hostsplit[hsl-1];
                    hostsplit=null;
                    hsl=null;
                }
                else {
                    domain = "";
                }
                
            }
            arrayResult=null;
            host=null;
            return domain;
		},
		getServer: function(url){
		    var arrayResult = url.match(/^(\d+\.\d+\.\d+\.\d+)$/);
		    if (arrayResult ==null) {
		        if (url.match(/^[\w\.]+$/)) {
		            return url;
		        }
		        else {
		            var urlsplit = url.split("/");
                    return urlsplit[2];
		        }
		    }
		    else {
		        return url;
		    }
        }
	},
	score: {
		observedPref: null,
		//dbconn: null,
		perc: null,
		globalscore: null,
		start: function(){
			this.calcolaS();
		},
		pushPrefS: function(pref){
			var len = this.observedPref.length;
			var flag = true;
			for(var i=0;i<len;i++){
				if(this.observedPref[i] == pref){
					flag = false;
					break;
				}
			}
			if(flag)
				this.observedPref.push(pref);
			flag=null;
			len=null;
		},
		calcolaS: function(){
			/*this.observedPref = new Array();
			var obspersonal = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("observe.personal");
			var obstracking = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("observe.tracking");
			var obsannoying = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("observe.annoying");
			var nonoscript = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.nonoscript");
			var nometaredirectandcookie = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.nometaredirectandcookie");
			//var nometaredirect = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.nometaredirect");
			var nojscookie = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.nojscookie");
			var nojs = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.nojs");
			var noimg = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.noimg");
			var no3cookie = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.no3cookie");
			var no3img = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.no3img");
			var no3js = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.no3js");
			var no3pe = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.no3pe");
			var no3objnoid = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.no3objnoid");
			var noad = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.noad");
			var nocookie = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.nocookie");
			var noflashcookie = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.noflashcookie");
			var no3hiddenobj = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.no3hiddenobj");
			var noidheader = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.noidheader");
			var notop = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.notop");
			var nowebbug = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.nowebbug");
			var nohtml5storage = isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.nohtml5storage");

			if(obspersonal){
				this.pushPrefS("nocookie");
				this.pushPrefS("noimg");
				this.pushPrefS("nojs");
				this.pushPrefS("nonoscript");
				this.pushPrefS("nojscookie");
				this.pushPrefS("nometaredirectandcookie");
				//this.pushPrefS("nometaredirect");
			}
			if(obstracking){
				this.pushPrefS("no3js");
				this.pushPrefS("no3img");
				this.pushPrefS("nowebbug");
				this.pushPrefS("no3cookie");
				this.pushPrefS("notop");
				this.pushPrefS("noflashcookie");
				this.pushPrefS("no3hiddenobj");
				this.pushPrefS("nohtml5storage");
			}
			if(obsannoying){
				this.pushPrefS("noad");
				this.pushPrefS("no3pe");
				this.pushPrefS("no3objnoid");
			}
			var arlen = this.observedPref.length;
			this.globalscore = 0;
			if(arlen!=0){
				var where = "";
				for(var i=0;i<arlen;i++){
					if(i==0) where = where + " " + isisNoTraceShare.isisNoTraceSharedObjects.quote(this.observedPref[i]) + " NOTNULL";
					else  where = where + " OR " + isisNoTraceShare.isisNoTraceSharedObjects.quote(this.observedPref[i]) + " NOTNULL";
				}
				var selStr = "SELECT COUNT(*) FROM resources WHERE" + where + " AND time IN (SELECT DISTINCT time FROM resources ORDER BY time DESC LIMIT 10)";		
				var selectStatement = this.dbconn.createAsyncStatement(selStr);
				selectStatement.executeAsync({
					handleResult: function(aResultSet) {
						for (let row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow()) {
							let value = row.getResultByIndex(0);
							isisNoTraceShare.isisNoTraceSharedObjects.score.globalscore=value;
						}
					},
					handleError: function(aError) {
						isisLogWrapper.logToConsole("Error: " + aError.message);
					},
					handleCompletion: function(aReason) {
						if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED)
							isisLogWrapper.logToConsole("Query canceled or aborted!");
					}
				});
				selectStatement=null;
				selStr=null;
				where=null;
			}
			var globalscoreb = 0;
			var activePref = new Array();
			if(nonoscript) activePref.push("nonoscript");
			if(nometaredirectandcookie) activePref.push("nometaredirectandcookie");
			//if(nometaredirect) activePref.push("nometaredirect");
			if(nojscookie) activePref.push("nojscookie");
			if(nojs) activePref.push("nojs");
			if(noimg) activePref.push("noimg");
			if(no3cookie) activePref.push("no3cookie");
			if(no3img) activePref.push("no3img");
			if(no3js) activePref.push("no3js");
			if(no3pe) activePref.push("no3pe");
			if(no3objnoid) activePref.push("no3objnoid");
			if(noad) activePref.push("noad");
			if(nocookie) activePref.push("nocookie");
			if(noflashcookie) activePref.push("noflashcookie");
			if(no3hiddenobj) activePref.push("no3hiddenobj");
			if(noidheader) activePref.push("noidheader");
			if(notop) activePref.push("notop");
			if(nowebbug) activePref.push("nowebbug");
			arlen = activePref.length;
			var blocked = 0;
			
			if(arlen!=0){
				var selectStatement = this.dbconn.createAsyncStatement("SELECT * FROM pesi");
				selectStatement.executeAsync({
					handleResult: function(aResultSet) {
						for (let row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow()) {
							for(var i=0;i<arlen;i++){
								blocked+=row.getResultByName(activePref[i]);
							}
						}
					},
					handleError: function(aError) {
						isisLogWrapper.logToConsole("Error: " + aError.message);
					},
					handleCompletion: function(aReason) {
						if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED)
							isisLogWrapper.logToConsole("Query canceled or aborted!");
					}
				});
				selectStatement=null;
			}
			globalscoreb = this.globalscore - blocked;
			this.perc = 0;
			this.perc = blocked;
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
			var recentWindow = wm.getMostRecentWindow("navigator:browser");
			var spp = recentWindow.document.getElementById("notraceaddons-notraceprot");
			
			spp=null;
			recentWindow=null;
			wm=null;
			blocked=null;
			arlen=null;
			activePref=null;
			globalscoreb=null;
			obspersonal=null;
			obstracking=null;
			obsannoying=null;
			nonoscript=null;
			nometaredirectandcookie=null;
			//nometaredirect=null;
			nojscookie=null;
			nojs=null;
			noimg=null;
			no3cookie=null;
			no3img=null;
			no3js=null;
			no3pe=null;
			no3objnoid=null;
			noad=null;
			nocookie=null;
			noflashcookie=null;
			no3hiddenobj=null;
			noidheader=null;
			notop=null;
			nowebbug=null;
			nohtml5storage=null;*/
		}
	},
	regular_expression:{
		regexp_malicious: new RegExp("126\.net|2hua\.com|2mdn\.net|2o7\.net|360buyimg\.com|360yield\.com|56imgs\.com|abmr\.net|acs86\.com|acxiom-online\.com|adadvisor\.net|adap\.tv|adbrite\.com|addthis\.com|addthisedge\.com|adimg\.net|adjug\.com|adlantis\.jp|admeld\.com|adnxs\.com|ad-plus\.cn|adresult\.jp|adriver\.ru|adsafeprotected\.com|adscale\.de|adsfac\.eu|adshost1\.com|adsonar\.com|adsrvr\.org|adtech\.de|adtechus\.com|advertising\.com|adzerk\.net|afy11\.net|agkn\.com|alimama\.cn|alimama\.com|aliunicorn\.com|allyes\.com|amazon-adsystem\.com|aol\.com|apmebf\.com|atdmt\.com|atwola\.com|audienceiq\.com|betrad\.com|bit\.ly|bizographics\.com|bkrtx\.com|bluekai\.com|bluelithium\.com|ca-mpr\.jp|casalemedia\.com|cbsistatic\.com|chango\.com|chartbeat\.com|chartbeat\.net|clicktale\.net|cnnic\.cn|cnzz\.com|cnzz\.net|collective-media\.net|com\.cn|com\.com|connexity\.net|contextweb\.com|crowdscience\.com|crwdcntrl\.net|da-ads\.com|demandbase\.com|demdex\.net|digieq\.com|dl-rms\.com|dmtracker\.com|dotomi\.com|doubleclick\.net|doubleverify\.com|dqna\.net|dsply\.com|ebayrtm\.com|edgesuite\.net|endless\.com|everesttech\.net|exelator\.com|facebook\.net|fbcdn\.net|flashtalking\.com|fmpub\.net|fwmrm\.net|godaddy\.com|google\.com|googleadservices\.com|google-analytics\.com|googlesyndication\.com|googletagservices\.com|[^s]\.gstatic\.com\/[^i]|gwallet\.com|icast\.cn|impact-ad\.jp|imrworldwide\.com|invitemedia\.com|iogous\.com|ipinyou\.com|irs01\.com|irs01\.net|ivwbox\.de|jscount\.com|kissmetrics\.com|knet\.cn|kontera\.com|lijit\.com|livezilla\.net|lucidmedia\.com|mail\.ru|mathtag\.com|media6degrees\.com|mediaplex\.com|mediav\.com|miaozhen\.com|microad\.jp|mlt01\.com|mookie1\.com|moonbasa\.com|mouseflow\.com|msn\.com|mxptint\.net|netseer\.com|newrelic\.com|nexac\.com|oadz\.com|odnoklassniki\.ru|omtrdc\.net|ooyala\.com|openx\.net|openxmarket\.jp|optimizely\.com|orbengine\.com|owneriq\.net|pinterest\.com|plus\.google\.com|p-td\.com|pubmatic\.com|qservz\.com|quality-channel\.de|quantserve\.com|reduxmediagroup\.com|refinedads\.com|revsci\.net|rfihub\.com|rlcdn\.com|rtbidder\.net|ru4\.com|rubiconproject\.com|scorecardresearch\.com|serving-sys\.com|simpli\.fi|sitestat\.com|skinected\.com|softonicads\.com|sogou\.com|spotxchange\.com|statcounter\.com|tanx\.com|technoratimedia\.com|tinyurl\.com|tns-counter\.ru|triggit\.com|truste\.com|tubemogul\.com|turn\.com|twimg\.com|twitter\.com|tynt\.com|typekit\.net|ugdturner\.com|v-56\.com|valuedopinions\.co\.uk|veruta\.com|visualrevenue\.com|visualwebsiteoptimizer\.com|voicefive\.com|w55c\.net|warriorpro\.com|websitealive7\.com|webtrends\.com|webtrendslive\.com|wrating\.com|wtp101\.com|yabuka\.com|yadro\.ru|yandex\.net|yandex\.st|ydstatic\.com|yieldmanager\.com|youdao\.com|youku\.com|plusone\.google\.com/u/0|facebook\.com/dialog/oauth\?client_id|static\.ak\.facebook\.com/connect/|facebook\.com/plugins/likebox\.php|statse\.webtrendslive\.com|home\.disney\.go\.com/search/babyzoneSearch\?q=|in\.getclicky\.com|brightcove.com/js/[^A][^P][^I]|brightcove.com/js/[^B][^r][^i][^g][^h][^t][^c][^o][^v][^e]|\.ensighten\.com|track\.monitis\.com|analytics\.leadlifesolutions\.net|\.minewhat\.com|\.luckyorange\.com|\.livestatserver\.com|(poll|banner)\.truehits\.net|\.swordfishdc\.com|track\.qcri\.org|\.userzoom\.com|\.icstats\.nl\/|tr\.webantenna\.info\/|\.vivistats\.com|\.jirafe\.com|\.teljari\.is\/|\.51\.la\/|\/owa\.tracker\-combined\-min\.js|\.webtraffic\.(se|no)\/|analytics\.brightedge\.com|services\.webspectator\.com\/(init|sb)|(analytics|pixel)\.yola\.net|(\.evisitanalyst\.com|evisitcs\.com|\.websiteperform\.com)|(mpn\-analytics|analytics\.mpn)\.mokonocdn\.com|\.mvb\.me\/|analytics\.gigyahosting1\.com\/gigya\-analytics\.js|\.geovisite\.com|t\.webtracker\.jp\/|scout\.scoutanalytics\.net|(s3\.amazonaws\.com\/publishflow|data\.publishflow\.com)|wtstats\.be\/(c|i)|\.richmetrics\.com|d3q6px0y2suh5n\.cloudfront\.net|rich\-agent\.s3\.amazonaws\.com|vlog\.leadformix\.com|(\.mycounter\.ua|\.mycounter\.com\.ua)|\.wysistat\.com|\.xg4ken\.com|\.webprospector\.de\/|(\.segment\.io|d47xnnr8b1rki\.cloudfront\.net)|tracker\.icerocket\.com\/services\/collector\.js|counter\.goingup\.com|\.livecounter\.dk\/counter|(\.enectoanalytics\.com|trk\.enecto\.com)|stat\.mystat\.hu\/|hit\.stat24\.com|\.vizzit\.se\/vizzittag\/|\.(research\.de\.com|meetrics\.net)\/bb|met\.vgwort\.de\/|(\.shinobi\.jp\/|\.donburako\.com|\.cho-chin\.com|\.hishaku\.com)|\.sophus3\.com|\.degaa\.net|\.hit-parade\.com\/log|\.gaug\.es\/track|\.tongji\.linezing\.com|\.observerapp\.com\/record|\.gravity\.com|in\.bubblestat\.com|\.eulerian\.net|\.mongoosemetrics\.com|\.collserve\.com|analytics\.apnewsregistry\.com\/analytics\/|reporting\.singlefeed\.com|webstats\.motigo\.com|\.nedstatbasic\.net|\.nextstat\.com|\.wowanalytics\.co\.uk|\.branica\.com|\.inspectlet\.com|an\.adhood\.com\/|gostats\.com|\.onlinewebstats\.com|js\.gb-world\.net\/lib\/ga_social_tracking\.js|\.belstat\.(com|be|de|fr|nl)\/regstat|pixel\.adsafeprotected\.com|fw\.adsafeprotected\.com|sitebro\.(tw|net|com)\/track\.js|d1ros97qkrwjf5\.cloudfront\.net|\.opentracker\.net|(img|script)\.footprintlive\.com|(freeonlineusers\.com|fastonlineusers\.com\/on|fastwebcounter\.com\/secure\.php)|\.statistics\.ro\/|\.keymetric\.net|expo-max\.com|hitsniffer\.com|\.springmetrics\.com|d3rmnwi2tssrfx\.cloudfront\.net|wwa\.wipe\.de|\.tinystat\.(ir|com)|radarurl\.com|\.lytiks\.com|\.w3roi\.com|\.advg\.jp|\.adplan-ds\.com|c\.p-advg\.com|\.adplan\.ne\.jp\/|netscope\.data\.marktest\.pt|\.visualrevenue\.com|\.mypagerank\.net\/services|\.cnzz\.com|nakanohito\.jp|\.c3metrics\.com|\.c3tag\.com|utag\.loader\.js|d34ko97cxuv4p7\.cloudfront\.net|tealium\.hs\.llnwd\.net|wiredminds\.de\/track|beencounter\.com\/b\.js|\.weborama\.fr\/|effectivemeasure\.net|stat\.yellowtracker\.com|\.tradetracker\.net|hits\.e\.cl|prima\.certifica\.com|184\.73\.199\.28\/tracker\/event|anormal-tracker\.de\/tracker\.js|anormal-tracker\.de\/countv2\.php|roia\.biz\/|\.dmtry\.com|j\.kissinsights\.com|webgozar\.ir\/c\.aspx|webgozar\.com\/counter|r\.i\.ua|hotlog\.ru|uptrends\.com\/(aspx\/uptime\.aspx|images\/uptrends\.gif)|visitstreamer\.com\/vs\.js|crm-metrix\.com|customerconversio\.com|utd\.stratigent\.com|yieldoptimizer\.com|svlu\.net|app\.phonalytics\.com\/track|(impression|ca)\.clickinc\.com|(tracking\.conversionlab\.it|conversionlab\.trackset\.com\/track\/)|visualpath[0-9]\.trackset\.it\/|track\.did-it\.com|tag\.didit\.com\/(didit|js)\/|visitorville\.com\/js\/plgtrafic\.js\.php|b\.monetate\.net\/js\/|econda-monitor\.de\/els\/logging|live1\.netupdater\.info\/live\.php|netupdater[0-9]\.de|\/netupdater|\.ic-live\.com|\.sptag3\.com|\.sitecompass\.com|(haku|puma|cheetah|tiger)\.vizu\.com|\.vizu\.com\/zones\/|webiqonline\.com|radar\.cedexis\.(com|net)|\.mookie1\.com|stats\.businessol\.com|webtraxs\.com|vertster.com\/.*\/vswap\.js|\.visiblemeasures\.com\/log|(in\.getclicky\.com|static\.getclicky\.com|hello\.staticstuff\.net|clicky\.js)|statisfy\.net\/javascripts\/stats\.js|analytics\.live\.com|google-analytics\.com\/(urchin\.js|ga_exp\.js|ga\.js|u\/ga_debug\.js|u\/ga_beta\.js|u\/ga\.js)|\/__utm\.|stats\.g\.doubleclick\.net\/dc\.js|\.mybloglog\.com|sitemeter\.com\/(js\/counter\.js|meter\.asp)|cetrk\.com|dnn506yrbagrg\.cloudfront\.net|\.statcounter\.com\/counter\/|c\.statcounter\.com|\/(mint|_mint|mymint)\/|(stats\.wordpress\.com\/|s\.stats\.wordpress\.com\/w\.js)|(\/salog\.js\.aspx|js\.hubspot\.com\/analytics\/)|(\.analytics\.yahoo\.com\/|indextools\.js|ystat\.js|\.yimg\.com\/mi\/ywa\.js)|\/js_source\/whv2_001\.js|visit\.webhosting\.yahoo\.com|otracking\.com\/js|clustrmaps\.com\/(counter\/|stats\/maps)|(feedjit\.com\/serve\/|feedjit\.com\/map\/)|log\.feedjit\.com|\/woopra(\.v(2|3|4))?\.js|static\.crowdscience\.com|\.imrworldwide\.com|dz\.glanceguide\.com|\/piwik\.js|www\.typepad\.com\/t\/stats|\.xiti\.com|\/js_xiti\.js|\/xtcore\.js|(\.chartbeat\.com|\/chartbeat\.js)|www\.conversionruler\.com\/bin\/|static\.hubspot\.com\/websiteGraderBadge\/badge\.js|xslt\.alexa\.com\/site_stats\/js\/t\/|d\.yimg\.com\/ds\/badge\.js|\.clicktale\.net|clicktale\.pantherssl\.com|lypn\.com\/lp\/|revelations\.trovus\.co\.uk\/tracker\/|\.insightexpressai\.com|twittercounter\.com|\.hitslink\.com|\.hitsprocessor\.com|\.w3counter\.com|awstats_misc_tracker\.js|stat\.onestat\.com|(\.bmmetrix\.com|\.japanmetrix\.jp\/)|include\.reinvigorate\.net|buzzster\.com\/widget\/|(trackalyzer\.com|formalyzer\.com)|\.nuconomy\.com\/n\.js|storage\.trafic\.ro\/js\/trafic\.js|(\.clicktracks\.com|\.elabs5\.com\/images\/mlopen_track\.html)|\.extreme-dm\.com|\.sweepery\.com\/javascripts\/*\/[0-9a-zA-Z_]*\.js|stat\.netmonitor\.fi\/js\/|munchkin\.marketo\.net|(\/eluminate\.js|data\.cmcore\.com|\.coremetrics\.com)|(now\.eloqua\.com|elqcfg\.js|elqcfgxml\.js|elqimg\.js)|rt\.trafficfacts\.com|assets\.skribit\.com\/javascripts\/SkribitSuggest\.js|code\.etracker\.com|\.etracker\.de\/|\.sedotracker\.com|\.snoobi\.com\/snoop\.php|\.shinystat\.(com|it)\/|(sniff|stats)\.visistat\.com|\.sa\-as\.com|(\.sitestat\.com|\.nedstat\.com)|\.i-stats\.com\/js\/icounter\.js|(tracking\.percentmobile\.com\/|\/percent_mobile\.js)|\.yandex\.ru\/(resource|metrika)\/watch|yandex\.ru\/(cycounter|informer)|\.spylog\.(com|ru)\/|openstat\.net\/cnt\.js|\/phpmyvisites\.js|\.alexametrics\.com|d31qbv1cthcecs\.cloudfront\.net\/atrk\.js|\.conversiondashboard\.com|cdn\.doubleverify\.com\/[0-9a-zA-Z_-]*\.js|one\.statsit\.com|\.leadforce1\.com\/bf\/bf\.js|\.iperceptions\.com|\.ivwbox\.de\/|\.google-analytics\.com\/siteopt\.js|(\.navegg\.com|navdmp\.com)|widgets\.backtype\.com|\.blvdstatus\.com\/js\/initBlvdJS\.php|\.clixmetrix\.com|clixpy\.com\/clixpy\.js|\.kissmetrics\.com|doug1izaerwt3\.cloudfront\.net|\/liveball_api\.js|logdy\.com\/scripts\/script\.js|api\.mixpanel\.com|\.mxpnl\.com|\.inq\.com|(\.unica\.com\/|ntpagetag)|vistrac\.com\/static\/vt\.js|(\.stormiq\.com|\.dc-storm\.com)|\.histats\.com|data\.gosquared\.com|d1l6p2sc9645hc\.cloudfront\.net|\.gosquared\.com\/livestats\/tracker|(c1|beta)\.web-visor\.com\/c\.js|\.eproof\.com|(foresee\-trigger|foresee\-alive|foresee\-analytics)|3dstats\.com\/cgi-bin\/3dstrack|addfreestats\.com\/cgi-bin\/afstrack\.cgi|(\.webtrekk\.net|\/webtrekk\.js|\/webtrekk_v3\.js)|channelintelligence\.com|dsa\.csdata1\.com|(xslt\.alexa\.com\/site_stats\/js\/s\/|widgets\.alexa\.com\/traffic\/javascript\/)|\.searchmarketing\.com|saas\.intelligencefocus\.com\/sensor\/|www\.domodomain\.com\/domodomain\/sensor\/|\.optimost\.com|searchignite\.com\/si\/cm\/tracking\/|\.wa\.marketingsolutions\.yahoo\.com\/script\/scriptservlet|\.estat\.com\/js\/|(adstat\.4u\.pl\/s\.js|stat\.4u\.pl\/cgi-bin\/)|\/zig\.(js|gif)|\/zag\.(js|gif)|assets\.newsinc\.com\/(ndn\.2\.js|analyticsprovider\.svc\/)|server[2-4]\.web-stat\.com|\/internal\/jscript\/dwanalytics\.js|\.oewabox\.at|adelixir\.com\/(webpages\/scripts\/ne_roi_tracking\.js|neroitrack)|(\.spring\-tns\.net|tns-counter\.ru|tns-counter\.js|\.tns-cs\.net|statistik-gallup\.net|\.sesamestats\.com|\.tns-gallup\.dk|\.research-int\.se)|hints\.netflame\.cc\/service\/script\/|ad\.adlegend\.com|\.mouseflow\.com|sageanalyst\.net|\.1[12]2\.2o7\.net|hitbox\.com|\.omtrdc\.net|\/(omniture|mbox|hbx|omniunih)(.*)?\.js|s(c)?_code[0-9a-zA-Z_-]*(\.[0-9a-zA-Z_-]*)?\.js|common\.onset\.freedom\.com\/fi\/analytics\/cms\/|gwa\.reedbusiness\.net|du8783wkf05yr\.cloudfront\.net|analytics\.engagd\.com\/archin-std\.js|\.hittail\.com\/mlt\.js|friendfeed\.com\/embed\/widget\/|(content\.dl-rms\.com\/|\.dlqm\.net\/|\.questionmarket\.com\/)|trackingtags_v1\.1\.js|(optimize|m)\.webtrends\.com|\/webtrends(.*)?\.js|\.webtrendslive\.com|\/(dcs\.gif|njs\.gif)|(\/seesmic_topposters_v2\.js|seesmic-wp\.js)|\.revsci\.net|wunderloop\.net|ad\.targetingmarketplace\.com|revsci\.(.*)\/gw\.js|lct\.salesforce\.com\/sfga\.js|outbrain\.com|\.doubleclick\.net\/activity;|(static\.btbuckets\.com\/bt\.js|\.n\.btbuckets\.com\/js)|baynote\.js|baynote\.net|baynote(-observer)?([0-9]+)\.js|baynote\-observer\.js|triggit\.com|\/k_(push|button)\.js|\.crwdcntrl\.net|touchclarity|(tags\.bluekai\.com\/|bkrtx\.com\/js\/)|(tr-metrics\.loomia\.com|assets\.loomia\.com\/js\/)|(\.dtmpub\.com\/|login\.dotomi\.com\/ucm\/ucmcontroller)|service\.collarity\.com|\.enquisite\.com\/log\.js|(api|leads)\.demandbase\.com|(\.dialogmgr\.com\/tag\/lib\.js|\.magnify360\.com)|tracking\.fathomseo\.com|(\.imiclk\.com\/|\.abmr\.net)|\.exelator\.com|(\.bizographics\.com\/|ad\.bizo\.com\/pixel)|\.(scoreresearch|securestudies|scorecardresearch)\.com|\.rfihub\.(com|net)|(\.tynt\.com\/ti\.js|\.tynt\.com\/javascripts\/tracer\.js)|\.tynt\.com\/tc\.js|\.socialtwist\.com|tracking\.summitmedia\.co\.uk\/js\/|facebook\.com\/beacon\/|img\.zemanta\.com|vizisense\.komli\.net\/pixel\.js|vizisense\.net\/pixel\.js|\.searchforce\.net|\.zendesk\.com\/external\/zenbox\/overlay\.js|\.rsvpgenius\.com|\.marinsm\.com|\.pardot\.com|(spruce\.rapleaf\.com|\.rlcdn\.com)|widgetserver\.com\/syndication\/subscriber|tracker\.wordstream\.com|(s3\.amazonaws\.com\/wingify\/vis_opt\.js|dev\.visualwebsiteoptimizer\.com|server\.wingify\.com\/app\/js\/code\/wg_consolidated\.js)|d5phz18u4wuww\.cloudfront\.net|stags\.peer39\.net\/|\.quintelligence\.com|get\.mirando\.de\/|www\.actonsoftware\.com\/acton\/bn\/|(\.res-x\.com\/ws\/r2\/resonance|\/resxcls[ax][0-9a-z_]*\.js|\/resonance5050\.js)|(\/gomez.+?\.js|\.[rt]\.axf8\.net\/)|s\.clickability\.com\/s|\.retargeter\.com|tags\.mediaforge\.com|nr7\.us\/apps\/|cdnma\.com\/apps\/|\.doubleclick\.net\/activityi|fls\.doubleclick\.net|jlinks\.industrybrains\.com\/jsct|\.predictad\.com\/scripts\/(molosky|publishers)\/|\.iesnare\.com|\.(brcdn|brsrvr|brtstats)\.com|d3hrg5kicb4pq5\.cloudfront\.net|(beacon|js)\.clickequations\.net|mct\.rkdms\.com\/sid\.gif|keywordmax\.com\/tracking\/|amadesa\.com\/static\/client_js\/engine\/amadesajs\.js|\.srtk\.net\/www\/delivery\/|(\.tynt\.com\/ts\.js|\.tynt\.com\/javascripts\/tyntspeedsearch\.js)|\.demdex\.net|netmng\.com\/|\.netmining\.com|px\.owneriq\.net|hits\.convergetrack\.com|tracking\.dsmmadvantage\.com\/clients\/|(cdn\.nprove\.com\/npcore\.js|go\.cpmadvisors\.com\/|\.orbengine\.com)|mvtracker\.com\/(counter|stats|tr\.x|ts|tss|mvlive|digits)|rt\.legolas-media\.com|cdn\.krxd\.net|j\.clickdensity\.com\/cr\.js|cts\.vresp\.com\/s\.gif|websitealive[0-9]\.com|\.websitealive\.com|(adserver|int)\.teracent\.net|(html\.aggregateknowledge\.com\/iframe|\.agkn\.com)|\.tellapart\.com\/crumb|t\.tellapart\.com|voicefive\.com\/.*\.pli|ats\.tumri\.net|(ad|ad2|counter)\.rambler\.ru|\.mail\.ru\/counter|\.bluecava\.com|(monitus\.js|monitus_tools\.js)|(l|b)ive\.monitus\.net|service\.optify\.net|(counters\.gigya\.com|c\.gigcount\.com)|as00\.estara\.com\/as\/initiatecall2\.php|\.atgsvcs\.com\/js\/atgsvcs\.js|adadvisor\.net|voice2page\.com\/naa_1x1\.js|pixazza\.com\/|\.luminate\.com|levexis\.com|(mmcore\.js|cg-global\.maxymiser\.com)|\.chango\.(ca|com)|displaymarketplace\.com|a\.live\-conversion\.com|pixel\.adpredictive\.com|px\.steelhousemedia\.com|tracking\.godatafeed\.com|clarity\.adinsight\.eu\/static\/adinsight|\/performable\/pax|analytics\.performable\.com\/pax\.js|rs\.gwallet\.com\/r1\/pixel|(servedby|ads|event)\.adxpose\.com|btstatic\.com|s\.thebrighttag\.com|\.struq\.com|raasnet\.com|\.mythings\.com|esm1\.net|domdex\.(net|com)|qjex\.net|(tracking\.quisma\.com|\.qservz\.com)|adserver\.veruta\.com|veruta\.com\/scripts\/trackmerchant\.js|a\.ucoz\.net|(do\.am|at\.ua)\/stat\/|ucoz\.(.*)\/(stat|main)\/|c\.bigmir\.net|\.keewurd\.com|hurra\.com\/ostracker\.js|sp1\.convertro\.com|d1ivexoxmp59q7\.cloudfront\.net|cdn\.optimizely\.com\/js\/|cn01\.dwstat\.cn|\.smowtion\.com|imgsrv\.nextag\.com\/imagefiles\/includes\/roitrack\.js|srv\.clickfuse\.com|adocean\.pl|d3pkntwtp2ukl5\.cloudfront\.net|t\.unbounce\.com|zopim\.com|\.adbull\.com|\.ppctracking\.net|\/std\/resource\/script\/rwts\.js|\.netbina\.com|\.parsely\.com|\.persianstat\.com|theblogfrog\.com|\.peerius\.com|2leep\.com|(\.cognitivematch\.com|\.cmmeglobal\.com)|\.spectate\.com|nxtck\.com|\.designbloxlive\.com|\.ib-ibi\.com|\.crosspixel\.net|\.crsspxl\.com|\.intentmedia\.net|lfov\.net\/webrecorder\/|(\.grapeshot\.co\.uk|\.gscontxt\.net)|(ads|sync|set)\.(tidaltv)\.(tv|com)|\.audienceiq\.com|app\.ubertags\.com|\.listrakbi\.com|st\.listrak\.com|\/opentag\-(.*)\.js|thesearchagency\.net\/tsawaypoint\.php|\.thesearchagency\.net\/(.*)\/tsaapi\.js|tracking\.feedperfect\.com|\.webclicktracker\.com|\.appmetrx\.com|analytics\.clickdimensions\.com|\.merchantadvantage\.com|\.communicatorcorp\.com\/public\/scripts\/conversiontracking\.js|\.list-manage\.com\/track\/|\.list-manage[1-9]\.com\/track\/|mobilemeteor\.com\/js\/check\.js|showmeinn\.com\/_js\/mobile\.js|\.convertglobal\.com|convertglobal\.s3\.amazonaws\.com|dnhgz729v27ca\.cloudfront\.net|\.coremotives\.com|\.etrigue\.com|dn3y71tq7jf07\.cloudfront\.net|s3\.amazonaws\.com\/cdn\.barilliance\.com|\.clickmanage\.com|\.(tracemyip\.org|ipnoid\.com)\/tracker\/|\.activemeter\.com|(\.trk\.sodoit\.com\/rts|\.roitrax\.com)|\.aweber\.com|\.adinsight\.(eu|com)\/static\/scripts\/aditrack\.min\.js|\.xplosion\.de\/|hit\.clickaider\.com|ant\.conversive\.nl\/|\.trackedlink\.net|\.facebook\.com\/js\/conversions\/tracking\.js|\.facebook\.com\/email_open_log_pic\.php|roi\.vertical\-leap\.co\.uk|\.sextracker\.com|\.valuedopinions\.co\.uk|\.pswec\.com|\.plssl\.com\/pl\-xauth\.php|api\.dimestore\.com|\.adlooxtracking\.com|j\.maxmind\.com\/app\/(geoip|country)\.js|\.siteimprove\.com\/js\/|d15qhc0lu1ghnk\.cloudfront\.net|errorception\.com\/projects\/.*\/beacon\.js|\.sail\-horizon\.com\/horizon\/|\.moon\-ray\.com|moonraymarketing\.com\/tracking\.js|btg\.mtvnservices\.com|cnt\.sup\.com|\.whoson\.com|track\.adtraction\.com|\.kavijaseuranta\.fi\/|\.adcastplus\.net|\.easyresearch\.se\/|ssl\.webserviceaward\.com\/wsc\/|\.verticalnetwork\.de\/|\.adrolays\.de\/|\.unister\-adservices\.com|analytics\.unister\-gmbh\.de\/|analytics-static\.unister\-gmbh\.de\/|\.sublimemedia\.net|\.254a\.com|(\.directtrack\.com|\.onenetworkdirect\.net)|(\.jump\-time\.net|\.jumptime\.com)|\.shop2market\.com|insight\.torbit\.com|\.online-metrix\.net\/fp|\.cqcounter\.com\/cgi\-bin\/c|(clarityray|djers|dutrus|eurts|fanefo|hfunt|hfutz|hinsm|japum|jhame|jyaby|jyawd|kwobj|kyarm|lbein|ocyss|orpae|owpas|psyng|pturt|wredint)\.com|\.predictiveintent\.com|\.hiconversion\.com|(\.yldbt\.com|\.yb0t\.com)|(\.buzzdeck\.com|pixel\.buzzdeck)|\.geoplugin\.net|js\.exceptional\.io\/exceptional\.js|exceptional\-js\.heroku\.com\/exceptional\.js|\/metriweb\/mwtag|\.metriweb\.be\/dyn\/|\.speed\-trap\.nl\/|s3\.amazonaws\.com\/(saaspulse|totango)-cdn\/|\.vmmpxl\.com|\.npario\-inc\.net|beacons\.hottraffic\.nl|\.msgapp\.com|up\.nytimes\.com|\.xyztraffic\.com|(\.fruitflan\.com|\.adflan\.com)|\.mconet\.biz|\.visitortracklog\.com|tracker\.euroweb\.net|\.leadforensics\.com|\.rsspump\.com|\.nextjump.com\/v1\/cheetah\/track|\.audiencefuel\.com|\.refinedads\.com|\.rsys4\.net|\.content\.ad\/|\.simplereach\.com|\.semasio\.net|\.affimax\.de\/|\.wikia\-beacon\.com|\.12mlbe\.com|webeffective\.keynote\.com|\.lengow\.com|\.iadvize\.com|(gooo\.al|gooal\.herokuapp\.com)|\.getsmartcontent\.com|s\.mousetrace\.com|\.rutarget\.ru\/|\.dpmsrv\.com|\.tracer\.jp\/|\.allyes\.com|\.mmstat\.com|audit\.median\.hu\/|\.clickexperts\.net|\.publicidees\.com|stats\.shopify\.com|stats\.vertriebsassistent\.de\/|\.sokrati\.com|\.infinity-tracking\.net|\.cnstats\.ru\/|\.hit\.ua\/|\.mystat-in\.net|\.(r7ls|7eer|ojrq|evyy)\.net|\.impactradius\.com|\.securedvisit\.com|\.eyeota\.net|iplogger\.ru\/|\.tlm100\.net|\.loggly\.com|inpref\.com|inpref\.s3|\.iljmp\.com|\.adc-serv\.net|\.quick-counter\.net|\.securepaths\.com|\.stathat\.com|\.aimatch\.com|\.trkme\.net|\.postaffiliatepro\.com|4stats\.de\/|\.clickprotector\.com|\.callmeasurement\.com|count\.rbc\.ru|st\.magnify\.net|\.webstat\.se\/|webstat\.net\/cgi-bin|(\.tcimg\.com|\.bloggurat\.net|blogglisten\.no\/|\.chart\.dk\/|\.nope\.dk\/|\.statcount\.com|\.stealth\.nl\/|\.bobum\.nl\/)|susnet\.(nu|se)\/|(\.dgm-au\.com|\.s2d6\.com)|tag\.email-attitude\.com|mmtro\.com\/(tro\.js|p)|\.list\.ru\/counter|mixpanel\.com|ensighten\.com|h\.ophan\.co\.uk|oas\.populisengage\.com|autonomycloud\.com|\/uds\/afs\?|\/uds\/\?file=ads"),//|brightcove\.com\\[^admin\.]brightcove.com[^/js/APIModules_all\.js]
		//regexp_fingerprinting: new RegExp("([&|;]utmsr=\d+x\d+)|([&|;]sr=\d+x\d+)|([&|;]WT\.sr=\d+x\d+)|([&|;]sc_r=\d+x\d+)|([&|;]j=\d+x\d+)|([&|;]brscrsz=\d+x\d+)|([&|;]scr=\d+x\d+)|([&|;]sc_d=\d+)|([&|;]je=\d+)|([&|;]brflv=\d+)|([&|;]flv=\d+)|([&|;]WT\.vt_f_tlv=\d+)"),
		//regexp_fingerprinting: new RegExp("(&|;)(utmsr|sr|WT\.sr|sc\_r|j|brscrsz|scr)=.*?\d+"),
		//regexp_fingerprinting: new RegExp("&utmsr=.*?\d+.*?\d+"),
		regexp_fingerprinting: new RegExp("([&;])(utmsr|sr|WT\.sr|sc\_r|j|brscrsz|scr)=(\\d+)x(\\d+)"),
		regexp_fingerprinting_1: new RegExp("([&;])(utmsc|cd|WT\.cd|sc\_d)=(\\d+)"),
		regexp_top10_domanins: new RegExp("^(doubleclick\.net)|"+
						 "(google-analytics\.com)|"+
						 "(scorecardresearch\.com)|"+
						 "(quantserve\.com)|"+
						 "(yieldmanager\.com)|"+
						 "(adnxs\.com)|"+
						 "(2mdn\.net)|"+
						 "(2o7\.net)|"+
						 "(crwdcntrl\.net)|"+
						 "(imrworldwide\.com)$"
						 ,"i")
						 
						 /**
						 doubleclick.net
google-analytics.com
scorecardresearch.com
						 */
		//regexp_fingerprinting: new RegExp("analytics"),
	},
	regular_expression2:{
        /****************************New RegExp Object*******************************/
        //~ regexp_malicious: /126\.net|2hua\.com|2mdn\.net|2o7\.net|360buyimg\.com|360yield\.com|56imgs\.com|abmr\.net|acs86\.com|acxiom-online\.com|adadvisor\.net|adap\.tv|adbrite\.com|addthis\.com|addthisedge\.com|adimg\.net|adjug\.com|adlantis\.jp|admeld\.com|adnxs\.com|ad-plus\.cn|adresult\.jp|adriver\.ru|adsafeprotected\.com|adscale\.de|adsfac\.eu|adshost1\.com|adsonar\.com|adsrvr\.org|adtech\.de|adtechus\.com|advertising\.com|adzerk\.net|afy11\.net|agkn\.com|alimama\.cn|alimama\.com|aliunicorn\.com|allyes\.com|amazon-adsystem\.com|aol\.com|apmebf\.com|atdmt\.com|atwola\.com|audienceiq\.com|betrad\.com|bit\.ly|bizographics\.com|bkrtx\.com|bluekai\.com|bluelithium\.com|ca-mpr\.jp|casalemedia\.com|cbsistatic\.com|chango\.com|chartbeat\.com|chartbeat\.net|clicktale\.net|cnnic\.cn|cnzz\.com|cnzz\.net|collective-media\.net|com\.cn|com\.com|connexity\.net|contextweb\.com|crowdscience\.com|crwdcntrl\.net|da-ads\.com|demandbase\.com|demdex\.net|digieq\.com|dl-rms\.com|dmtracker\.com|dotomi\.com|doubleclick\.net|doubleverify\.com|dqna\.net|dsply\.com|ebayrtm\.com|edgesuite\.net|endless\.com|everesttech\.net|exelator\.com|facebook\.com|facebook\.net|fbcdn\.net|flashtalking\.com|fmpub\.net|fwmrm\.net|godaddy\.com|google\.com|googleadservices\.com|google-analytics\.com|googlesyndication\.com|googletagservices\.com|gstatic\.com|gwallet\.com|icast\.cn|impact-ad\.jp|imrworldwide\.com|invitemedia\.com|iogous\.com|ipinyou\.com|irs01\.com|irs01\.net|ivwbox\.de|jscount\.com|kissmetrics\.com|knet\.cn|kontera\.com|lijit\.com|livezilla\.net|lucidmedia\.com|mail\.ru|mathtag\.com|media6degrees\.com|mediaplex\.com|mediav\.com|miaozhen\.com|microad\.jp|mlt01\.com|mookie1\.com|moonbasa\.com|mouseflow\.com|msn\.com|mxptint\.net|netseer\.com|newrelic\.com|nexac\.com|oadz\.com|odnoklassniki\.ru|omtrdc\.net|ooyala\.com|openx\.net|openxmarket\.jp|optimizely\.com|orbengine\.com|owneriq\.net|pinterest\.com|plus\.google\.com|p-td\.com|pubmatic\.com|qservz\.com|quality-channel\.de|quantserve\.com|reduxmediagroup\.com|refinedads\.com|revsci\.net|rfihub\.com|rlcdn\.com|rtbidder\.net|ru4\.com|rubiconproject\.com|scorecardresearch\.com|serving-sys\.com|simpli\.fi|sitestat\.com|skinected\.com|softonicads\.com|sogou\.com|spotxchange\.com|statcounter\.com|tanx\.com|technoratimedia\.com|tinyurl\.com|tns-counter\.ru|triggit\.com|truste\.com|tubemogul\.com|turn\.com|twimg\.com|twitter\.com|tynt\.com|typekit\.net|ugdturner\.com|v-56\.com|valuedopinions\.co\.uk|veruta\.com|visualrevenue\.com|visualwebsiteoptimizer\.com|voicefive\.com|w55c\.net|warriorpro\.com|websitealive7\.com|webtrends\.com|webtrendslive\.com|wrating\.com|wtp101\.com|yabuka\.com|yadro\.ru|yandex\.net|yandex\.st|ydstatic\.com|yieldmanager\.com|youdao\.com|youku\.com|plusone\.google\.com\/u\/0|facebook\.com\/dialog\/oauth\?client_id|static\.ak\.facebook\.com\/connect\/|facebook\.com\/plugins\/likebox\.php|statse\.webtrendslive\.com|home\.disney\.go\.com\/search\/babyzoneSearch\?q=|in\.getclicky\.com|brightcove.com\/js\/[^A][^P][^I]|brightcove.com\/js\/[^B][^r][^i][^g][^h][^t][^c][^o][^v][^e]/,//|brightcove\.com\\[^admin\.]brightcove.com[^/js/APIModules_all\.js]
        /****************************RegexpLiteral*******************************/
        regexp_malicious: null,
        regexp_fingerprinting: null,
        regexp_fingerprinting_1: null,
        init: function() {
            //let {listManager} = require("listManager");
            isisNoTraceShare.isisNoTraceSharedObjects.regular_expression.regexp_malicious = new RegExp(isisNoTraceShare.isisNoTraceSharedObjects.listManager.getList('thirdpartylist'));
            isisNoTraceShare.isisNoTraceSharedObjects.regular_expression.regexp_fingerprinting = new RegExp(isisNoTraceShare.isisNoTraceSharedObjects.listManager.getList('regexp_fingerprinting'));
            isisNoTraceShare.isisNoTraceSharedObjects.regular_expression.regexp_fingerprinting_1 = new RegExp(isisNoTraceShare.isisNoTraceSharedObjects.listManager.getList('regexp_fingerprinting_1'));
            regexp_malicious = new RegExp(isisNoTraceShare.isisNoTraceSharedObjects.listManager.getList('thirdpartylist'));
            regexp_fingerprinting = new RegExp(isisNoTraceShare.isisNoTraceSharedObjects.listManager.getList('regexp_fingerprinting'));
            regexp_fingerprinting_1 = new RegExp(isisNoTraceShare.isisNoTraceSharedObjects.listManager.getList('regexp_fingerprinting_1'));
            isisLogWrapper.logToConsole("REGEXP: "+regexp_malicious);
            regexp_top10_domanins: new RegExp("^(doubleclick\.net)|"+
                 "(google-analytics\.com)|"+
                 "(scorecardresearch\.com)|"+
                 "(quantserve\.com)|"+
                 "(yieldmanager\.com)|"+
                 "(adnxs\.com)|"+
                 "(2mdn\.net)|"+
                 "(2o7\.net)|"+
                 "(crwdcntrl\.net)|"+
                 "(imrworldwide\.com)$"
                 ,"i")
        }
    },
    
	getRandomUA: function(){
		var index=Math.floor((Math.random()*isisNoTraceShare.isisNoTraceSharedObjects.UAList.length));
		return isisNoTraceShare.isisNoTraceSharedObjects.UAList[index];
	},
	getRandomScreenResolution: function(){
		var index=Math.floor((Math.random()*isisNoTraceShare.isisNoTraceSharedObjects.SRList.length));
		return isisNoTraceShare.isisNoTraceSharedObjects.SRList[index];
	},
	getRandomColorDepth: function() {
		var index=Math.floor((Math.random()*isisNoTraceShare.isisNoTraceSharedObjects.CDList.length));
		return isisNoTraceShare.isisNoTraceSharedObjects.CDList[index];
	},
	/**
	*	This component implements an in memory DB
	*/
	internalLogger:{
		/**
		hashtable is used to store blockable resources from one domain. The key is the domain and the value is a hash<key, value> 
		with the result of genKey as key and an object containing all the information about the resource and the posible applying techniques
		*/
		hashtable: new Object(),
		/**
		* regexp_all_aggregators contains all the aggregators discovered from a previous analysis
		* regexp_all_TTP contains all the trusted third party discovered from a previous analysis
		* regexp_stopword contains all words that are meangingless
		*/
		//regexp_all_aggregators: new RegExp("(doubleclick\.net)|(google-analytics\.com)|(scorecardresearch\.com)|(adnxs\.com)|(yieldmanager\.com)|(2o7\.net)|(crwdcntrl\.net)|(pubmatic\.com)|(2mdn\.net)|(imrworldwide)|(kissmetrics)|(247realmedia\.com)|(loadus\.exelator\.com)|(googlesyndacation)|(content\.aimatch\.com)|(pagead2\.googlesyndication\.com)|(static\.atgsvcs\.com)|(adan1\.xtendmedia\.com)|(betrad)|(\.edgesuite\.net)|(ping\.chartbeat\.net)|(ad\.z5x\.net)|(\.criteo\.net)|(\.criteo\.com)|(ad\.xtendmedia\.com)|(eu-pn4\.adserver\.yahoo\.com)|(rubiconproject)|(uk\.adserver\.yahoo\.com)|(adbuyer)|(bc\.yahoo\.com)|(bluelithium)|(content\.yieldmanager\.edgesuite\.net)|(exelator\.com)|(tribalfusion\.com)|(adserver\.adtechus\.com)|(bluekai)|(collective-media\.net)|(csc\.beap\.bc\.yahoo\.com)|(geo\.yahoo\.com)|(mediaplex)|(mookie1)|(newrelic)|(realmedia)|(bid\.openx\.net)|(bs\.serving-sys\.com)|(cas\.be\.eu\.criteo\.com)|(doubleverify)|(imagec18\.247realmedia\.com)|(lijit)|(nexus\.ensighten\.com)|(xtendmedia\.com)|(y\.analytics\.yahoo\.com)|(z5x\.net)|(a\.analytics\.yahoo\.com)|(amgdgt)|(data01\.adlooxtracking\.com)|(\.bluecava\.com)|(ensighten\.com)|(liverail)|(\.demdex\.net)|(nextag\.com)|(omtrdc\.net)|(pixel\.mathtag\.com)|(revsci)|(tag\.admeld\.com)|(tags\.expo9\.exponential\.com)|(\.omtrdc\.net)|(us\.adserver\.yahoo\.com)|(us\.bc\.yahoo\.com)|(a\.tribalfusion\.com)|(adadvisor\.net)|(adv\.adsbwm\.com)|(advanseads)|(aimatch\.com)|(beacon\.krxd\.net)|(btrll)|(everestjs\.net)|(flashtalking)|(googleadservices\.com)|(googletagservices\.com)|(les-experts\.com)|(metrics\.rcsmetrics\.it)|(metrics\.reedbusiness\.net)|(o\.analytics\.yahoo\.com)|(optimizely)|(overblog\.ezakus\.net)|(pixel\.everesttech\.net)|(pixel\.quantserve\.com)|(questionmarket)|(quova)|(row\.bc\.yahoo\.com)|(skimresources)|(thestar\.com)|(tidaltv\.com)|(statse\.webtrendslive\.com)|(view\.atdmt\.com)"),
		regexp_all_aggregators: new RegExp("(doubleclick\.net)|(google-analytics\.com)|(scorecardresearch\.com)|(adnxs\.com)|(yieldmanager\.com)|(2o7\.net)|(crwdcntrl\.net)|(pubmatic\.com)|(2mdn\.net)|(imrworldwide)|(kissmetrics)|(247realmedia\.com)|(\.exelator\.com)|(\.aimatch\.com)|(\.googlesyndication\.com)|(\.atgsvcs\.com)|(\.xtendmedia\.com)|(betrad)|(\.edgesuite\.net)|(\.chartbeat\.net)|(\.z5x\.net)|(\.criteo\.net)|(\.criteo\.com)|(\.adserver\.yahoo\.com)|(uk\.adserver\.yahoo\.com)|(adbuyer)|(bc\.yahoo\.com)|(content\.yieldmanager\.edgesuite\.net)|(tribalfusion\.com)|(adserver\.adtechus\.com)|(collective-media\.net)|(csc\.beap\.bc\.yahoo\.com)|(geo\.yahoo\.com)|(newrelic\.com)|(realmedia)|(bid\.openx\.net)|(bs\.serving-sys\.com)|(cas\.be\.eu\.criteo\.com)|(doubleverify\.com)|(\.247realmedia\.com)|(lijit)|(\.ensighten\.com)|(xtendmedia\.com)|(y\.analytics\.yahoo\.com)|(z5x\.net)|(a\.analytics\.yahoo\.com)|(amgdgt)|(data01\.adlooxtracking\.com)|(\.bluecava\.com)|(ensighten\.com)|(liverail)|(\.demdex\.net)|(nextag\.com)|(omtrdc\.net)|(pixel\.mathtag\.com)|(revsci)|(tag\.admeld\.com)|(tags\.expo9\.exponential\.com)|(\.omtrdc\.net)|(us\.adserver\.yahoo\.com)|(us\.bc\.yahoo\.com)|(a\.tribalfusion\.com)|(adadvisor\.net)|(adv\.adsbwm\.com)|(advanseads)|(aimatch\.com)|(beacon\.krxd\.net)|(btrll)|(everestjs\.net)|(flashtalking)|(googleadservices\.com)|(googletagservices\.com)|(les-experts\.com)|(metrics\.rcsmetrics\.it)|(metrics\.reedbusiness\.net)|(o\.analytics\.yahoo\.com)|(optimizely)|(overblog\.ezakus\.net)|(pixel\.everesttech\.net)|(pixel\.quantserve\.com)|(questionmarket)|(quova)|(row\.bc\.yahoo\.com)|(skimresources)|(thestar\.com)|(tidaltv\.com)|(statse\.webtrendslive\.com)|(view\.atdmt\.com)|(scorecardresearch\.com)|(doubleclick\.net)|(google-analytics\.com)|(2mdn\.net)|(imrworldwide\.com)|(googlesyndication\.com)|(quantserve\.com)|(googleadservices\.com)|(chartbeat\.com)|(yieldmanager\.com)|(revsci\.net)|(chartbeat\.net)|(adnxs\.com)|(atdmt\.com)|(2o7\.net)|(rubiconproject\.com)|(bluekai\.com)|(invitemedia\.com)|(googletagservices\.com)|(admeld\.com)|(betrad\.com)|(mookie1\.com)|(serving-sys\.com)|(bizographics\.com)|(dl-rms\.com)|(247realmedia\.com)|(turn\.com)|(addthis\.com)|(crwdcntrl\.net)|(brightcove\.com)|(advertising\.com)|(llnwd\.net)|(adtech\.de)|(adinterax\.com)|(visualrevenue\.com)|(openx\.net)|(nexac\.com)|(mathtag\.com)|(edgesuite\.net)|(adsonar\.com)|(optimizely\.com)|(collective-media\.net)|(tynt\.com)|(omtrdc\.net)|(demdex\.net)|(adadvisor\.net)|(invitemedia\.net)|(disqus\.com)|(bkrtx\.com)|(bluelithium\.com)|(effectivemeasure\.net)|(pointroll\.com)|(adform\.net)|(w55c\.net)|(pubmatic\.com)|(mmismm\.com)|(fwmrm\.net)|(tribalfusion\.com)|(flashtalking\.com)|(atwola\.com)|(questionmarket\.com)|(p-td\.com)|(contextweb\.com)|(rlcdn\.com)|(outbrain\.com)|(mediaplex\.com)|(media6degrees\.com)|(fastclick\.net)|(doubleverify\.com)|(adtechus\.com)|(zedo\.com)|(tidaltv\.com)|(adap\.tv)|(zanox\.com)|(wunderloop\.net)|(unica\.com)|(specificclick\.net)|(liverail\.com)|(gravity\.com)|(exponential\.com)|(unicast\.com)|(lijit\.com)|(everesttech\.net)|(cpxinteractive\.com)|(adsafeprotected\.com)|(yieldmanager\.net)|(voicefive\.com)|(tradedoubler\.com)|(tacoda\.net)|(skimresources\.com)|(rtbidder\.net)|(overture\.com)|(newsinc\.com)|(checkm8\.com)|(casalemedia\.com)|(adsrvr\.org)|(sharethis\.com)|(peer39\.net)|(interclick\.com)|(insightexpressai\.com)|(com\.cn)|(chango\.com)|(brilig\.com)|(auditude\.com)|(amazon-adsystem\.com)|(acxiom-online\.com)|(wtp101\.com)|(webtrendslive\.com)|(vizu\.com)|(teracent\.net)|(ru4\.com)|(rfihub\.com)|(fetchback\.com)|(audienceiq\.com)|(yldmgrimg\.net)|(triggit\.com)|(tapad\.com)|(sitemeter\.com)|(simpli\.fi)|(raasnet\.com)|(polldaddy\.com)|(netmng\.com)|(mixpanel\.com)|(ixiaa\.com)|(fmpub\.net)|(digitouch\.it)|(cxense\.com)|(33across\.com)|(zanox-affiliate\.de)|(viglink\.com)|(taboolasyndication\.com)|(smartadserver\.com)|(realtime\.co)|(quisma\.com)|(publicidees\.com)|(pro-market\.net)|(myadexchanges\.com)|(msads\.net)|(lucidmedia\.com)|(iperceptions\.com)|(inskinmedia\.com)|(ib-ibi\.com)|(heias\.com)|(displaymarketplace\.com)|(afy11\.net)|(adobetag\.com)|(adition\.com)|(adcop\.net)|(adbrite\.com)|(360yield\.com)|(wrating\.com)|(webtrends\.com)|(undertone\.com)|(trb\.com)|(targetbase\.com)|(tanx\.com)|(spotxchange\.com)|(mediav\.com)|(ivwbox\.de)|(gwallet\.com)|(adroll\.com)|(yieldbuild\.com)|(microad\.jp)|(kontera\.com)|(dmtracker\.com)|(cnzz\.com)|(apmebf\.com)|(adxpose\.com)|(adshuffle\.com)|(adserverplus\.com)|(ads-creativesyndicator\.com)|(adresult\.jp)|(admailtiser\.com)|(adjug\.com)|(ad4mat\.it)|(4dsply\.com)|(365dm\.com)|(360buyimg\.com)|(yieldoptimizer\.com)|(ydstatic\.com)|(yandex\.st)|(yandex\.net)|(yabuka\.com)|(veruta\.com)|(technoratimedia\.com)|(openxmarket\.jp)|(moonbasa\.com)|(miaozhen\.com)|(kissmetrics\.com)|(ipinyou\.com)|(infolinks\.com)|(infinity-tracking\.net)|(industrybrains\.com)|(indieclick\.com)|(impact-ad\.jp)|(hurra\.com)|(htwisdom\.com)|(httpool\.com)|(gravityadnetwork\.com)|(googletagmanager\.com)|(ftv-publicite\.fr)|(financialcontent\.com)|(fimserve\.com)|(eyewonder\.com)|(eyedemand\.com)|(expressindia\.com)|(experian\.com)|(evolvemediacorp\.com)|(etargetnet\.com)|(estat\.com)|(eqads\.com)|(endless\.com)|(eloqua\.com)|(domdex\.com)|(demandbase\.com)|(dedicatedmedia\.com)|(decknetwork\.net)|(daylife\.com)|(ctasnet\.com)|(connextra\.com)|(clkads\.com)|(clickfuse\.com)|(clickdensity\.com)|(choicestream\.com)|(chitika\.net)|(channelfinder\.net)|(c3tag\.com)|(buysellads\.com)|(bmmetrix\.com)|(bidsystem\.com)|(avazudsp\.net)|(avazu\.net)|(audiencefuel\.com)|(atemda\.com)|(assoc-amazon\.com)|(amgdgt\.com)|(allyes\.com)|(adzhub\.com)|(adzerk\.net)|(advolution\.de)|(adviva\.net)|(adtegrity\.net)|(adsymptotic\.com)|(adshost1\.com)|(adscale\.de)|(ads\.cc)|(ad-plus\.cn)|(adotube\.com)|(adohana\.com)|(adocean\.pl)|(adlantis\.jp)|(adimg\.net)|(adgrx\.com)|(adfusion\.com)|(adformdsp\.net)|(adc-serv\.net)|(adaos-ads\.net)|(adagionet\.com)|(ad4mat\.net)|(ad4mat\.de)|(4wnet\.com)|(24option\.com)|(1cat\.com)|(126\.net)"),
		regexp_all_TTP: new RegExp("(sharethis)|(vex\.wildtangent\.com)(afy11)|(globalregsession\.go\.com)|(harrenmedianetwork\.com)|(ajax\.googleapis\.com)|(beacon-1\.newrelic\.com)|(ct1\.addthis\.com)|(e2\.cdn\.qnsr\.com)|(ft2\.autonomycloud\.com)|(o\.sa\.aol\.com)|(o1\.qnsr\.com)|(oimg\.nbcuni\.com)|(om\.cbsi\.com)|(qubitproducts)|(skavaone\.com)|(\.viximo\.com)|(typekit\.net)|(ooyala\.com)|(crowdscience\.com)|(addthisedge\.com)|(tubemogul\.com)|(pinterest\.com)|(meebo\.com)|(godaddy\.com)|(performgroup\.com)|(nbcudigitaladops\.com)|(clicktale\.net)|(abmr\.net)|(agkn\.com)|(optimost\.com)|(jump-time\.net)|(edgecastcdn\.net)|(bet-at-home\.com)|(timeinc\.net)|(axf8\.net)|(visualwebsiteoptimizer\.com)|(ugdturner\.com)|(tcgmsrv\.net)|(janrainbackplane\.com)|(dotomi\.com)|(s-msn\.com)|(reduxmediagroup\.com)|(owneriq\.net)|(bit\.ly)|(alimama\.com)|(alimama\.cn)|(yadro\.ru)|(sitestat\.com)|(rcsmetrics\.it)|(maxymiser\.com)|(featurelink\.com)|(crsspxl\.com)|(yldbt\.com)|(yb0t\.com)|(weborama\.fr)|(tns-counter\.ru)|(stats\.com)|(statcounter\.com)|(skimlinks\.com)|(connexity\.net)|(skinected\.com)|(qservz\.com)|(mail\.ru)|(da-ads\.com)|(cnzz\.net)|(websitealive7\.com)|(warriorpro\.com)|(v-56\.com)|(tns-cs\.net)|(tinyurl\.com)|(sogou\.com)|(refinedads\.com)|(redditgifts\.com)|(quality-channel\.de)|(openx\.org)|(onionstatic\.com)|(odnoklassniki\.ru)|(netseer\.com)|(mxptint\.net)|(mouseflow\.com)|(livezilla\.net)|(knet\.cn)|(jscount\.com)|(irs01\.net)|(irs01\.com)|(igapi\.com)|(iclive\.com)|(gorillanation\.com)|(getclicky\.com)|(gamerdna\.com)|(eu-survey\.com)|(eproof\.com)|(ecritel\.net)|(ebayrtm\.com)|(dt07\.net)|(dsply\.com)|(cxt\.ms)|(culack\.com)|(ctnsnet\.com)|(ct-miami\.com)|(crosspixel\.net)|(coxmediagroup\.com)|(conviva\.com)|(conduit-data\.com)|(cogmatch\.net)|(cnnic\.cn)|(chtah\.com)|(cedexis\.org)|(c-col\.com)|(ca-mpr\.jp)|(track\.cafemomstatic\.com)|(brand\.net)|(bidswitch\.net)|(bet365affiliates\.com)|(autonomycloud\.com)|(aunticles\.com)|(atpanel\.com)|(atomex\.net)|(as5000\.com)|(amung\.us)|(aliunicorn\.com)|(adsbyisocket\.com)|(adlooxtracking\.com)|(accuenmedia\.com)|(56imgs\.com)|(2hua\.com)"),
		regexp_stopword: new RegExp("(^SPPC$)|(^awcc$)|(^check$)|(^availability$)|(^month$)|(^year$)|(^monthday$)|(^hid$)|(^medium$)|(^source$)|(^Slice$)|(^Pool$)|(^tripad$)|(^searchresults$)|(^bddf$)|(^sid$)|(^hid$)|(^swf$)|(^player$)|(^titlecards$)|(^intl$)|(^adp$)|(^Beboerhome$)|(^nmime$)|(^ema$)|(^sandbox$)|(^uvpages$)|(^moniker$)|(^sendEvent$)|(^aspx$)|(^sandbox$)|(^bksite$)|(^trncrv$)|(^trntrg$)|(^trncrt$)|(^mmath$)|(^bluecava$)|(^nmine$)|(^bksite$)|(^crypt$)|(^referrer$)|(^random$)|(^PushDown$)|(^gampad$)|(^slots$)|(^params$)|(^RefDocLoc$)|(^Error$)|(^nmine$)|(^nplug$)|(^acxiom$)|(^UUID$)|(^iframe$)|(^online$)|(^adnxs$)|(^doubleclick$)|(^exelate$)|(^mediamath$)|(^demdex$)|(^pixel$)|(^view[a-zA-Z]+$)|(^TRACKING$)|(^CLICK$)|(^xbbe$)|(^code$)|(^macro$)|(^freq$)|(^user$)|(^dedup$)|(^studioPushDown$)|(^richmedia$)|(^Parent$)|(^cust$)|(^client$)|(^clients$)|(^data$)|(^date$)|(^roundtrip$)|(^roundtrip$)|(^roundtrip$)|(^roundtrip$)|(^Orig$)|(^Dest$)|(^leaveday$)|(^leavemonth$)|(^leavetime$)|(^retday$)|(^retmonth$)|(^rettime$)|(^adults$)|(^ipGeo$)|(^ipCountry$)|(^default$)|(^itin$)|(^false$)|(^true$)|(^http$)|(^size$)|(^size$)|(^size$)|(^size$)|(^size$)|(^size$)|(^size$)|(^site$)|(^trav$)|(^affiliate$)|(^cuname$)|(^dccl$)|(^reloc$)|(^mons$)|(^imons$)|(^cstat$)|(^degr$)|(^tile$)|(^plat$)|(^kage$)|(^kauth$)|(^kgender$)|(^kmyd$)|(^dictionary$)|(^home$)|(^index$)|(^html$)|(^content$)|(^detail$)|(^details$)|(^a$)|(^an$)|(^and$)|(^as$)|(^at$)|(^before$)|(^but$)|(^by$)|(^for$)|(^from$)|(^is$)|(^in$)|(^into$)|(^like$)|(^of$)|(^off$)|(^on$)|(^onto$)|(^per$)|(^since$)|(^than$)|(^the$)|(^this$)|(^that$)|(^to$)|(^up$)|(^via$)|(^with$)|(^ble$)|(^about$)|(^above$)|(^abroad$)|(^according$)|(^accordingly$)|(^across$)|(^actually$)|(^adj$)|(^after$)|(^afterwards$)|(^again$)|(^against$)|(^ago$)|(^ahead$)|(^ain\'t$)|(^all$)|(^allow$)|(^allows$)|(^almost$)|(^alone$)|(^along$)|(^alongside$)|(^already$)|(^also$)|(^although$)|(^always$)|(^am$)|(^amid$)|(^amidst$)|(^among$)|(^amongst$)|(^an$)|(^and$)|(^another$)|(^any$)|(^anybody$)|(^anyhow$)|(^anyone$)|(^anything$)|(^anyway$)|(^anyways$)|(^anywhere$)|(^apart$)|(^appear$)|(^appreciate$)|(^appropriate$)|(^are$)|(^aren\'t$)|(^around$)|(^as$)|(^a\'s$)|(^aside$)|(^ask$)|(^asking$)|(^associated$)|(^at$)|(^available$)|(^away$)|(^awfully$)|(^back$)|(^backward$)|(^backwards$)|(^be$)|(^became$)|(^because$)|(^become$)|(^becomes$)|(^becoming$)|(^been$)|(^before$)|(^beforehand$)|(^begin$)|(^behind$)|(^being$)|(^believe$)|(^below$)|(^beside$)|(^besides$)|(^best$)|(^better$)|(^between$)|(^beyond$)|(^both$)|(^brief$)|(^but$)|(^by$)|(^came$)|(^can$)|(^cannot$)|(^cant$)|(^can\'t$)|(^caption$)|(^cause$)|(^causes$)|(^certain$)|(^certainly$)|(^changes$)|(^clearly$)|(^c\'mon$)|(^co$)|(^co.$)|(^com$)|(^come$)|(^comes$)|(^concerning$)|(^consequently$)|(^consider$)|(^considering$)|(^contain$)|(^containing$)|(^contains$)|(^corresponding$)|(^could$)|(^couldn\'t$)|(^course$)|(^c\'s$)|(^currently$)|(^dare$)|(^daren\'t$)|(^definitely$)|(^described$)|(^despite$)|(^did$)|(^didn\'t$)|(^different$)|(^directly$)|(^do$)|(^does$)|(^doesn\'t$)|(^doing$)|(^done$)|(^don\'t$)|(^down$)|(^downwards$)|(^during$)|(^each$)|(^edu$)|(^eg$)|(^eight$)|(^eighty$)|(^either$)|(^else$)|(^elsewhere$)|(^end$)|(^ending$)|(^enough$)|(^entirely$)|(^especially$)|(^et$)|(^etc$)|(^even$)|(^ever$)|(^evermore$)|(^every$)|(^everybody$)|(^everyone$)|(^everything$)|(^everywhere$)|(^ex$)|(^exactly$)|(^example$)|(^except$)|(^fairly$)|(^far$)|(^farther$)|(^few$)|(^fewer$)|(^fifth$)|(^first$)|(^five$)|(^followed$)|(^following$)|(^follows$)|(^for$)|(^forever$)|(^former$)|(^formerly$)|(^forth$)|(^forward$)|(^found$)|(^four$)|(^from$)|(^further$)|(^furthermore$)|(^get$)|(^gets$)|(^getting$)|(^given$)|(^gives$)|(^go$)|(^goes$)|(^going$)|(^gone$)|(^got$)|(^gotten$)|(^greetings$)|(^had$)|(^hadn\'t$)|(^half$)|(^happens$)|(^hardly$)|(^has$)|(^hasn\'t$)|(^have$)|(^haven\'t$)|(^having$)|(^he$)|(^he\'d$)|(^he\'ll$)|(^hello$)|(^help$)|(^hence$)|(^her$)|(^here$)|(^hereafter$)|(^hereby$)|(^herein$)|(^here\'s$)|(^hereupon$)|(^hers$)|(^herself$)|(^he\'s$)|(^hi$)|(^him$)|(^himself$)|(^his$)|(^hither$)|(^hopefully$)|(^how$)|(^howbeit$)|(^however$)|(^hundred$)|(^i\'d$)|(^ie$)|(^if$)|(^ignored$)|(^i\'ll$)|(^i\'m$)|(^immediate$)|(^in$)|(^inasmuch$)|(^inc$)|(^inc.$)|(^indeed$)|(^indicate$)|(^indicated$)|(^indicates$)|(^inner$)|(^inside$)|(^insofar$)|(^instead$)|(^into$)|(^inward$)|(^is$)|(^isn\'t$)|(^it$)|(^it\'d$)|(^it\'ll$)|(^its$)|(^it\'s$)|(^itself$)|(^i\'ve$)|(^just$)|(^k$)|(^keep$)|(^keeps$)|(^kept$)|(^know$)|(^known$)|(^knows$)|(^last$)|(^lately$)|(^later$)|(^latter$)|(^latterly$)|(^least$)|(^less$)|(^lest$)|(^let$)|(^let\'s$)|(^like$)|(^liked$)|(^likely$)|(^likewise$)|(^little$)|(^look$)|(^looking$)|(^looks$)|(^low$)|(^lower$)|(^ltd$)|(^made$)|(^mainly$)|(^make$)|(^makes$)|(^many$)|(^may$)|(^maybe$)|(^mayn\'t$)|(^me$)|(^mean$)|(^meantime$)|(^meanwhile$)|(^merely$)|(^might$)|(^mightn\'t$)|(^mine$)|(^minus$)|(^miss$)|(^more$)|(^moreover$)|(^most$)|(^mostly$)|(^mr$)|(^mrs$)|(^much$)|(^must$)|(^mustn\'t$)|(^my$)|(^myself$)|(^name$)|(^namely$)|(^nd$)|(^near$)|(^nearly$)|(^necessary$)|(^need$)|(^needn\'t$)|(^needs$)|(^neither$)|(^never$)|(^neverf$)|(^neverless$)|(^nevertheless$)|(^new$)|(^next$)|(^nine$)|(^ninety$)|(^no$)|(^nobody$)|(^non$)|(^none$)|(^nonetheless$)|(^noone$)|(^no-one$)|(^nor$)|(^normally$)|(^not$)|(^nothing$)|(^notwithstanding$)|(^novel$)|(^now$)|(^nowhere$)|(^obviously$)|(^of$)|(^off$)|(^often$)|(^oh$)|(^ok$)|(^okay$)|(^old$)|(^on$)|(^once$)|(^one$)|(^ones$)|(^one\'s$)|(^only$)|(^onto$)|(^opposite$)|(^or$)|(^other$)|(^others$)|(^otherwise$)|(^ought$)|(^oughtn\'t$)|(^our$)|(^ours$)|(^ourselves$)|(^out$)|(^outside$)|(^over$)|(^overall$)|(^own$)|(^particular$)|(^particularly$)|(^past$)|(^per$)|(^perhaps$)|(^placed$)|(^please$)|(^plus$)|(^possible$)|(^presumably$)|(^probably$)|(^provided$)|(^provides$)|(^que$)|(^quite$)|(^qv$)|(^rather$)|(^rd$)|(^re$)|(^really$)|(^reasonably$)|(^recent$)|(^recently$)|(^regarding$)|(^regardless$)|(^regards$)|(^relatively$)|(^respectively$)|(^right$)|(^round$)|(^said$)|(^same$)|(^saw$)|(^say$)|(^saying$)|(^says$)|(^second$)|(^secondly$)|(^see$)|(^seeing$)|(^seem$)|(^seemed$)|(^seeming$)|(^seems$)|(^seen$)|(^self$)|(^selves$)|(^sensible$)|(^sent$)|(^serious$)|(^seriously$)|(^seven$)|(^several$)|(^shall$)|(^shan\'t$)|(^she$)|(^she\'d$)|(^she\'ll$)|(^she\'s$)|(^should$)|(^shouldn\'t$)|(^since$)|(^six$)|(^so$)|(^some$)|(^somebody$)|(^someday$)|(^somehow$)|(^someone$)|(^something$)|(^sometime$)|(^sometimes$)|(^somewhat$)|(^somewhere$)|(^soon$)|(^sorry$)|(^specified$)|(^specify$)|(^specifying$)|(^still$)|(^sub$)|(^such$)|(^sup$)|(^sure$)|(^take$)|(^taken$)|(^taking$)|(^tell$)|(^tends$)|(^th$)|(^than$)|(^thank$)|(^thanks$)|(^thanx$)|(^that$)|(^that\'ll$)|(^thats$)|(^that\'s$)|(^that\'ve$)|(^the$)|(^their$)|(^theirs$)|(^them$)|(^themselves$)|(^then$)|(^thence$)|(^there$)|(^thereafter$)|(^thereby$)|(^there\'d$)|(^therefore$)|(^therein$)|(^there\'ll$)|(^there\'re$)|(^theres$)|(^there\'s$)|(^thereupon$)|(^there\'ve$)|(^these$)|(^they$)|(^they\'d$)|(^they\'ll$)|(^they\'re$)|(^they\'ve$)|(^thing$)|(^things$)|(^think$)|(^third$)|(^thirty$)|(^this$)|(^thorough$)|(^thoroughly$)|(^those$)|(^though$)|(^three$)|(^through$)|(^throughout$)|(^thru$)|(^thus$)|(^till$)|(^to$)|(^together$)|(^too$)|(^took$)|(^toward$)|(^towards$)|(^tried$)|(^tries$)|(^truly$)|(^try$)|(^trying$)|(^t\'s$)|(^twice$)|(^two$)|(^un$)|(^under$)|(^underneath$)|(^undoing$)|(^unfortunately$)|(^unless$)|(^unlike$)|(^unlikely$)|(^until$)|(^unto$)|(^up$)|(^upon$)|(^upwards$)|(^us$)|(^use$)|(^used$)|(^useful$)|(^uses$)|(^using$)|(^usually$)|(^v$)|(^value$)|(^various$)|(^versus$)|(^very$)|(^via$)|(^viz$)|(^vs$)|(^want$)|(^wants$)|(^was$)|(^wasn\'t$)|(^way$)|(^we$)|(^we\'d$)|(^welcome$)|(^well$)|(^we\'ll$)|(^went$)|(^were$)|(^we\'re$)|(^weren\'t$)|(^we\'ve$)|(^what$)|(^whatever$)|(^what\'ll$)|(^what\'s$)|(^what\'ve$)|(^when$)|(^whence$)|(^whenever$)|(^where$)|(^whereafter$)|(^whereas$)|(^whereby$)|(^wherein$)|(^where\'s$)|(^whereupon$)|(^wherever$)|(^whether$)|(^which$)|(^whichever$)|(^while$)|(^whilst$)|(^whither$)|(^who$)|(^who\'d$)|(^whoever$)|(^whole$)|(^who\'ll$)|(^whom$)|(^whomever$)|(^who\'s$)|(^whose$)|(^why$)|(^will$)|(^willing$)|(^wish$)|(^with$)|(^within$)|(^without$)|(^wonder$)|(^won\'t$)|(^would$)|(^wouldn\'t$)|(^yes$)|(^yet$)|(^you$)|(^you\'d$)|(^you\'ll$)|(^your$)|(^you\'re$)|(^yours$)|(^yourself$)|(^yourselves$)|(^you\'ve$)|(^zero$)|(^click$)|(^empty$)|(^domain$)|(^subtypes$)|(^onda$)|(^quiz$)|(^hserver$)|(^landing$)|(^track$)|(^ptype$)|(^spon$)|(^BIDURLENC$)|(^nsid$)|(^vert$)|(^feed$)|(^ashx$)"),
		personalScore: 15,
		sensitiveScore: 1,
		/**
		* hashTableOfAggregators contains all the information regarding the blocked/blockable objects for all the aggregators. from this hash we then select the top-10 aggregators
		*/
		hashTableOfAggregators: new Object(),
		/**
		* hashTableOfAggregators contains all the information regarding the blocked/blockable objects for all the aggregators. from this hash we then select the top-10 aggregators
		*/
		hashTableOfTrustedThirdParty: new Object(),
		hashForLeakedInformation:new Object(),
		/**
		hashtableForTechniques is a hasn table with the domain as the key and store an object with a property for each techinques. 
		The value of these properties are Array containing the objects blockable by that techniques
		*/
		hashtableForTechniques: new Object(),
		addDomain: function(domain) {
			if (!isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashtable.hasOwnProperty(domain)) {
				isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashtable[domain]=new Object();
				isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashtableForTechniques[domain]=new Object();
			}
		},
		addDomainTop10: function(domain) {
			if (!isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfAggregators.hasOwnProperty(domain)) {
				isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfAggregators[domain]=new Object();
				isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfAggregators[domain].count=0;
				isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfAggregators[domain].array=new Array();
			}
		},
		addDomainTop10TrustedThirdParty: function(domain) {
			if (!isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfTrustedThirdParty.hasOwnProperty(domain)) {
				isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfTrustedThirdParty[domain]=new Object();
				isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfTrustedThirdParty[domain].count=0;
				isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfTrustedThirdParty[domain].array=new Array();
			}
		},
		deleteDomain: function(domain) {
			if (isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashtable.hasOwnProperty(domain)) {
				var hash=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashtable[domain];
				for (var elem in hash) {
					delete elem;
				}
			}
		},
		genKey: function (resource,optionalHeaderName,reqOrig_domain,loc_domain, time){
			return optionalHeaderName+reqOrig_domain+resource+loc_domain;
		},
		getCount: function(techinque) {
			//return isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray[techinque]?isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray[techinque]:0;
			return isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray[techinque]?isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray[techinque].length:0;
		},
		getBlockableObjects: function(techinque) {
			//return isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray[techinque]?isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray[techinque]:0;
			return isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray[techinque]?isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray[techinque]:null;
		},
		getAllBlockableObjects: function() {
			//return isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray[techinque]?isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray[techinque]:0;
			if (isisNoTraceShare.isisNoTraceSharedObjects.oneTechArray==null) {isisNoTraceShare.isisNoTraceSharedObjects.oneTechArray=new Array();}
			for (var techinque in isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray) {
				isisNoTraceShare.isisNoTraceSharedObjects.oneTechArray=isisNoTraceShare.isisNoTraceSharedObjects.oneTechArray.concat(isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray[techinque]);
			}
			return isisNoTraceShare.isisNoTraceSharedObjects.oneTechArray;
		},
		getHashtableForTechniques: function(){
			return isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashtableForTechniques;
		},
		eraseDB: function() {
			delete isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashtable;
			delete isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfAggregators;
			isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfAggregators = new Object();
			isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashtable=new Object();
			for (var elem in isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray) {
				delete isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray[elem];
				isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray[elem]=new Array();
			}
			
			isisNoTraceShare.isisNoTraceSharedObjects.oneTechArray=null;
			
		},
		getSizeOfHash: function(hash) {
			var size=0, key;
			for (key in hash) {
				if (hash.hasOwnProperty(key)) size++;
			}
			return size;
		},
		getTop10AggregatorsHashMaps: function() {
			this.hashForLeakedInformation.personal=new Object();
			this.hashForLeakedInformation.personal.email=/EmailUsername=(^[\w-\.]+[@|\%40]([\w-]+\.)+[\w-]{2,4}$)|Email=(^[\w-\.]+[@|\%40]([\w-]+\.)+[\w-]{2,4}$)|account=(^[\w-\.]+[@|\%40]([\w-]+\.)+[\w-]{2,4}$)|username=(^[\w-\.]+[@|\%40]([\w-]+\.)+[\w-]{2,4}$)|username_or_email=(^[\w-\.]+[@|\%40]([\w-]+\.)+[\w-]{2,4}$)|uj=(^[\w-\.]+[@|\%40]([\w-]+\.)+[\w-]{2,4}$)|user_name=(^[\w-\.]+[@|\%40]([\w-]+\.)+[\w-]{2,4}$)|e%3D([\w-\.]+[@|\%40]([\w-]+\.)+[\w-]{2,4})%26|%3De%253D([\w-\.]+[@|\%252540]([\w-]+\.)+[\w-]{2,4})%2526/i;//EmailUsername|Email|account|username|username_or_email|uj|user_name|e%3Dgabriella.schizzetta%2540gmail.com%26
			this.hashForLeakedInformation.personal.age=/kage=(\d+)|pb_age=(\d+)|[^_]age=(\d+)/i; //kage|age|ag|pb_age|
			this.hashForLeakedInformation.personal.dob=/ag=(\b\d{2,4}\b)/i; //ag
			this.hashForLeakedInformation.personal.gender=/kgender=([a-zA-Z\s]+)|[^_]gender=([a-zA-Z\s]+)|gen=([a-zA-Z\s]+)|gd=([a-zA-Z\s]+)/i;//kgender|gender|gen|gd
			this.hashForLeakedInformation.personal.zipcode=/zip=(\d+)|iz=(\d+)|zip%3D(\d+)%2F|zip%3D(\d+)%2B|\&pb_zip=(\d+)\&|%2526zip%253D(\d+)%252B/i;//zip|iz
			this.hashForLeakedInformation.personal.country=/country=([a-zA-Z\s]+)|cntry=([a-zA-Z\s]+)|kcr=([a-zA-Z\s]+)|%2526country%253D([a-zA-Z\s]+)&/i;//country|cntry|kcr|
			this.hashForLeakedInformation.personal.name=/ln=([a-zA-Z\s]+)|%2526fn%253D([a-zA-Z\s]+%2526ln%253D[a-zA-Z\s]+)%2526|[^\w]fn=([a-zA-Z\s]+)|lanme=([a-zA-Z\s]+)|fname=([a-zA-Z\s]+)|&utmdt=([a-zA-Z\s]+%20[a-zA-Z\s]+%20%2F%20)|&user_name=(([a-zA-Z\s]+)(\+?)([a-zA-Z\s]+))&|%26fn%3D(.*?%26ln%3D.*?%26)/i;//ln=|fn=|lanme=|fname=|ccn|cuname|&utmdt=Gabriella%20Schizzetta%20%2F%20|&user_name=Gabriella+Schizzetta&|%26fn%3DGabriella%26ln%3DSchizzetta%26    |ccn=([a-zA-Z\s]+)|cuname=([a-zA-Z\s]+)|
			this.hashForLeakedInformation.personal.relationship=/loadus\.exelator\.com\/load\/.*rel=([a-zA-Z\s]+)/i;//http://loadus.exelator.com/load/?p=336&g=001&gd=female&ag=1982&rel=single
			this.hashForLeakedInformation.personal.city=/&prv=[a-zA-Z\s]+&com=([a-zA-Z\s]+)&|&city=([a-zA-Z\s]+)|&district=([a-zA-Z\s]+)&city=([a-zA-Z\s]+)&/i;//zip|iz
			this.hashForLeakedInformation.personal.region=/rg=([a-zA-Z\s]+)|region=([a-zA-Z\s]+)|&region_name&([a-zA-Z\s]+)&/i; //rg=|region=|&region_name&Campania&
			//this.hashForLeakedInformation.personal.ip=/ATC_ID=(((\d+)\.){3,3}\d+)|WT.co_f=(((\d+)\.){3,3}\d+)|WT_FPC=id=(((\d+)\.){3,3}\d+)|pe_geo_loc=(((\d+)\.){3,3}\d+)|MSCulture=IP=(((\d+)\.){3,3}\d+)|kp=(((\d+)\.){3,3}\d+)|UT1=(((\d+)\.){3,3}\d+)|WEBTRENDS_ID=(((\d+)\.){3,3}\d+)|Apache=(((\d+)\.){3,3}\d+)|?RemoteUser=(((\d+)\.){3,3}\d+)|FTUserTrack=(((\d+)\.){3,3}\d+)|sessionid=(((\d+)\.){3,3}\d+)/i; //ATC_ID|WT.co_f|WT_FPC=id=|pe_geo_loc| MSCulture=IP=|kp=|UT1=|WEBTRENDS_ID=|Apache=|?RemoteUser=|FTUserTrack=|sessionid=
			this.hashForLeakedInformation.personal.geolocalizationLon=/&lon=(\d+\.\d+)&/i; //&lon=14.765912055969238&
			this.hashForLeakedInformation.personal.geolocalizationLat=/&lat=(\d+\.\d+)&/i; //&lon=14.765912055969238&
			
			this.hashForLeakedInformation.sensistive=new Object();
			this.hashForLeakedInformation.sensistive.channel=/loadus\.exelator\.com.*&channel=([a-zA-Z\s]+)&/gi;//&channel=Dictionary&ctg=RC+PH&kw=atheism
			this.hashForLeakedInformation.sensistive.keyword=/loadus\.exelator\.com.*&kw=([a-zA-Z\s]+)/gi;//&channel=Dictionary&ctg=RC+PH&kw=atheism
			this.hashForLeakedInformation.sensistive.employment=/\bmonster\b.*\&ccn=(.*?)\&|\bmonster\b.*\&c_cnn=(.*?)\&/i;
            this.hashForLeakedInformation.sensistive.education=/\bmonster\b.*\&cuname=(.*?)\&|\bmonster\b.*\&c\_cuname=(.*?)\&/i;
			this.hashForLeakedInformation.travel=new Object();
			this.hashForLeakedInformation.travel.roundtrip=/roundtrip=([a-zA-Z\s]+)\&/gi;//Referer: http://www.tripadvisor.com/CheapFlights?roundtrip=yes&Orig=ROM&leaveday=13&leavemonth=03%2F2013&leavetime=anytime&Dest=JFK&retday=20&retmonth=03%2F2013&rettime=anytime&adults=2
			this.hashForLeakedInformation.travel.origin=/\&Orig=([a-zA-Z\s]+)\&/gi;
			this.hashForLeakedInformation.travel.destination=/\&Dest=([a-zA-Z\s]+)\&/gi;
			this.hashForLeakedInformation.travel.leave=/\&leaveday=(\d+)\&leavemonth=(\d+)%2F(\d+)\&leavetime=([a-zA-Z\s]+)\&/gi;
			this.hashForLeakedInformation.travel.arrive=/\&retday=(\d+)\&retmonth=(\d+)%2F(\d+)\&rettime=([a-zA-Z\s]+)\&/gi;
			this.hashForLeakedInformation.travel.passengers=/\&adults=(\d+)/gi;
			this.hashForLeakedInformation.travel.isp=/\&isp=(.*?)/gi; //&isp=Telecom+Italia
			this.hashForLeakedInformation.fingerprinting=new Object();
			this.hashForLeakedInformation.fingerprinting.ip=new Object();
			this.hashForLeakedInformation.fingerprinting.browserplugin=new Object();
			
			for (var key in isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfAggregators) {
				isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfAggregators[key].chosen=false;
			}
			var resultant_array=new Array();
			var old_max_object=new Object();
			old_max_object.score=Number.MAX_VALUE;
			var continueToSearch=true;
			var totalSize=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getSizeOfHash(isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfAggregators);
			for (var i=1;i<=totalSize;i++){
				var current_max_object=new Object();
				current_max_object.score=0;
				for (var key in isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfAggregators) {
					var object=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfAggregators[key];
					var listCaptured=object.array;
					var size=listCaptured.length;
					if (!object.score) {
						object.score=0;
						object.flag=false;
						//isisLogWrapper.logToConsole("KEY: "+key+"-------"+score);
						for (elem in this.hashForLeakedInformation.personal) {
							for(var j=0;j<size;j++){
								var regexp=this.hashForLeakedInformation.personal[elem];
								var result=listCaptured[j].resource.match(regexp);
								if (result!=null && result.length>0) {
									//isisLogWrapper.logToConsole("KEY: "+current_max_object.key+"-----"+elem+"---->"+listCaptured[j].resource);
									object.score+=this.personalScore;
									object.flag=true;
								}
								if (listCaptured[j].referer) {
									var result=listCaptured[j].referer.match(regexp);
									if (result!=null && result.length>0) {
										object.score+=this.personalScore;
										object.flag=true;
									}
									else {
										object.score+=this.sensitiveScore;
										object.flag=true;
									}
								}
							}
						}
					}
					if (!object.flag && object.key.match("doubleclick\.net|oogle-analytics\.com|scorecardresearch\.com|adnx\.com|yieldmanager\.com") && object.score>0) {
					    object.flag = true;
					    resultant_array.push(object);
					}
					//isisLogWrapper.logToConsole("KEY DOPO: "+key+"-------"+object.score+"------"+current_max_object.score+"************"+object.score+"*********"+old_max_object.score);
					if (!object.chosen && object.score>current_max_object.score && object.score<=old_max_object.score) {
						//isisLogWrapper.logToConsole("Settato: "+key+"-------"+object.score+"-----"+object.referer);
						current_max_object=object;
					}
				}
				current_max_object.chosen=true;
				old_max_object=current_max_object;
				//isisLogWrapper.logToConsole("KEY PRIMA CHECK ARRAY: "+current_max_object.key+"-------"+current_max_object.score);
				if (current_max_object.flag) resultant_array.push(current_max_object); 
			}
			return resultant_array;
		},
		getTop10TrustedThirdPartyHashMaps: function() {
			for (var key in isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfTrustedThirdParty) {
				isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfTrustedThirdParty[key].chosen=false;
			}
			var resultant_array=new Array();
			var old_max_object=new Object();
			old_max_object.score=Number.MAX_VALUE;
			var continueToSearch=true;
			var totalSize=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getSizeOfHash(isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfTrustedThirdParty);
			for (var i=1;i<=totalSize;i++){
				var current_max_object=new Object();
				current_max_object.score=0;
				for (var key in isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfTrustedThirdParty) {
					var object=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfTrustedThirdParty[key];
					var listCaptured=object.array;
					var size=listCaptured.length;
					if (!object.score) {
						object.score=0;
						object.flag=false;
						for (elem in this.hashForLeakedInformation.personal) {
							for(var j=0;j<size;j++){
								var regexp=this.hashForLeakedInformation.personal[elem];
								var result=listCaptured[j].resource.match(regexp);
								if (result!=null && result.length>0) {
									object.score+=this.personalScore;
									object.flag=true;
								}
								if (listCaptured[j].referer) {
									var result=listCaptured[j].referer.match(regexp);
									if (result!=null && result.length>0) {
										object.score+=this.personalScore;
										object.flag=true;
									}
									else {
										object.score+=this.sensitiveScore;
										object.flag=true;
									}
								}
							}
						}
					}
					if (!object.chosen && object.score>current_max_object.score && object.score<=old_max_object.score) {
						current_max_object=object;
					}
				}
				current_max_object.chosen=true;
				old_max_object=current_max_object;
				if (current_max_object.flag) resultant_array.push(current_max_object);
			}
			return resultant_array;
		},
		removeInitialDot: function(string){string=string.replace(/^\./i,""); return string},
		insertResourceInMemory: function(domain,resource,optionalHeaderName,reqOrig_domain,loc_domain, time, arrayOfTechinques, isRef, referer) {
			isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.addDomain(domain);
			var hash=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashtable[domain];
			var obj=new Object();
			obj.resource=resource;
			obj.optionalHeaderName=optionalHeaderName;
			obj.reqOrig_domain=reqOrig_domain;
			obj.loc_domain=loc_domain;
			obj.time=time;
			obj.techniques=arrayOfTechinques;
			obj.nonoscript=null;
			obj.nometaredirectandcookie=null;
			//obj.nometaredirect=null;
			obj.nojscookie=null;
			obj.nojs=null;
			obj.noimg=null;
			obj.no3cookie=null;
			obj.no3img=null;
			obj.no3js=null;
			obj.no3pe=null;
			obj.no3objnoid=null;
			obj.noad=null;
			obj.nocookie=null;
			obj.noidheader=null;
			obj.notop=null;
			obj.nowebbug=null;
			obj.noflashcookie=null;
			obj.no3hiddenobj=null;
			obj.no3hidden=null;
			var key=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.genKey(resource,optionalHeaderName,reqOrig_domain,loc_domain, time);
			//write into the db
			//isisLogWrapper.logToConsole("ADDED:   "+obj.resource);
			if (obj.optionalHeaderName!="") {
				if (obj.optionalHeaderName=="Set-Cookie") {
					//nocookie
					if (hash.hasOwnProperty(key)) {
						var dbtime=hash[key].time;
						//update
						if(dbtime!=time){
							//change time
							hash[key].time=time;
							return true;
						}
					}
					else {
						//insert
						if(obj.reqOrig_domain!=obj.loc_domain){
							obj.no3cookie=1;
							obj.nocookie=1;
							isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['no3cookie'].push(obj);
							var h=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashtableForTechniques[domain];
							if (!h.hasOwnProperty('no3cookie')) {
								h['no3cookie']=new Array();
							}
							h['no3cookie'].push(obj);
						}
						else {
							obj.nocookie=1;
						}
						isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['nocookie'].push(obj);
						var h=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashtableForTechniques[domain];
						if (!h.hasOwnProperty('nocookie')) {
							h['nocookie']=new Array();
						}
						h['nocookie'].push(obj);
					}
					dbtime=null;
					result=null;
					time=null;
				}
				else {
					//noidheader
					if (hash.hasOwnProperty(key)) {
						//isisLogWrapper.logToConsole("ADDED:   noidheader key   "+key+"---->"+obj.resource);
						//update
						var dbtime=hash[key].time;
						if(dbtime!=obj.time){
							//change time
							hash[key].time=time;
							return true;
						}
					}
					else{
						obj.noidheader=1;
						isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['noidheader'].push(obj);
						//isisLogWrapper.logToConsole("ADDED: "+isRef+"  noidheader    "+obj.reqOrig_domain+"---"+obj.loc_domain+"----"+obj.resource);
						var h=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashtableForTechniques[domain];
						if (!h.hasOwnProperty('noidheader')) {
							h['noidheader']=new Array();
						}
						h['noidheader'].push(obj);
						// Add it to the list of resources to be used for the top10 aggregators
						var match=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.regexp_all_aggregators.exec(obj.loc_domain);
						//isisLogWrapper.logToConsole("PRIMA KEY1: "+isRef+"----"+object.loc_domain+"-----"+obj.referer);
						if (match!=null && isRef) {
							var key=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.removeInitialDot(match[0]);
							//isisLogWrapper.logToConsole("MATCH FOUND: "+key);
							var object;
							isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.addDomainTop10(key);
							// Some resource for this domain (match[0]) has already been blocked. Therefore the object already exists.
							object=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfAggregators[key];
							object.count++;
							object.key=key;
							object.referer=obj.resource;
							obj.referer=obj.resource;
							object.array.push(obj);
							isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfAggregators[key]=object;
							//isisLogWrapper.logToConsole("Key1: "+key+"----"+object.count+"-----"+obj.referer);
						}
						//isisLogWrapper.logToConsole("PRIMA KEY2: "+isRef+"----"+object.loc_domain+"-----"+obj.referer);
						var match=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.regexp_all_TTP.exec(obj.loc_domain);
						if (match!=null && isRef) {
							var key=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.removeInitialDot(match[0]);
							var object;
							isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.addDomainTop10TrustedThirdParty(key);
							// Some resource for this domain (match[0]) has already been blocked. Therefore the object already exists.
							object=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfTrustedThirdParty[key];
							object.count++;
							object.key=key;
							object.referer=obj.resource;
							obj.referer=obj.resource;
							object.array.push(obj);
							isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfTrustedThirdParty[key]=object;
							//isisLogWrapper.logToConsole("Key2: "+key+"----"+object.count+"-----"+obj.referer);
						}
					}

					dbtime=null;
					result=null;
					//time=null;
				}
			}
			else {
				//normal resource
				if (hash.hasOwnProperty(key)) {
					//update
					var dbtime=hash[key].time;
					if(dbtime!=obj.time){
						//change time
						hash[key].time=time;
						return true;
					}
				}
				else{
					for (var x in obj.techniques) {
						//isisLogWrapper.logToConsole("ADDED:   "+obj.techniques[x]+"    "+isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray[obj.techniques[x]]);
						obj[obj.techniques[x]]=1;
						isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray[obj.techniques[x]].push(obj);
						var h=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashtableForTechniques[domain];
						if (!h.hasOwnProperty(obj.techniques[x])) {
							h[obj.techniques[x]]=new Array();
						}
						h[obj.techniques[x]].push(obj);
						// Add it to the list of resources to be used for the top10 aggregators
						var match=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.regexp_all_aggregators.exec(obj.resource);
						if (match!=null) {
							var key=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.removeInitialDot(match[0]);
							var object;
							isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.addDomainTop10(key);
							// Some resource for this domain (match[0]) has already been blocked. Therefore the object already exists.
							object=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfAggregators[key];
							object.count++;
							object.key=key;
							if (referer) object.referer=referer;
							object.array.push(obj);
							isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfAggregators[key]=object;
						}
						var match=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.regexp_all_TTP.exec(obj.resource);
						if (match!=null) {
							var key=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.removeInitialDot(match[0]);
							var object;
							isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.addDomainTop10TrustedThirdParty(key);
							// Some resource for this domain (match[0]) has already been blocked. Therefore the object already exists.
							object=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfTrustedThirdParty[key];
							object.count++;
							object.key=key;
							if (referer) object.referer=referer;
							object.array.push(obj);
							isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashTableOfTrustedThirdParty[key]=object;
						}
					}
				}
				dbtime=null;
				result=null;
				//time=null;
			}
			//isisLogWrapper.logToConsole("ADDED:   "+isisNoTraceShare.isisNoTraceSharedObjects.completeTechArray['noidheader']);
			//isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashtable[key]=obj;
			hash[key]=obj;

		},
		flushEverything: function(){
			// this.timer.cancel();
			// while (isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.arrayOfElementsToInsert.length>0) {
				// this.writeOne();
			// }
			/**
			Here we should save all the relevant information in a DB or a File.
			*/
		},
	},
	listManager: {
        initiated: false,
        hashOfLists : new Object(),
        listMap: null,
        adList: null,
        Personal_adList: null,
        scriptlist: null,
        webbuglist: null,
        thirdpartylist: null,
        whitelist: new Object(),
        arrayOfWhitelistCDN: null,
        req: null,
        index: 0,
        someUpdatedAvailable: false,
        init: function(){
            if (!isisNoTraceShare.isisNoTraceSharedObjects.listManager.initiated) {
                isisNoTraceShare.isisNoTraceSharedObjects.listManager.initListMap();
                isisNoTraceShare.isisNoTraceSharedObjects.listManager.hashOfLists['whitelist']=null;
                isisNoTraceShare.isisNoTraceSharedObjects.listManager.hashOfLists['arrayOfWhitelistCDN']=null;
                isisNoTraceShare.isisNoTraceSharedObjects.listManager.hashOfLists['scriptlist']=null;
                isisNoTraceShare.isisNoTraceSharedObjects.listManager.hashOfLists['adList']=null;
                isisNoTraceShare.isisNoTraceSharedObjects.listManager.hashOfLists['Personal_adList']=null;
                isisNoTraceShare.isisNoTraceSharedObjects.listManager.hashOfLists['thirdpartylist']=null;
                //isisNoTraceShare.isisNoTraceSharedObjects.listManager.initAllFromDisk();
                isisNoTraceShare.isisNoTraceSharedObjects.listManager.initiated = true;
                //isisLogWrapper.logToConsole("listManager initiated");
            }
        },
        getList: function(listToRetrieve){
            if (isisNoTraceShare.isisNoTraceSharedObjects.listManager.hashOfLists.hasOwnProperty(listToRetrieve)) {
                //isisLogWrapper.logToConsole("Found list: " + listToRetrieve+": "+isisNoTraceShare.isisNoTraceSharedObjects.listManager.hashOfLists[listToRetrieve]);
                return isisNoTraceShare.isisNoTraceSharedObjects.listManager.hashOfLists[listToRetrieve];
            }
            else {
                return [];
            }
        },
        checkList: function(listToRetrieve, platform, currentVersion){
            isisNoTraceShare.isisNoTraceSharedObjects.listManager.req = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
            var fullURL = isisNoTraceShare.isisNoTraceSharedObjects.listManager.buildRequest(isisNoTraceShare.isisNoTraceSharedObjects.prefs.getCharPref("updateurl"), isisNoTraceShare.isisNoTraceSharedObjects.listManager.actions.checkList, listToRetrieve, currentVersion, platform); //~ Prefs.urlForUpdate
            isisNoTraceShare.isisNoTraceSharedObjects.listManager.send(isisNoTraceShare.isisNoTraceSharedObjects.listManager.req, fullURL, isisNoTraceShare.isisNoTraceSharedObjects.listManager.checkListCallback);
        },
        checkListCallback: function(evt){
            if (isisNoTraceShare.isisNoTraceSharedObjects.listManager.req.readyState == 4){
                switch (isisNoTraceShare.isisNoTraceSharedObjects.listManager.req.status){
                    case 200:
                        var JSONresponse = JSON.parse(isisNoTraceShare.isisNoTraceSharedObjects.listManager.req.response);
                        if (JSONresponse.needToUpdate){
                            isisNoTraceShare.isisNoTraceSharedObjects.listManager.someUpdatedAvailable=true;
                            for (var index in isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists) {
                                //isisLogWrapper.debugToConsole(isisNoTraceShare.isisNoTraceSharedObjects.listManager.req.response);
                                if (isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists[index].id+isisNoTraceShare.isisNoTraceSharedObjects.prefs.getCharPref("platform") == JSONresponse.listID) {
                                    isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists[index].lastAvailable = JSONresponse.availableVersion;
                                }
                            }
                        }
                        isisNoTraceShare.isisNoTraceSharedObjects.listManager.index++;
                        if (isisNoTraceShare.isisNoTraceSharedObjects.listManager.index == isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists.length) {
                            isisNoTraceShare.isisNoTraceSharedObjects.listManager.index = 0;
                            if (isisNoTraceShare.isisNoTraceSharedObjects.listManager.someUpdatedAvailable) {
                                isisNoTraceShare.isisNoTraceSharedObjects.listManager.offerUpdate();
                            }
                        }
                        else{
                            isisNoTraceShare.isisNoTraceSharedObjects.listManager.checkForUpdates(isisNoTraceShare.isisNoTraceSharedObjects.listManager.index);
                        }
                        break;
                    case 404:
                        // error
                        break;
                    case 500:
                        //error
                        break;
                    default:
                        //unknow error
                        break;
                }
            }
        },
        updateList: function(indexOfTheListToCheck){
            if (indexOfTheListToCheck < isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists.length){
                isisNoTraceShare.isisNoTraceSharedObjects.listManager.req = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
                var listToRetrieve = isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists[indexOfTheListToCheck].id;
                var platform = "desktop";
                var versionToInstall = isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists[indexOfTheListToCheck].lastAvailable;
                var fullURL = isisNoTraceShare.isisNoTraceSharedObjects.listManager.buildRequest(isisNoTraceShare.isisNoTraceSharedObjects.prefs.getCharPref("updateurl"), isisNoTraceShare.isisNoTraceSharedObjects.listManager.actions.updateList, listToRetrieve, versionToInstall, platform);
                isisNoTraceShare.isisNoTraceSharedObjects.listManager.send(isisNoTraceShare.isisNoTraceSharedObjects.listManager.req, fullURL, isisNoTraceShare.isisNoTraceSharedObjects.listManager.updateListCallback);
            }
        },
        updateListCallback: function(evt){
            //isisLogWrapper.debugToConsole("Invoking callback for updateList: UpdateCallback with readystate"+isisNoTraceShare.isisNoTraceSharedObjects.listManager.req.readyState);
            if (isisNoTraceShare.isisNoTraceSharedObjects.listManager.req.readyState == 4){
                switch (isisNoTraceShare.isisNoTraceSharedObjects.listManager.req.status){
                    case 200:
                        //isisLogWrapper.debugToConsole("Response for UpdateList: "+isisNoTraceShare.isisNoTraceSharedObjects.listManager.req.response);
                        var JSONresponse = JSON.parse(isisNoTraceShare.isisNoTraceSharedObjects.listManager.req.response);
                        for (var index in isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists) {
                            if (isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists[index].id+isisNoTraceShare.isisNoTraceSharedObjects.prefs.getCharPref("platform") == JSONresponse.listID) {
                                isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists[index].lastInstalledVersion = JSONresponse.requestedVersion;
                                //~ TODO overwrite the list 
                                IOUtils.simplySaveToFile(JSONresponse.value, JSONresponse.name+IOUtils._TXT_SUFFIX);
                                //isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists[index].value = JSONresponse.value;
                                IOUtils.simplySaveToFile(JSONresponse.value, JSONresponse.name+IOUtils._TXT_SUFFIX);
                                //isisLogWrapper.debugToConsole("Saving "+JSON.stringify(isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap));
                                IOUtils.simplySaveToFile(JSON.stringify(isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap),"listMap.json");
                            }
                        }
                        isisNoTraceShare.isisNoTraceSharedObjects.listManager.index++;
                        //while (isisNoTraceShare.isisNoTraceSharedObjects.listManager.index < isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists.length && isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists[isisNoTraceShare.isisNoTraceSharedObjects.listManager.index].lastAvailable == isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists[isisNoTraceShare.isisNoTraceSharedObjects.listManager.index].lastInstalledVersion){isisNoTraceShare.isisNoTraceSharedObjects.listManager.index++;}
                        if (isisNoTraceShare.isisNoTraceSharedObjects.listManager.index < isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists.length){
                            isisNoTraceShare.isisNoTraceSharedObjects.listManager.updateList(isisNoTraceShare.isisNoTraceSharedObjects.listManager.index);
                        }
                        else {
                            isisNoTraceShare.isisNoTraceSharedObjects.listManager.initAllFromDisk();
                        }
                        break;
                    case 404:
                        // error
                        break;
                    case 500:
                        //error
                        break;
                    default:
                        //unknow error
                        break;
                }
            }
        },
        checkAndUpdateList: function(listToRetrieve){},
        /*******************************************************************
         * Check for any update 
         ******************************************************************/
        checkForUpdates: function(indexOfTheListToCheck){
            if (indexOfTheListToCheck < isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists.length){
                var list = isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists[indexOfTheListToCheck];
                isisNoTraceShare.isisNoTraceSharedObjects.listManager.hashOfLists[list.id]=list.lastInstalledVersion;
                isisNoTraceShare.isisNoTraceSharedObjects.listManager.checkList(list.id,"desktop",list.lastInstalledVersion);
            }           
        },
        initListMap: function() {
            //isisLogWrapper.logToConsole("isisNoTraceShare.isisNoTraceSharedObjects.listManager: Loading listMap");
            var file = Components.classes["@mozilla.org/file/directory_service;1"]
                .getService(Components.interfaces.nsIProperties)
                .get("ProfD", Components.interfaces.nsIFile);
            file.append("notracedb");
            file.append("listMap.json");
            if(file.exists() && file.isFile()){
                IOUtils.readFromFile(file,false,function(value){
                    isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap = JSON.parse((value.join!=undefined?value.join(" "):value));
                    for (var index in isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists) {
                        var list = isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists[index];
                        isisNoTraceShare.isisNoTraceSharedObjects.listManager.hashOfLists[list.id]=list.lastInstalledVersion;
                    }
                    isisNoTraceShare.isisNoTraceSharedObjects.listManager.initAllFromDisk();
                }); 
            }
            else {
                isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap = new Object();
                isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties = new Object();
                isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists = new Array();
                //isisLogWrapper.logToConsole("isisNoTraceShare.isisNoTraceSharedObjects.listManager: listMap does not exists");
            }
        },
        /*******************************************************************
         * Load one specified list (or all lists if none is specified) from the disk
         ******************************************************************/
        initAllFromDisk: function(){
            for (var key in isisNoTraceShare.isisNoTraceSharedObjects.listManager.hashOfLists){
                isisNoTraceShare.isisNoTraceSharedObjects.listManager.initFromDisk(key);
            }
            isisNoTraceShare.isisNoTraceSharedObjects.checkForUpdates();
            //this.checkList("ad1","mobile",1.5);
        },
        initFromDisk: function(listToLoad){
            if ((listToLoad!=null && isisNoTraceShare.isisNoTraceSharedObjects.listManager.hashOfLists.hasOwnProperty(listToLoad)) ) {
                //isisLogWrapper.logToConsole("listManager try to load list: "+listToLoad);
                var listToReturn = "";
                var file = Components.classes["@mozilla.org/file/directory_service;1"]
                    .getService(Components.interfaces.nsIProperties)
                    .get("ProfD", Components.interfaces.nsIFile);
                file.append("notracedb");
                file.append(listToLoad+IOUtils._TXT_SUFFIX);
                if(file.exists() && file.isFile()){
                    if (listToLoad == "scriptlist"){
                       
                        IOUtils.readFromFile(file,false,function(value){
                            var i=0;
                            var array = new Array();
                            while(i<value.length){
                                
                                // read the line and escape regex characther, evantually
                                var regularExpression = value[i];
                                //var regularExpression = value[i].replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
                                // add the new regular expression
                                array[i] = regularExpression;
                                i++;
                            }
                            isisNoTraceShare.isisNoTraceSharedObjects.listManager.hashOfLists[listToLoad]=array;
                            isisNoTraceShare.isisNoTraceSharedObjects.scriptlist.arrayOfScriptElements=array;
                            //isisLogWrapper.logToConsole("listManager SAVED: "+listToLoad+" VALUE "+array);
                        });
                    }
                    else {
                        if (listToLoad == "adList"){
                            IOUtils.readFromFile(file,false,function(value){
                                /****************************New RegExp Object*******************************/
                                //let {SharedObjects} = require("isisNoTraceSharedObjects");
                                isisNoTraceShare.isisNoTraceSharedObjects.adlist.regex = [];
                                isisNoTraceShare.isisNoTraceSharedObjects.adlist.regex[0]=new RegExp(value);
                                //isisLogWrapper.logToConsole("listManager SAVED: "+listToLoad+" VALUE "+value);
                                /****************************RegexpLiteral*******************************/
                                //~ var temp = null;
                                //~ var strToEvaluate = "temp = /"+value[0]+"/gi;";
                                //~ once there was an evaluation instruction to assign a value to temp based on strToEvaluate
                                //~ SharedObjects.adlist.regex[0] = temp;
                                //~ isisLogWrapper.logToConsole("INIT2: "+SharedObjects.adlist.regex[0]+"----"+(SharedObjects.adlist.regex[0] instanceof RegExp));
                                //~ //isisLogWrapper.logToConsole("Regex: " + SharedObjectss.adlist.regex); Non stampa tutta l'espressione regolare ma solo una parte
                                
                            });
                        }
                        else{
                            IOUtils.readFromFile(file,false,function(value){
                                isisNoTraceShare.isisNoTraceSharedObjects.listManager.hashOfLists[listToLoad]=value;
                                //isisLogWrapper.logToConsole("listManager SAVED: "+listToLoad+" VALUE "+value);
                            }); 
                        }
                    }
                }
            }
        },
        simplyLoader: function(value){
            isisNoTraceShare.isisNoTraceSharedObjects.listManager.hashOfLists[listToLoad]=value;
        },
        
        /** TO BE REMOVED IN THE NEXT RELEASE
        scriptListLoader: function(value){
            var i=0;
            var escaped;
            var strToEvaluate = "temp = /";
            var temp = null;
            while(i<value.length){
                if (i) {strToEvaluate = strToEvaluate +"|";}
                escaped = value[i];
                escaped = escaped.replace(/[-\\{}()*+?.,\\^$|#\s]/g, "\\$&");
                strToEvaluate = strToEvaluate + "\\/"+escaped+"[^a-zA-Z]|\\/"+escaped+"$";
                i++;
            }
            strToEvaluate = strToEvaluate + "/gi;";
            var array = new Array();
            //~ array[0] = str;
            
            // an old evaluation instruction for strToEvaluate
            array[0] = temp;
            isisNoTraceShare.isisNoTraceSharedObjects.listManager.hashOfLists[listToLoad]=array;
        },*/
        offerUpdate: function() {  
            var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);

            var result = prompts.confirm(null, isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("updating.label")+"", isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("areyousure.label"));
            if (result) {
                isisNoTraceShare.isisNoTraceSharedObjects.listManager.index = 0;
                //while (isisNoTraceShare.isisNoTraceSharedObjects.listManager.index < isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists.length){
                    if (isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists[isisNoTraceShare.isisNoTraceSharedObjects.listManager.index].lastAvailable != isisNoTraceShare.isisNoTraceSharedObjects.listManager.listMap.listProperties.lists[isisNoTraceShare.isisNoTraceSharedObjects.listManager.index].lastInstalledVersion){
                        // update list
                        isisNoTraceShare.isisNoTraceSharedObjects.listManager.updateList(isisNoTraceShare.isisNoTraceSharedObjects.listManager.index);
                    }
                    //isisNoTraceShare.isisNoTraceSharedObjects.listManager.index++;
                //}
                //isisNoTraceShare.isisNoTraceSharedObjects.listManager.index = 0;
            }
            else {
                Components.classes['@mozilla.org/alerts-service;1'].
              getService(Components.interfaces.nsIAlertsService).
              showAlertNotification(null, "", isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("noupdate.label"), false, '', null);
            }
        },
        /**
         * Build the URL to check and update a list
         * */
        buildRequest: function(baseUrl, action, idList, version, platform) {
            var fullURL = baseUrl;
            // Adding the action: check or update
            fullURL = fullURL+action+"?";
            // Adding the list ID
            fullURL = fullURL+isisNoTraceShare.isisNoTraceSharedObjects.listManager.actions.params.idList+"="+idList;
            fullURL = fullURL+"&";
            // Adding the platform on which NoTrace is Running 
            fullURL = fullURL+isisNoTraceShare.isisNoTraceSharedObjects.listManager.actions.params.platform+"="+platform;
            fullURL = fullURL+"&";
            // Adding parameters for the update action
            fullURL = fullURL+(action==isisNoTraceShare.isisNoTraceSharedObjects.listManager.actions.checkList?isisNoTraceShare.isisNoTraceSharedObjects.listManager.actions.params.lastVersion:isisNoTraceShare.isisNoTraceSharedObjects.listManager.actions.params.versionToInstall)+"="+version;
            return fullURL;
        },
        /**
         * Prepare a request for updating a list
         * */
        send: function (req, UrlForUpdate, callback){
            // Trim character that cause problems for the HTTP request
            UrlForUpdate = UrlForUpdate.replace(/(\r\n|\n|\r)/gm,"");
            var self = isisNoTraceShare.isisNoTraceSharedObjects.listManager;
            //var dest = Prefs.urlForUpdate+SharedObjects.actions.checkList; //~ "http://172.16.15.60/ListManager/"; 
            req.open("GET", UrlForUpdate, true);
            req.setRequestHeader("Content-Type", "text/plain");
            // Setting the callback function
            req.onreadystatechange = callback;
            //isisLogWrapper.logToConsole("Ready to send: "+UrlForUpdate);
            req.send();
        },
        actions: {
            checkList:              "checkList",
            updateList:             "updateList",
            params: {
                idList:             "idList",
                lastVersion:        "lastVersion",
                versionToInstall:   "versionToInstall",
                platform:           "platform"
            }
        }  
    },
	/**
    *   Component that manage the array
    */
    whitelist: {
        arrayOfWhitelistElements: new Array,
        //aggiunto da FI
        arrayOfWhitelistCDN: new Array,
        initDB: function(){
            this.refreshList();
        },
        /**
        *   Read the whitelist from the file outside the XPI and fill the array
        */
        refreshList: function(){
            this.arrayOfWhitelistElements = [];
            this.arrayOfWhitelistCDN = [];
            this.arrayOfWhitelistElements = isisNoTraceShare.isisNoTraceSharedObjects.listManager.getList('whitelist');    
            this.arrayOfWhitelistCDN = isisNoTraceShare.isisNoTraceSharedObjects.listManager.getList('arrayOfWhitelistCDN');
        },
        /**
        *   Auxiliary method to access the whitelist
        */
        getList: function(){
            return this.arrayOfWhitelistElements;
        },
        
        //aggiunto da FI
        getCDNList: function(){
            return this.arrayOfWhitelistCDN;
        },
        /**
        *   Check if a domain is present in the whitelist
        */
        checkDomain: function(domain){
            for (curdomain in this.arrayOfWhitelistElements){
                if(this.arrayOfWhitelistElements[curdomain]==domain){
                    return true;
                }
            }
            return false;
        },
        /**
        *   Read the whitelist and popolate the whitelist panel
        */
        initwhitelist: function(){
            this.refreshList();
            var array=this.getList();
            var recentWindow = isisNoTraceShare.isisNoTraceSharedObjects.winMed.getMostRecentWindow("global:notraceprefwin");
            for (var i=0;i<array.length;i++) {
                recentWindow.document.getElementById("nt-whitelist").appendItem(array[i]);
            }
            recentWindow=null;
        },
        /**
        *   Save the whitelist to the file outsiide the XPI
        */
        saveToFile: function(array,filename) {
            file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
            file.append("notracedb");
            file.append(filename);
            //if( !file.exists() || !file.isFile() ) {
                //file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);
                //var data="ytimg.com\nyimg.com\nyoutube.com\nfacebook.com\nfbcdn.net\nakamaihd.net\nwikimedia.org\nmsn.com\nhotmail.com\ntwimg.com\nebaystatic.com\nebayimg.com\nvimeo.com\nturner.com\ngoogle.com\ngetpersonas.com\nmozilla.net";
                var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
                               createInstance(Components.interfaces.nsIFileOutputStream);
                foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0); 
                var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
                                createInstance(Components.interfaces.nsIConverterOutputStream);
                converter.init(foStream, "UTF-8", 0, 0);
                for (var i=0;i<array.length;i++) {
                    converter.writeString(array[i]+"\n");
                }
                converter.close();
                converter=null;
                foStream=null;
            //}
        },
        /**
        *   The method add, takes a domain and add it to the whitelist if not already present, saving it to the file
        */
        add: function(newitem){
            var sp = newitem.split(".");
            // check if the domain is in the form domain.suffix It excludes forms like this one: edition.cnn.com
            if(sp.length == 2){
                if (!this.checkDomain(newitem)) {
                    this.arrayOfWhitelistElements.push(newitem);
                    this.saveToFile(this.arrayOfWhitelistElements, "whitelist.txt");
                    sp=null;
                    return true;
                }
                else{
                    isisNoTraceShare.isisNoTraceSharedObjects.alertsService.showAlertNotification("chrome://notrace/content/imgs/info_24.png", "INFO", isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("sitealreadyexist.label"), false, "", null, "");
                }
            }
            else{
                isisNoTraceShare.isisNoTraceSharedObjects.alertsService.showAlertNotification("chrome://notrace/content/imgs/info_24.png", "INFO", isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("typesite.label"), false, "", null, "");
            }
            sp=null;
            return false;
        },
        addOptions: function() {
            var recentWindow = isisNoTraceShare.isisNoTraceSharedObjects.winMed.getMostRecentWindow("global:notraceprefwin");
            var newitem = recentWindow.document.getElementById("newitemwl").value;
            this.add(newitem);
            var objToChangeID=recentWindow.document.getElementById("nt-whitelist").appendItem(newitem,newitem);
            objToChangeID.setAttribute('id',"notrace-"+newitem);
            //isisNoTraceShare.isisNoTraceSharedObjects.logToConsole(recentWindow.document.getElementById("notrace-"+newitem).value);
            recentWindow.document.getElementById("newitemwl").value=""; 
            newitem=null;
        },
        /**
        *   Removes the selected domains from the whitelist panel from the array.
        */
        remove: function(){
            var recentWindow = isisNoTraceShare.isisNoTraceSharedObjects.winMed.getMostRecentWindow("global:notraceprefwin");
            var scelta = isisNoTraceShare.isisNoTraceSharedObjects.prompts.confirm(null,isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("titlealert.label"),isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("deleteselitem.label"));
            if(scelta){
                var list = recentWindow.document.getElementById("nt-whitelist");
                var count = list.selectedCount;
                var tempValue;
                var item;
                while (count--){
                    item = list.selectedItems[0];
                    var index=this.arrayOfWhitelistElements.indexOf(item.label);
                    if (index>=0) {
                        var temp=this.arrayOfWhitelistElements[index];
                        this.arrayOfWhitelistElements[index]=this.arrayOfWhitelistElements[(this.arrayOfWhitelistElements.length)-1];
                        this.arrayOfWhitelistElements[(this.arrayOfWhitelistElements.length)-1]=temp;
                        var oldValue=this.arrayOfWhitelistElements.pop();
                        if (index>=this.arrayOfWhitelistElements.length) {index--;}
                        temp=this.arrayOfWhitelistElements[index];
                        for (var i=index;i<(this.arrayOfWhitelistElements.length)-1;i++) {
                            this.arrayOfWhitelistElements[i]=this.arrayOfWhitelistElements[i+1];
                        }
                        this.arrayOfWhitelistElements[((this.arrayOfWhitelistElements.length)-1)]=temp;
                    }
                    list.removeItemAt(list.getIndexOfItem(item));
                }
                this.saveToFile(this.arrayOfWhitelistElements, "whitelist.txt");
                item=null;
                list=null;
                count=null;
            }
            recentWindow=null;
            
        },
        /**
        *   Add a specific domain to the whitelist. It is the method invoked when pressing on a domain from the menu of the addons icon.
        *   This method manage the UI, the real work is done by the method add
        */
        addToWhiteList: function(domain){
            var scelta = isisNoTraceShare.isisNoTraceSharedObjects.prompts.confirm(null,isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("titlealert.label"),isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("wanttoadd.label")+" "+isisNoTraceShare.isisNoTraceSharedObjects.escapeHTML(domain)+" "+isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("tothewhitelist.label"));
            if(scelta){
                this.add(domain);
                var recentWindow = isisNoTraceShare.isisNoTraceSharedObjects.winMed.getMostRecentWindow("navigator:browser");
                var menupopup = recentWindow.document.getElementById("notraceaddons-statusbar-menupopup");
                var torem = recentWindow.document.getElementById("notrace-"+domain);
                menupopup.removeChild(torem);
                isisNoTraceShare.isisNoTraceSharedObjects.alertsService.showAlertNotification("chrome://notrace/content/imgs/info_24.png", "INFO", "\""+domain+"\"  "+isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("addedtowhitelist.label"), false, "", null, "");
            }
            scelta=null;
            recentWindow=null;
            menupopup=null;
            torem=null;
        }
    },
    /**
    *   The scriptlist component
    *       The initDB call the refreshList
    *       refreshList read the file outside the XPI and popolate the array
    *       initscriptlist refresh the list and return the list itself
    *       getList returns the lists of scripts to block
    *       checkScriptPresence check if a script is present in the list
    *       add add a script to the list ad save it to the file
    */
    scriptlist:  {
        arrayOfScriptElements: null,
        initDB: function(){
            isisNoTraceShare.isisNoTraceSharedObjects.scriptlist.refreshList();
        },  
        initscriptlist: function(){
            isisNoTraceShare.isisNoTraceSharedObjects.scriptlist.initDB();
            return isisNoTraceShare.isisNoTraceSharedObjects.scriptlist.getList();
        },
        refreshList: function(){
            isisNoTraceShare.isisNoTraceSharedObjects.scriptlist.arrayOfScriptElements = isisNoTraceShare.isisNoTraceSharedObjects.listManager.getList('scriptlist'); 
        },
        getList: function(){
            return isisNoTraceShare.isisNoTraceSharedObjects.scriptlist.arrayOfScriptElements;
        },
        getCountOfScript: function(){
            return isisNoTraceShare.isisNoTraceSharedObjects.scriptlist.arrayOfScriptElements.length;
        },
        checkScriptPresence: function(script){
            for (curscript in this.arrayOfScriptElements){
                if(this.arrayOfScriptElements[curscript]==script){
                    return true;
                }
            }
            return false;
        },
        add: function(newitem){
            var sp = newitem.split(".");
            if(sp.length == 2){
                if (!this.checkScriptPresence(newitem)) {
                    this.arrayOfScriptElements.push(newitem);
                    IOUtils.saveToFile(this.arrayOfScriptElements, "scriptlist.txt");
                    sp=null;
                    return true;
                }
                else{
                    /*let window=isisNoTraceShare.isisNoTraceSharedObjects.getWindow();
                    window.NativeWindow.toast.show("Script alredy exist", "short");*/
                   isisNoTraceShare.isisNoTraceSharedObjects.alertsService.showAlertNotification("chrome://notrace/content/imgs/info_24.png", "INFO", SharedObjectss.common.getLocalizedMessage("typescript.label"), false, "", null, "");
                }
            }
            else{
                isisNoTraceShare.isisNoTraceSharedObjects.alertsService.showAlertNotification("chrome://notrace/content/imgs/info_24.png", "INFO", SharedObjectss.common.getLocalizedMessage("typescript.label"), false, "", null, "");
                /*let window=isisNoTraceShare.isisNoTraceSharedObjects.getWindow();
                window.NativeWindow.toast.show(" ", "short");*/
            }
            sp=null;
            return false;
        },
    },
	adlist:  {
        file: null,
        arrayOfAdElements: null,
        regex: new Array,
        personal_regex: new Array,
        regex_str: "",
        personal_regex_str: "",
        initDB: function(){
            this.refreshList();
        },
        refreshList: function() {
            isisNoTraceShare.isisNoTraceSharedObjects.adlist.regex = isisNoTraceShare.isisNoTraceSharedObjects.listManager.getList('adList');
            isisNoTraceShare.isisNoTraceSharedObjects.adlist.personal_regex_str = isisNoTraceShare.isisNoTraceSharedObjects.listManager.getList('Personal_adList');   
            isisNoTraceShare.isisNoTraceSharedObjects.adlist.personal_regex_str=isisNoTraceShare.isisNoTraceSharedObjects.adlist.personal_regex[0];
            for (var i=1; i<(isisNoTraceShare.isisNoTraceSharedObjects.adlist.personal_regex.length)-1;i++) {
                isisNoTraceShare.isisNoTraceSharedObjects.adlist.personal_regex_str=isisNoTraceShare.isisNoTraceSharedObjects.adlist.personal_regex_str+"|"+isisNoTraceShare.isisNoTraceSharedObjects.adlist.personal_regex[i];
            }
        },
        getList: function(){
            return isisNoTraceShare.isisNoTraceSharedObjects.adlist.regex;
        },
        getPersonalList: function(){
            return isisNoTraceShare.isisNoTraceSharedObjects.adlist.personal_regex_str;
        },
        addToPersonalList: function(regexp) {
            Components.utils.import("resource://gre/modules/NetUtil.jsm");
            Components.utils.import("resource://gre/modules/FileUtils.jsm");
            //isisLogWrapper.logToConsole(regexp);
            isisNoTraceShare.isisNoTraceSharedObjects.adlist.personal_regex.push(regexp);
            var file = Components.classes["@mozilla.org/file/directory_service;1"]
                .getService(Components.interfaces.nsIProperties)
                .get("ProfD", Components.interfaces.nsIFile);
            file.append("notracedb");
            file.append("Personal_adList.txt");
            isisNoTraceShare.isisNoTraceSharedObjects.adlist.file=file;
            var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
               createInstance(Components.interfaces.nsIFileOutputStream);
             
            // use 0x02 | 0x10 to open file for appending.
            foStream.init(isisNoTraceShare.isisNoTraceSharedObjects.adlist.file, 0x02 | 0x10, 0666, 0); 
            // write, create, truncate
            // In a c file operation, we have no need to set file mode with or operation,
            // directly using "r" or "w" usually.
             
            // if you are sure there will never ever be any non-ascii text in data you can 
            // also call foStream.write(data, data.length) directly
            var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
                            createInstance(Components.interfaces.nsIConverterOutputStream);
            converter.init(foStream, "UTF-8", 0, 0);
            converter.writeString(regexp+"\n");
            converter.close();
        },
        deleteFromPersonalList: function(index) {
            Components.utils.import("resource://gre/modules/NetUtil.jsm");
            Components.utils.import("resource://gre/modules/FileUtils.jsm");
            var array=new Array();
            var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
               createInstance(Components.interfaces.nsIFileOutputStream);
             
            // use 0x02 | 0x10 to open file for appending.
            foStream.init(isisNoTraceShare.isisNoTraceSharedObjects.adlist.file, 0x02 | 0x08 | 0x20, 0666, 0); 
            var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
                createInstance(Components.interfaces.nsIConverterOutputStream);
            converter.init(foStream, "UTF-8", 0, 0);
            for (var i = 0; i<index;i++) {
                array.push(isisNoTraceShare.isisNoTraceSharedObjects.adlist.personal_regex[i]);
                converter.writeString(isisNoTraceShare.isisNoTraceSharedObjects.adlist.personal_regex[i]+"\n");
                //isisLogWrapper.logToConsole("i: "+i+"---value: "+isisNoTraceShare.isisNoTraceisisNoTraceShare.isisNoTraceSharedObjects.adlist.personal_regex[i]+"\n");
            }
            for (var i = index+1; i<isisNoTraceShare.isisNoTraceSharedObjects.adlist.personal_regex.length;i++) {
                array.push(isisNoTraceShare.isisNoTraceSharedObjects.adlist.personal_regex[i]);      
                converter.writeString(isisNoTraceShare.isisNoTraceSharedObjects.adlist.personal_regex[i]+"\n");
                //isisLogWrapper.logToConsole("DOPO i: "+i+"---value: "+isisNoTraceShare.isisNoTraceisisNoTraceShare.isisNoTraceSharedObjects.adlist.personal_regex[i]+"\n");
            }
            converter.close();
            isisNoTraceShare.isisNoTraceSharedObjects.adlist.personal_regex=array;
        },
    },
    quote: function(str){
		return "\"" + str.replace(/"/g, "'") + "\"";
	},
	replacements:{ "&": "&amp;", '"': "&quot", "<": "&lt;", ">": "&gt;" },
	escapeHTML: function(str) {
		if (!isNaN(parseInt(str))){return str;}
		str.replace(/[&"<>]/g, function (m) isisNoTraceShare.isisNoTraceSharedObjects.replacements[m]);
		return str;
	},
	checkForUpdates: function(){
        var siteTimeout = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
        var event = {
            notify: function(siteTimeout) {
                var t = new Date().getTime();
                siteTimeout.cancel();
                //isisLogWrapper.logToConsole("Invoking checkUpdates");
                isisNoTraceShare.isisNoTraceSharedObjects.listManager.index = 0;
                isisNoTraceShare.isisNoTraceSharedObjects.listManager.checkForUpdates(isisNoTraceShare.isisNoTraceSharedObjects.listManager.index);
            }
        };
        siteTimeout.initWithCallback(event, 1000, Ci.nsITimer.TYPE_ONE_SHOT);
    },
	/**
	*	If it is the first time, copy all the necessary file from within the XPI to the outside
	*/
	installDB: function() {
	    IOUtils.copyFileFromXPI("listMap.json");
		IOUtils.copyFileFromXPI("whitelist.txt");
		IOUtils.copyFileFromXPI("scriptlist.txt");
		IOUtils.copyFileFromXPI("adList.txt");
		IOUtils.copyFileFromXPI("Personal_adList.txt");
		IOUtils.copyFileFromXPI("arrayOfWhitelistCDN.txt");
		IOUtils.copyFileFromXPI("optout.txt");
		IOUtils.copyFileFromXPI("awarenessKeywords.txt");
		IOUtils.copyFileFromXPI("thirdpartylist.txt");
		IOUtils.copyFileFromXPI("regexp_fingerprinting_1.txt");
		IOUtils.copyFileFromXPI("regexp_fingerprinting.txt");
		
	}
};
