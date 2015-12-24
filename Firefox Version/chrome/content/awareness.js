Components.utils.import("resource://notrace/common.js");
Components.utils.import("resource://notrace/isisNoTraceSharedObjects.js");	
Components.utils.import("resource://notrace/isisLogWrapper.js");


if ("undefined" == typeof(isisNoTrace)) { 

var ip="Ip Address Connection";
var mailaddress = "Mail Address";
var console = {
  service: null,
  log: function(msg)
  {
    if (!console.service)
      console.service = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
	  console.service.logStringMessage(msg);
  }
};

var isisNoTrace = {
		mainWindow: null,
		uri: null,
		gBrowser: null,
		/** Array Request Cookie */
		cookieReqValue: null,
		/** Array Response Cookie */
		cookieResValue: null,
		/** Array Request Third Cookie */
		cookieThirdReqValue: null,
		/** Array Response Third Cookie */
		cookieThirdResValue: null,
		/** Dominio terze parti cookie request */
		cookieThirdReqDomain: null,
		/** Dominio terze parti cookie response */
		cookieThirdResDomain: null,
		/** Array resourceLocation Referer1 */
		referer1: null,
		/** Array resource Referer2 */
		referer2: null,
		/** Array resourceLocation webBug1 */
		webBug1: null,
		/** Array resource webBug2 */
		webBug2: null,
		/** Array resourceLocation flashcookie1 */
		flashcookie1: null,
		/** Array resource flashcookie2 */
		flashcookie2: null,
		/** Array resourceLocation thirdWebSite1 */
		thirdWebSite1: null,
		/** Array resource thirdWebSite2 */
		thirdWebSite2: null,
		/** Array resourceLocation thirdImage1 */
		thirdImage1: null,
		/** Array resource thirdImage2 */
		thirdImage2: null,
		/** dominio pagina web estrapolato dal tabBrowser*/
		host: null,
		/** data calcolata maediante metodo e settata come variabile globale*/
		date: null,
		/** stringa contenente tutte le REGULAR EXPRESSION caricate da file */
		awarenessKeywords: null,
		/** array contenente le informazioni sensibili catturate */
		listCaptured: new Array(),
		/**  array contenente la copia di tutte le informazioni dei 7 array di [resource] delle 7 funzioni */
		allInfo: new Array(),
		/** array contenente le informazioni da caricare nelle label Awareness */
		descriptionLoad: new Array(),
		categories: new Array(),
		
		finger: "Fingerprinting",
		sensitive: "Sensitive Information",
		pii: "Personal Identifiable Information",

		
		promptService: Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService),
		common: {

		  _bundle: Components.classes["@mozilla.org/intl/stringbundle;1"]
				   .getService(Components.interfaces.nsIStringBundleService)
				   .createBundle("chrome://notrace/locale/various.properties"),

				   getLocalizedMessage: function(msg) {
					  return this._bundle.GetStringFromName(msg);
				   }
		},
		
		/********************************************************************
		 *	Funzione che crea[se non esiste],il file con le awarenessKeywords  
		 *	copiando il file dalla cartella notrace@unisa.it\defaults
		 *  all'interno della cartella Profile/notracedb.
		 *	Qualora il file esista, lo legge e salva il contenuto all'interno
		 *  di un array globale.
		 ********************************************************************/
		createAndReadKeywordsFile: function(){
			var parentD= Components.classes["@mozilla.org/file/directory_service;1"]
				.getService(Components.interfaces.nsIProperties)
				.get("ProfD", Components.interfaces.nsIFile);
			parentD.append("notracedb");
			
			var file = Components.classes["@mozilla.org/file/directory_service;1"]
				.getService(Components.interfaces.nsIProperties)
				.get("ProfD", Components.interfaces.nsIFile);
			file.append("notracedb");
			file.append("awarenessKeywords.txt");
			
			if( !file.exists() || !file.isFile() ){
				var fileSrc = Components.classes["@mozilla.org/file/directory_service;1"]
					.getService(Components.interfaces.nsIProperties)
					.get("ProfD", Components.interfaces.nsIFile)
					.QueryInterface(Components.interfaces.nsIFile);
				fileSrc.append("extensions");
				fileSrc.append("notrace@unisa.it");
				fileSrc.append("defaults");
				fileSrc.append("awarenessKeywords.txt");
				
				fileSrc.copyTo(parentD,"");
				
				this.awarenessKeywords=this.getKeywordsFromFile(file);
			}
			else
				if(file.exists() && file.isFile()){
					this.awarenessKeywords=this.getKeywordsFromFile(file);
				}
			else{ return;}	
		},
		
		/********************************************************************
		 *	Funzione che dato un file,prelevo lo stream input e salva il 
		 *	contenuto all'interno di una stringa.
		 ********************************************************************/
		getKeywordsFromFile: function(f){
			var file = f;
			var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream); 	
			istream.init(file, 0x01, 0444, 0);
			istream.QueryInterface(Components.interfaces.nsILineInputStream);
				
			var line = {}, lines, hasmore;
			do { 
				hasmore = istream.readLine(line);
				lines=line.value;
				//console.log(lines);
			} while(hasmore); 
			istream.close();	
			
			return lines;
		},
		
		getURLForTabBrowser: function(){
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
					.getService(Components.interfaces.nsIWindowMediator);
			
			var browser = wm.getMostRecentWindow("navigator:browser");
			this.gBrowser=browser.gBrowser;
			
			browser=this.gBrowser.getBrowserForTab(this.gBrowser.selectedTab);
			var domain=browser.currentURI.spec;
			//estrapolo dall'URL il dominio e lo inserisco come label all'interno dell'interfaccia
			//oltre che a settarla come variabile globale fino alla chiusura della finestra.
			this.host=this.getURL(domain);
			//console.log(this.host);
			
			var hostLabel = document.getElementById("host"); 
			hostLabel.setAttribute("value",this.host);
		},
	
		getURL: function(host){
			/***************************************************
			* Regular Expression per estrapolare il dominio web
			****************************************************/
			var re1 = new RegExp('(http(s)?(:)*([0-9])*(//)*)','ig');
			var re2 = new RegExp('((.:)?)$');
			var re3 = new RegExp('((www)([0-9])*.|(http(s)?(:)*(//)*)|^(ww([0-9])*.))','gi');
			var re4 = new RegExp('/((\\S+)*)','gi');
		
			var objDomain=host;
			
			if(re1.test(objDomain))
				objDomain=objDomain.replace(re1,"");
		
			if(re2.test(objDomain))
				objDomain=objDomain.replace(re2,"");
		
			if(re3.test(objDomain))
				objDomain=objDomain.replace(re3,"");
			
			if(re4.test(objDomain))
				objDomain=objDomain.replace(re4,"");

			var hostsplit = objDomain.split(".");
			var hsl = hostsplit.length;
			if(hsl>2)
				objDomain = hostsplit[hsl-2]+"."+hostsplit[hsl-1];
				
			return objDomain;
		},
		
		getRealTimeDate: function(){
			var currentTime = new Date()
			var month = currentTime.getMonth() + 1;
			var day = currentTime.getDate();
			var year = currentTime.getFullYear();
			year=year.toString();
			month=month.toString();
			day=day.toString();
			
			if(month<10 && month>0)
				month="0"+month;
			
			if(day<10 && day>0)
				day="0"+day;
					
			var date=year+month+day;
			return date;
		},
		
		openDialogAwareness_backup: function() {
			var panelAwareness=document.getElementById("hiddenAwareness-group");
			var panelInfoList=document.getElementById("notrace-hiddenInfo-group");
			if (panelAwareness.style.display=="block"){
				//rimuovo tutti gli elementi della lista
				var element=document.getElementById("childreeenAwareness");
				while (element.firstChild) {
					element.removeChild(element.firstChild);
				}
				
				panelAwareness.style.display="none";
				
				if(panelInfoList.style.display=="block")
					this.setWindowSize(602);
				else
					if(panelInfoList.style.display=="none")
						this.setWindowSize(465);
			}
			else {
				panelAwareness.style.display="block";
		
				if(panelInfoList.style.display=="block")
					this.setWindowSize(602);
				else
					if(panelInfoList.style.display=="none")
						this.setWindowSize(465);
				
				this.createTreeAwarenessLeaked(this.listCaptured);
				this.setTreeHiddenAwarenessWindowSize();
			}
		},
		
		openDialogAwareness: function() {
			var panelAwareness=document.getElementById("hiddenAwareness-group");
			var panelInfoList=document.getElementById("notrace-hiddenInfo-group");
			//rimuovo tutti gli elementi della lista
			var element=document.getElementById("childreeenAwareness");
			while (element.firstChild) {
				element.removeChild(element.firstChild);
			}
			
			panelAwareness.style.display="none";
			
			if(panelInfoList.style.display=="block")
				this.setWindowSize(602);
			else
				if(panelInfoList.style.display=="none")
					this.setWindowSize(465);
			panelAwareness.style.display="block";
	
			if(panelInfoList.style.display=="block")
				this.setWindowSize(602);
			else
				if(panelInfoList.style.display=="none")
					this.setWindowSize(465);
			
			this.createTreeAwarenessLeaked(this.listCaptured);
			this.setTreeHiddenAwarenessWindowSize();
		},
		
		createTreeAwarenessLeaked: function(){
		    var travel = new Object();
		    travel.roundtrip=/roundtrip=([a-zA-Z\s]+)/gi;//Referer: http://www.tripadvisor.com/CheapFlights?roundtrip=yes&Orig=ROM&leaveday=13&leavemonth=03%2F2013&leavetime=anytime&Dest=JFK&retday=20&retmonth=03%2F2013&rettime=anytime&adults=2
            travel.origin=/Orig=([a-zA-Z\s]+)/gi;
            travel.destination=/Dest=([a-zA-Z\s]+)/gi;
            travel.leaveday=/leaveday=(\d+)/gi;
			travel.leavemonth=/leavemonth=(\d+)/gi;
			travel.leaveyear=/leavemonth=\d+%2F(\d+)\&/gi;
            travel.arriveday=/retday=(\d+)/gi;
			travel.arrivemonth=/\&retmonth=(\d+)/gi;
			travel.arriveyear=/retmonth=\d+%2F(\d+)\&/gi;
            travel.passengers=/adults=(\d+)/gi;
            travel.isp=/isp=(.*?)/gi; //&isp=Telecom+Italia
			var hashForLeak = new Object(); 
			var treechildren1 = document.getElementById("childreeenAwareness");
			var size=this.listCaptured.length;
			//console.log(size);
			var valueLeaked=null;
			var infoLeaked=null;
			var category=null;
			var temp=null;
			if (this.categories.length==0) {
				this.categories[0]=this.pii;
				this.categories[1]=this.sensitive;
				this.categories[2]=this.finger;
			}
			for(var i=0;i<this.categories.length;i++){
				var origin = document.createElement("treeitem");
				origin.setAttribute("container",true);
				origin.setAttribute("open",false);
				var originrow = document.createElement("treerow");
				var origincell = document.createElement("treecell");
				origincell.setAttribute("label",this.categories[i]);
				originrow.appendChild(origincell);
				origin.appendChild(originrow);
				treechildren1.appendChild(origin);
				var children = document.createElement("treechildren");
				origin.appendChild(children);
				//isisLogWrapper.logToConsole("categories: "+this.categories[i]+"-----"+size);
				for(var j=0;j<size;j++){
					this.listCaptured[j]=this.escape(this.listCaptured[j]);
					if(this.listCaptured[j].indexOf("=") != -1)
						temp=this.listCaptured[j].split("=");
					//* Caso in cui le informazioni catturare sono comprese in due coppie di =
					  //* caso indirizzo IP perso su MySpace 
					//isisLogWrapper.logToConsole("categories: "+this.categories[i]+"-----"+category+"-------"+temp[1]+"-------"+temp[0]);
					if(temp.length==3){
						//console.log(temp[0]+" - "+temp[1]+" - "+temp[2]);
						category=this.finger;
						if((this.categories[i]==category) && (/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/gi.test(temp[1]))){
							if (!hashForLeak.hasOwnProperty(ip)){
								infoLeaked="IP Address Connection";
								valueLeaked=temp[1];
							}
						}
						else
							if((this.categories[i]==category) && (/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/gi.test(temp[2]))){
								if (!hashForLeak.hasOwnProperty(ip)){
									infoLeaked="IP Address Connection";
									valueLeaked=temp[2];
								}
							}
					}
					else{
							//* Caso in cui le informazioni catturare sono comprese in un solo = 
							//console.log(temp[0]+" - "+temp[1]);
							
							//* Prelevo la descriptionLoad per verificare se il valore precedente
							  //* ad = corrisponde ad un parametro di ricerca.
							var verifiedLabel=this.descriptionLoad[temp[0]];
							
							//verifico se il value della label � presente
							if(verifiedLabel != null){
								if(temp[1] != ""){
									//console.log("Verified Label: "+infoLeaked);

									//verifico la categoria dell'informazione
									category=this.finger;
									if((this.categories[i]==category) && (/(__utm.*?)|(utm.*?)/gi.test(temp[0]))){	
										if (!hashForLeak.hasOwnProperty(verifiedLabel)){
											infoLeaked=verifiedLabel;
											valueLeaked=temp[1];
											//category="Browser Fingerprinting";
										}
									}
									else
										if((this.categories[i]==category) && (/c_user|xs|Username/gi.test(temp[0]))){
											if (!hashForLeak.hasOwnProperty(verifiedLabel)){
												infoLeaked=verifiedLabel;
												valueLeaked=temp[1];
												//category="Tracking Information";
											}
										}
    									else {
    										category=this.pii;
    										//if((this.categories[i]==category) && (/kage|age|SplashDisplayName|kgender|gender|gen|zip|country|cntry|kcr/i.test(temp[0]))){
    										//fn%3DGabriella%
    										if((this.categories[i]==category) && (/kage|age|ag|pb_age|SplashDisplayName|kgender|gender|gen|gd|zip|iz|country|cntry|kcr|userBrowsingZoneLocalization|ci|c1|c2|ipcity|district|city|geo|gmailchat|EmailUsername|Email|account|username|username_or_email|uj|user_name|fn|ln/i.test(temp[0]))){
    										    // |ccn|cuname
    											if (!hashForLeak.hasOwnProperty(verifiedLabel)){
    											    if (!(temp[0] == "country" && /\d/.test(temp[1]))) {
    											        infoLeaked=verifiedLabel;
                                                        valueLeaked=temp[1];
    											    }
    											}
    											/*if((categories[i]==category) && (/kgender|gender/i.test(temp[0]) && temp[1]==0 || /kgender|gender/i.test(temp[0]) && temp[1]==1)){
    												infoLeaked=verifiedLabel;
    												valueLeaked=temp[1];
    											}
    											if((categories[i]==category) && (/kage|age/i.test(temp[0])) && (temp[1]==0)) {
    												infoLeaked=verifiedLabel;
    												valueLeaked=temp[1];
    											}*/
    										}
    										category = this.sensitive;
    										//isisLogWrapper.logToConsole("PII or SENSITIVE: "+this.categories[i]+"-----"+category+"-------"+temp[1]+"---------"+temp[0]+"----"+this.listCaptured[j]);
    										if((this.categories[i]==category) && (/ccn|cuname|c\_cnn|c\_cuname/i.test(temp[0]))){
                                                if (!hashForLeak.hasOwnProperty(verifiedLabel)){
                                                    infoLeaked=verifiedLabel;
                                                    valueLeaked=temp[1];
                                                }
                                            }
											var temporaneyStringForTravel = this.listCaptured[j].replace(new RegExp("%26", 'g'),"&");
											var temporaneyStringForTravel = temporaneyStringForTravel.replace(new RegExp("%25", 'g'),"%");
                                            for (var key in travel){
												if (!valueLeaked) valueLeaked="";
                                                if((this.categories[i]==category) && (travel[key].test(temporaneyStringForTravel))){
                                                    if (!hashForLeak.hasOwnProperty("travel")){
                                                        infoLeaked="travel";
                                                        var array = temporaneyStringForTravel.match(travel[key]);
                                                        //valueLeaked= array[0].split('=')[1];
														var arraySplittato = array[0].split('=');
														var stringToDisplay = arraySplittato[1];
														if (key == "arriveyear" || key == "leaveyear") {
															stringToDisplay = stringToDisplay.split('F')[1];
															stringToDisplay = stringToDisplay.replace(new RegExp("&", 'g'),"");
														}
                                                        valueLeaked= valueLeaked +" "+ stringToDisplay;
                                                    }
                                                }
                                            }
    									}
								}
								else
									continue;
							}
							else
								if(verifiedLabel==null){
									if(temp[1] != ""){
										category=this.pii;
										if((this.categories[i]==category) && (temp[1].indexOf("@") != -1 || temp[1].indexOf("%40") != -1)){
											if (!hashForLeak.hasOwnProperty(mailaddress)){
												infoLeaked="Mail Address";
												valueLeaked=temp[1];
												//console.log("categoriesyyyyyyyyyyyy: "+this.categories[i]+"-----"+category+"-------"+temp[1]+"---------"+temp[0]+"++++"+this.listCaptured[j]);
												//category="Personal Information";
											}
										}
										else {
											category=this.finger;
											if((this.categories[i]==category) && (temp[0].indexOf("utmwv") != -1)){
												if (!hashForLeak.hasOwnProperty(this.descriptionLoad["utmwv"])){
													infoLeaked=this.descriptionLoad["utmwv"];
													valueLeaked=temp[1];	
													//category="Browser Fingerprinting";
												}
											}
											else{
												if((this.categories[i]==category) && (/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/gi.test(temp[1]))){
													if (!hashForLeak.hasOwnProperty(ip)){
														infoLeaked="IP Address Connection";
														valueLeaked=temp[1];
														hashForLeak[ip]=1;
													}
													//category="Tracking Information";
												}
												else
													continue;
											}
										}
									}
									else
										continue;
								}				
					}//fine tutte condizioni IF ma all'interno del for generale
					if (infoLeaked!=null) {
						var child = document.createElement("treeitem");
						var childrow = document.createElement("treerow");
						var childrequestOrigin = document.createElement("treecell");
						childrequestOrigin.setAttribute("label",infoLeaked);
						var childresource = document.createElement("treecell");
						childresource.setAttribute("label",valueLeaked);
						var childtype = document.createElement("treecell");
						//childtype.setAttribute("label",category);
						childrow.appendChild(childrequestOrigin);
						childrow.appendChild(childresource);
						childrow.appendChild(childtype);
						child.appendChild(childrow);
						children.appendChild(child);	
						valueLeaked=null;
						infoLeaked=null;
						category=null;
					}
				}
			}
			
		},
	
		/*createTreeAwarenessLeaked: function(){
			var treechildren1 = document.getElementById("childreeenAwareness");
			var size=this.listCaptured.length;
			console.log(size);
			var valueLeaked=null;
			var infoLeaked=null;
			var category=null;
			var temp=null;
			
			for(i=0;i<size;i++){
				//console.log("PRIMA ESCAPE= "+this.listCaptured[i]);

				this.listCaptured[i]=this.escape(this.listCaptured[i]);

				//console.log("DOPO ESCAPE= "+this.listCaptured[i]);
				
				if(this.listCaptured[i].indexOf("=") != -1)
					temp=this.listCaptured[i].split("=");
					
				//* Caso in cui le informazioni catturare sono comprese in due coppie di =
				  //* caso indirizzo IP perso su MySpace 
				if(temp.length==3){
					//console.log(temp[0]+" - "+temp[1]+" - "+temp[2]);
					if(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/gi.test(temp[1])){
						infoLeaked="IP Address Connection";
						valueLeaked=temp[1];
						category="Tracking Information";
					}
					else
						if(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/gi.test(temp[2])){
							infoLeaked="IP Address Connection";
							valueLeaked=temp[2];
							category="Tracking Information";
						}
				}	
				else{	
						//* Caso in cui le informazioni catturare sono comprese in un solo = 
						//console.log(temp[0]+" - "+temp[1]);
						
						//* Prelevo la descriptionLoad per verificare se il valore precedente
						  //* ad = corrisponde ad un parametro di ricerca. 
						var verifiedLabel=this.descriptionLoad[temp[0]];
						
						//verifico se il value della label � presente
						if(verifiedLabel != null){
							if(temp[1] != ""){
								infoLeaked=verifiedLabel;
								valueLeaked=temp[1];
								//console.log("Verified Label: "+infoLeaked);

								//verifico la categoria dell'informazione
								if(/(__utm.*?)|(utm.*?)/gi.test(temp[0])){	
									category="Browser Fingerprinting";
								}
								else
									if(/c_user|xs|Username/gi.test(temp[0])){
										category="Tracking Information";
									}
								else
									if(/kage|age|SplashDisplayName|kgender|gender|gen|zip|country|cntry|kcr/i.test(temp[0])){
										if(/kgender|gender/i.test(temp[0]) && temp[1]==0 || /kgender|gender/i.test(temp[0]) && temp[1]==1)	
											continue;
											
										if(/kage|age/i.test(temp[0]) && temp[1]==0)
											continue;
											
										category="Personal Information";
									}
							}
							else
								continue;
						}
						else
							if(verifiedLabel==null){
								if(temp[1] != ""){
									if(temp[1].indexOf("@") != -1 || temp[1].indexOf("%40") != -1){
										infoLeaked="Mail Address";
										valueLeaked=temp[1];
										category="Personal Information";
									}
									else
										if(temp[0].indexOf("utmwv") != -1){
											infoLeaked=this.descriptionLoad["utmwv"];
											valueLeaked=temp[1];	
											category="Browser Fingerprinting";
										}
									else
										if(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/gi.test(temp[1])){
											infoLeaked="IP Address Connection";
											valueLeaked=temp[1];
											category="Tracking Information";
										}
									else
										continue;
								}
								else
									continue;
							}					
					}//fine tutte condizioni IF ma all'interno del for generale
				
				var t1 = document.createElement("treecell");
				var t2 = document.createElement("treecell");
				var t3 = document.createElement("treecell");
				
				
				t1.setAttribute("label",infoLeaked);
				t2.setAttribute("label",valueLeaked);
				t3.setAttribute("label",category);
		
				var treerow = document.createElement("treerow");
				treerow.appendChild(t1);
				treerow.appendChild(t2);
				treerow.appendChild(t3);
									
				var treeitem = document.createElement("treeitem");
				treeitem.appendChild(treerow);
				treechildren1.appendChild(treeitem);
				
			}//fine FOR generale
		},*/
		
		setTreeHiddenAwarenessWindowSize: function(){
			var w = screen.width;
			var h = screen.height;
			var tree = document.getElementById("awarenessTree");
			var box = document.getElementById("hiddenAwareness-group");
			tree.setAttribute("width",510);
			box.setAttribute("width",500);
		},
		
		setWindowSize: function(height){
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
			var win = wm.getMostRecentWindow("global:notracesensitiveinfo");
			
			win.window.outerHeight = height;
		},
		
		changeAwarenessLabel: function(){
			//console.log(this.listCaptured.length);
			if(this.listCaptured == null){
				this.setLabelValue("awarenessInfoFound",this.common.getLocalizedMessage("great.label"));
				this.setImagePath("imageId","imgs/smile.png");	
			}
			else
				if(this.listCaptured.length != 0){
					this.setLabelValue("awarenessInfoFound",this.common.getLocalizedMessage("careful.label"));	
					this.setImagePath("imageId","imgs/sad1.png");	
				}
			else{
				this.setLabelValue("awarenessInfoFound",this.common.getLocalizedMessage("great.label"));
				this.setImagePath("imageId","imgs/smile.png");	
			}
		},
		
		/************************************************************
		 *	Funzione che carica le informazioni contenute all'interno
		 *	di various.properties all'interno dell'array descriptionLoad
		 *	che verr� utilizzato in  seguito dalla funzione createTreeAwarenessLeaked
		 ************************************************************/
		loadInformationLabel: function(){
			this.descriptionLoad["utmac"]=this.common.getLocalizedMessage("utmac.label");
			this.descriptionLoad["utmcc"]=this.common.getLocalizedMessage("utmcc.label");
			this.descriptionLoad["utmcn"]=this.common.getLocalizedMessage("utmcn.label");
			this.descriptionLoad["utmcr"]=this.common.getLocalizedMessage("utmcr.label");
			this.descriptionLoad["utmcs"]=this.common.getLocalizedMessage("utmcs.label");
			this.descriptionLoad["utmdt"]=this.common.getLocalizedMessage("utmdt.label");
			this.descriptionLoad["utmfl"]=this.common.getLocalizedMessage("utmfl.label");
			this.descriptionLoad["utmhn"]=this.common.getLocalizedMessage("utmhn.label");
			this.descriptionLoad["utmje"]=this.common.getLocalizedMessage("utmje.label");
			this.descriptionLoad["utmn"]=this.common.getLocalizedMessage("utmn.label");
			this.descriptionLoad["utmp"]=this.common.getLocalizedMessage("utmp.label");
			this.descriptionLoad["utmr"]=this.common.getLocalizedMessage("utmr.label");
			this.descriptionLoad["utmsc"]=this.common.getLocalizedMessage("utmsc.label");
			this.descriptionLoad["utmsr"]=this.common.getLocalizedMessage("utmsr.label");
			this.descriptionLoad["utmul"]=this.common.getLocalizedMessage("utmul.label");
			this.descriptionLoad["utmwv"]=this.common.getLocalizedMessage("utmwv.label");
			this.descriptionLoad["utmt"]=this.common.getLocalizedMessage("utmt.label");
			this.descriptionLoad["utmipc"]=this.common.getLocalizedMessage("utmipc.label");
			this.descriptionLoad["utmipn"]=this.common.getLocalizedMessage("utmipn.label");
			this.descriptionLoad["utmipr"]=this.common.getLocalizedMessage("utmipr.label");
			this.descriptionLoad["utmiqt"]=this.common.getLocalizedMessage("utmiqt.label");
			this.descriptionLoad["utmiva"]=this.common.getLocalizedMessage("utmiva.label");
			this.descriptionLoad["utmtci"]=this.common.getLocalizedMessage("utmtci.label");
			this.descriptionLoad["utmtco"]=this.common.getLocalizedMessage("utmtco.label");
			this.descriptionLoad["utmtid"]=this.common.getLocalizedMessage("utmtid.label");
			this.descriptionLoad["utmtrg"]=this.common.getLocalizedMessage("utmtrg.label");
			this.descriptionLoad["utmtsp"]=this.common.getLocalizedMessage("utmtsp.label");
			this.descriptionLoad["utmtst"]=this.common.getLocalizedMessage("utmtst.label");
			this.descriptionLoad["utmtto"]=this.common.getLocalizedMessage("utmtto.label");
			this.descriptionLoad["utmttx"]=this.common.getLocalizedMessage("utmttx.label");
			this.descriptionLoad["utme"]=this.common.getLocalizedMessage("utme.label");
			this.descriptionLoad["__utma"]=this.common.getLocalizedMessage("__utma.label");
			this.descriptionLoad["__utmb"]=this.common.getLocalizedMessage("__utmb.label");
			this.descriptionLoad["__utmc"]=this.common.getLocalizedMessage("__utmc.label");
			this.descriptionLoad["__utmz"]=this.common.getLocalizedMessage("__utmz.label");
			this.descriptionLoad["__utmv"]=this.common.getLocalizedMessage("__utmv.label");
			this.descriptionLoad["c_user"]=this.common.getLocalizedMessage("c_user.label");
			this.descriptionLoad["xs"]=this.common.getLocalizedMessage("xs.label");
			this.descriptionLoad["kage"]=this.common.getLocalizedMessage("kage.label");
			this.descriptionLoad["kgender"]=this.common.getLocalizedMessage("kgender.label");
			this.descriptionLoad["age"]=this.common.getLocalizedMessage("age.label");
			this.descriptionLoad["gender"]=this.common.getLocalizedMessage("gender.label");
			this.descriptionLoad["gen"]=this.common.getLocalizedMessage("gen.label");
			this.descriptionLoad["kcr"]=this.common.getLocalizedMessage("kcr.label");
			this.descriptionLoad["country"]=this.common.getLocalizedMessage("country.label");
			this.descriptionLoad["MSCOUNTRY"]=this.common.getLocalizedMessage("MSCOUNTRY.label");
			this.descriptionLoad["Username"]=this.common.getLocalizedMessage("Username.label");
			this.descriptionLoad["SplashDisplayName"]=this.common.getLocalizedMessage("SplashDisplayName.label");
			this.descriptionLoad["cntry"]=this.common.getLocalizedMessage("cntry.label");
			this.descriptionLoad["zip"]=this.common.getLocalizedMessage("zip.label");
			this.descriptionLoad["ccn"]=this.common.getLocalizedMessage("education.label");
			this.descriptionLoad["c_cnn"]=this.common.getLocalizedMessage("education.label");
			this.descriptionLoad["cuname"]=this.common.getLocalizedMessage("employment.label");
			this.descriptionLoad["c_cuname"]=this.common.getLocalizedMessage("employment.label");
			this.descriptionLoad["travel"]=this.common.getLocalizedMessage("travel.label");
			this.descriptionLoad["roundtrip"]=this.common.getLocalizedMessage("roundtrip.label");
			this.descriptionLoad["origin"]=this.common.getLocalizedMessage("origin.label");
			this.descriptionLoad["destination"]=this.common.getLocalizedMessage("destination.label");
			this.descriptionLoad["leave"]=this.common.getLocalizedMessage("leave.label");
			this.descriptionLoad["arrive"]=this.common.getLocalizedMessage("arrive.label");
			this.descriptionLoad["passengers"]=this.common.getLocalizedMessage("passengers.label");
			this.descriptionLoad["isp"]=this.common.getLocalizedMessage("isp.label");
		},
		
		/************************************************************
		 *	Funzioni che al click sul valore dell'oggetto 
		 *	corrispondente, abilitano/disabilitano la visualizzazione
		 *	della tabella con le varie info + creazione info by metodo "Create"
		 ************************************************************/
		openDialogReferer: function() {
			var panelAwareness=document.getElementById("hiddenAwareness-group");
			var panelInfoList=document.getElementById("notrace-hiddenInfo-group");
			
			if (panelInfoList.style.display=="block"){
				//rimuovo tutti gli elementi della lista
				var element=document.getElementById("notrace-treechildren1");
				while (element.firstChild) {
					element.removeChild(element.firstChild);
				}
				
				if(panelAwareness.style.display=="none" || panelAwareness.style.display=="block")
					this.setWindowSize(601);
				
				this.createTreeReferer();
				this.setTreeSize();
				//this.setWindowSize(465);

			}
			else {
				panelInfoList.style.display="block";
				
				if(panelAwareness.style.display=="block" || panelAwareness.style.display=="none")
					this.setWindowSize(601);
					
				this.createTreeReferer();
				this.setTreeSize();
			}
		},
		
		openDialogCookie: function() {
			var panelAwareness=document.getElementById("hiddenAwareness-group");
			var panelInfoList=document.getElementById("notrace-hiddenInfo-group");
			
			if (panelInfoList.style.display=="block"){
				//rimuovo tutti gli elementi della lista
				var element=document.getElementById("notrace-treechildren1");
				while (element.firstChild) {
					element.removeChild(element.firstChild);
				}
				
				if(panelAwareness.style.display=="none" || panelAwareness.style.display=="block")
					this.setWindowSize(601);
				
				this.createTreeCookie();
				this.setTreeSize();
				//this.setWindowSize(465);

			}
			else {
				panelInfoList.style.display="block";
				
				if(panelAwareness.style.display=="block" || panelAwareness.style.display=="none")
					this.setWindowSize(601);
					
				this.createTreeCookie();
				this.setTreeSize();
			}
		},
		
		openDialogThirdCookie: function() {
			var panelAwareness=document.getElementById("hiddenAwareness-group");
			var panelInfoList=document.getElementById("notrace-hiddenInfo-group");
			
			if (panelInfoList.style.display=="block"){
				//rimuovo tutti gli elementi della lista
				var element=document.getElementById("notrace-treechildren1");
				while (element.firstChild) {
					element.removeChild(element.firstChild);
				}
				
				if(panelAwareness.style.display=="none" || panelAwareness.style.display=="block")
					this.setWindowSize(601);
				
				this.createTreeThirdCookie();
				this.setTreeSize();
				//this.setWindowSize(465);

			}
			else {
				panelInfoList.style.display="block";
				
				if(panelAwareness.style.display=="block" || panelAwareness.style.display=="none")
					this.setWindowSize(601);
					
				this.createTreeThirdCookie();
				this.setTreeSize();
			}
		},
		
		openDialogWebBug: function() {
			var panelAwareness=document.getElementById("hiddenAwareness-group");
			var panelInfoList=document.getElementById("notrace-hiddenInfo-group");
			
			if (panelInfoList.style.display=="block"){
				//rimuovo tutti gli elementi della lista
				var element=document.getElementById("notrace-treechildren1");
				while (element.firstChild) {
					element.removeChild(element.firstChild);
				}
				
				if(panelAwareness.style.display=="none" || panelAwareness.style.display=="block")
					this.setWindowSize(601);
				
				this.createTreeWebBug();
				this.setTreeSize();
				//this.setWindowSize(465);

			}
			else {
				panelInfoList.style.display="block";
				
				if(panelAwareness.style.display=="block" || panelAwareness.style.display=="none")
					this.setWindowSize(601);
					
				this.createTreeWebBug();
				this.setTreeSize();
			}
		},
		
		/*openDialogFlashCookie: function() {
			var panelAwareness=document.getElementById("hiddenAwareness-group");
			var panelInfoList=document.getElementById("notrace-hiddenInfo-group");
			
			if (panelInfoList.style.display=="block"){
				//rimuovo tutti gli elementi della lista
				var element=document.getElementById("notrace-treechildren1");
				while (element.firstChild) {
					element.removeChild(element.firstChild);
				}
				panelInfoList.style.display="none";
				
				if(panelAwareness.style.display=="block" || panelAwareness.style.display=="none")
					this.setWindowSize(465);

			}
			else {
				panelInfoList.style.display="block";
				
				if(panelAwareness.style.display=="block" || panelAwareness.style.display=="none")
					this.setWindowSize(601);
					
				this.createTreeFlashCookie();
				this.setTreeSize();
			}
		},*/
		
		openDialogThirdWebSite: function() {
			var panelAwareness=document.getElementById("hiddenAwareness-group");
			var panelInfoList=document.getElementById("notrace-hiddenInfo-group");
			
			if (panelInfoList.style.display=="block"){
				//rimuovo tutti gli elementi della lista
				var element=document.getElementById("notrace-treechildren1");
				while (element.firstChild) {
					element.removeChild(element.firstChild);
				}
				
				if(panelAwareness.style.display=="none" || panelAwareness.style.display=="block")
					this.setWindowSize(601);
				
				this.createTreeThirdWebSite();
				this.setTreeSize();
				//this.setWindowSize(465);

			}
			else {
				panelInfoList.style.display="block";
				
				if(panelAwareness.style.display=="block" || panelAwareness.style.display=="none")
					this.setWindowSize(601);
					
				this.createTreeThirdWebSite();
				this.setTreeSize();
			}
		},
		
		openDialogThirdImage: function() {
			var panelAwareness=document.getElementById("hiddenAwareness-group");
			var panelInfoList=document.getElementById("notrace-hiddenInfo-group");
			
			if (panelInfoList.style.display=="block"){
				//rimuovo tutti gli elementi della lista
				var element=document.getElementById("notrace-treechildren1");
				while (element.firstChild) {
					element.removeChild(element.firstChild);
				}
				
				if(panelAwareness.style.display=="none" || panelAwareness.style.display=="block")
					this.setWindowSize(601);
				
				this.createTreeThirdImage();
				this.setTreeSize();
				//this.setWindowSize(465);

			}
			else {
				panelInfoList.style.display="block";
				
				if(panelAwareness.style.display=="block" || panelAwareness.style.display=="none")
					this.setWindowSize(601);
					
				this.createTreeThirdImage();
				this.setTreeSize();
			}
		},
		
		/************************************************************
		 *	Funzione che setta il valore ad una Label XUL
		 *	tramite il passaggio dell'id.
		 ************************************************************/
		setLabelValue: function(idLabel,count){
			var label=document.getElementById(idLabel);
			label.setAttribute("value",count);
		},

		/************************************************************
		 *	Funzione che setta il percorso dell'immagine da caricare
		 *	all'interno di un elemento <image> XUL.
		 ************************************************************/
		setImagePath: function(idLabel,path){
			var label=document.getElementById(idLabel);
			label.setAttribute("src",path);
		},
		
		/************************************************************
		 *	Funzioni che effettuano,a partire da array di info, 
		 *	la creazione del tree corrispondente in versione tabellare.
		 ************************************************************/
		createTreeCookie: function(){
			var treechildren1 = document.getElementById("notrace-treechildren1");
			var num_orig = this.cookieReqValue.length;	
			
			for(i=0;i<num_orig;i++){
				var cookieValue = this.cookieReqValue[i];
				
				var spCook = cookieValue.split(";");
				if(spCook.length!=0){
					for(var j=0;j<spCook.length;j++){
						var t1 = document.createElement("treecell");
						var t2 = document.createElement("treecell");
				
						t1.setAttribute("label",this.host);
						t2.setAttribute("label","Cookie Request: "+spCook[j]);
		
						var treerow = document.createElement("treerow");
						treerow.appendChild(t1);
						treerow.appendChild(t2);
					
						var treeitem = document.createElement("treeitem");
						treeitem.appendChild(treerow);
						treechildren1.appendChild(treeitem);
					}
				}
				else{
						var t1 = document.createElement("treecell");
						var t2 = document.createElement("treecell");
				
						t1.setAttribute("label",this.host);
						t2.setAttribute("label","Cookie Request: "+cookieValue);
		
						var treerow = document.createElement("treerow");
						treerow.appendChild(t1);
						treerow.appendChild(t2);
					
						var treeitem = document.createElement("treeitem");
						treeitem.appendChild(treerow);
						treechildren1.appendChild(treeitem);
					}
			}

			//carico i response cookie salvati nel l'array all'interno dell'tabella
			var sizeCookieResValue = this.cookieResValue.length;	
			for(i=0;i<sizeCookieResValue;i++){
				var cookieValue = this.cookieResValue[i];

				var spCook = cookieValue.split(";");
				if(spCook.length!=0){
					for(var j=0;j<spCook.length;j++){
						var t1 = document.createElement("treecell");
						var t2 = document.createElement("treecell");
				
						t1.setAttribute("label",this.host);
						t2.setAttribute("label","Cookie Response: "+spCook[j]);
		
						var treerow = document.createElement("treerow");
						treerow.appendChild(t1);
						treerow.appendChild(t2);
					
						var treeitem = document.createElement("treeitem");
						treeitem.appendChild(treerow);
						treechildren1.appendChild(treeitem);
					}
				}
				else{
						var t1 = document.createElement("treecell");
						var t2 = document.createElement("treecell");
				
						t1.setAttribute("label",this.host);
						t2.setAttribute("label","Cookie Response: "+cookieValue);
		
						var treerow = document.createElement("treerow");
						treerow.appendChild(t1);
						treerow.appendChild(t2);
					
						var treeitem = document.createElement("treeitem");
						treeitem.appendChild(treerow);
						treechildren1.appendChild(treeitem);
					}
			}
		},
		
		loadRequestCookies: function(){
			this.cookieReqValue = new Array();
			var elements=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getBlockableObjects('nocookie');
			for (var elem in elements) {
				// devo fare il controllo solo su requestorigin e resourcelocation perch� so gi� che � un noidheader==cookie
				if ((elements[elem].reqOrig_domain==this.host) && (elements[elem].loc_domain==this.host) && (this.date==elements[elem].time) && (elements[elem].optionalHeaderName=="Cookie")){
					this.cookieReqValue.push(elements[elem].resource);
				}
			}
			var num_orig = this.getNumberCookies(this.cookieReqValue);	
			return num_orig;
		},
		
		loadResponseCookies: function(){
			this.cookieResValue = new Array();
			var elements=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getBlockableObjects('nocookie');
			for (var elem in elements) {
				// devo fare il controllo solo su requestorigin e resourcelocation perch� so gi� che � un noidheader==cookie
				if ((elements[elem].reqOrig_domain==this.host) && (elements[elem].loc_domain==this.host) && (this.date==elements[elem].time) && (elements[elem].nocookie==1)) {
					this.cookieResValue.push(elements[elem].resource);
				}
			}

			var num_orig = this.getNumberCookies(this.cookieResValue);	
			return num_orig;
		},
		
		createTreeThirdCookie: function(){
			var treechildren1 = document.getElementById("notrace-treechildren1");
			var num_orig = this.cookieThirdReqValue.length;	
				
			//carico i request cookie salvati nel l'array all'interno dell'tabella
			for(i=0;i<num_orig;i++){
				var cookieValue = this.cookieThirdReqValue[i];
				var thirdDomain = this.cookieThirdReqDomain[i];
				
				var spCook = cookieValue.split(";");
				if(spCook.length!=0){
					for(var j=0;j<spCook.length;j++){
						var t1 = document.createElement("treecell");
						var t2 = document.createElement("treecell");
				
						t1.setAttribute("label",thirdDomain);
						t2.setAttribute("label","Third Cookie Request: "+spCook[j]);
		
						var treerow = document.createElement("treerow");
						treerow.appendChild(t1);
						treerow.appendChild(t2);
					
						var treeitem = document.createElement("treeitem");
						treeitem.appendChild(treerow);
						treechildren1.appendChild(treeitem);
					}
				}
				else{
						var t1 = document.createElement("treecell");
						var t2 = document.createElement("treecell");
				
						t1.setAttribute("label",thirdDomain);
						t2.setAttribute("label","Third Cookie Request: "+cookieValue);
		
						var treerow = document.createElement("treerow");
						treerow.appendChild(t1);
						treerow.appendChild(t2);
					
						var treeitem = document.createElement("treeitem");
						treeitem.appendChild(treerow);
						treechildren1.appendChild(treeitem);
					}
			}

			//carico i response cookie salvati nel l'array all'interno dell'tabella
			var sizeCookieResValue = this.cookieThirdResValue.length;	
			for(i=0;i<sizeCookieResValue;i++){
				var cookieValue = this.cookieThirdResValue[i];
				var thirdDomain = this.cookieThirdResDomain[i];
				
				var spCook = cookieValue.split(";");
				if(spCook.length!=0){
					for(var j=0;j<spCook.length;j++){
						var t1 = document.createElement("treecell");
						var t2 = document.createElement("treecell");
				
						t1.setAttribute("label",thirdDomain);
						t2.setAttribute("label","Third Cookie Response: "+spCook[j]);
		
						var treerow = document.createElement("treerow");
						treerow.appendChild(t1);
						treerow.appendChild(t2);
					
						var treeitem = document.createElement("treeitem");
						treeitem.appendChild(treerow);
						treechildren1.appendChild(treeitem);
					}
				}
				else{
						var t1 = document.createElement("treecell");
						var t2 = document.createElement("treecell");
				
						t1.setAttribute("label",thirdDomain);
						t2.setAttribute("label","Third Cookie Response: "+cookieValue);
		
						var treerow = document.createElement("treerow");
						treerow.appendChild(t1);
						treerow.appendChild(t2);
					
						var treeitem = document.createElement("treeitem");
						treeitem.appendChild(treerow);
						treechildren1.appendChild(treeitem);
					}
			}
		},
		
		getNumberCookies: function(arrayCookies){
			var arrayCook=arrayCookies;
			var temp=new Array();
			
			var lenCook=arrayCook.length;
			
			for(var i=0;i<lenCook;i++){
				var currCookie=arrayCook[i];
				var spCook = currCookie.split(";");
				if(spCook.length!=0){
					for(var j=0;j<spCook.length;j++){
						temp.push(spCook[j]);
					}
				}	
				else
					if(spCook!="")
						temp.push(spCook[j]);
				else
					continue;
			}
			return temp.length;
		},
		
		loadRequestThirdCookies: function(){
			this.cookieThirdReqValue = new Array();
			this.cookieThirdReqDomain = new Array();
			var elements=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getBlockableObjects('nocookie');
			for (var elem in elements) {
				// devo fare il controllo solo su requestorigin e resourcelocation perch� so gi� che � un noidheader==cookie
				if ((elements[elem].reqOrig_domain==this.host) && (elements[elem].loc_domain!=this.host) && (this.date==elements[elem].time) && (elements[elem].optionalHeaderName=="Cookie")) {
					this.cookieThirdReqDomain.push(elements[elem].loc_domain);
					this.cookieThirdReqValue.push(elements[elem].resource);
				}
			}
			
			var num_orig = this.getNumberCookies(this.cookieThirdReqValue);	
			return num_orig;
		},
		
		loadResponseThirdCookies: function(){
			this.cookieThirdResValue = new Array();
			this.cookieThirdResDomain = new Array();
			var elements=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getBlockableObjects('nocookie');
			for (var elem in elements) {
				// devo fare il controllo solo su requestorigin e resourcelocation perch� so gi� che � un noidheader==cookie
				if ((elements[elem].reqOrig_domain==this.host) && (elements[elem].loc_domain!=this.host) && (this.date==elements[elem].time) && (elements[elem].nocookie==1)){
					this.cookieThirdResDomain.push(elements[elem].loc_domain);
					this.cookieThirdResValue.push(elements[elem].resource);
				}
			}

			var num_orig = this.getNumberCookies(this.cookieThirdResValue);	
			return num_orig;
		},
		
		createTreeReferer: function(){
			var treechildren1 = document.getElementById("notrace-treechildren1");
			var num_orig = this.referer1.length;	
				
			//carico i request cookie salvati nel l'array all'interno dell'tabella
			for(i=0;i<num_orig;i++){
				var resourceLocation = this.referer1[i];
				var resource = this.referer2[i];
				
				var t1 = document.createElement("treecell");
				var t2 = document.createElement("treecell");
				
				t1.setAttribute("label",resourceLocation);
				t2.setAttribute("label",resource);
		
				var treerow = document.createElement("treerow");
				treerow.appendChild(t1);
				treerow.appendChild(t2);
					
				var treeitem = document.createElement("treeitem");
				treeitem.appendChild(treerow);
				treechildren1.appendChild(treeitem);
			}
		},
		
		loadReferer: function(){
			this.referer1 = new Array();
			this.referer2 = new Array();
			var elements=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getBlockableObjects('noidheader');
			for (var elem in elements) {
				if ((elements[elem].reqOrig_domain==this.host) && (this.date==elements[elem].time) && (elements[elem].optionalHeaderName=="Referer")) {
					this.referer1.push(elements[elem].loc_domain);
					this.referer2.push(elements[elem].resource);
				}
				
			}

			var num_orig = this.referer1.length;	
			return num_orig;
		},
		
		createTreeWebBug: function(){
			var treechildren1 = document.getElementById("notrace-treechildren1");
			var num_orig = this.webBug1.length;	
				
			//carico i request cookie salvati nel l'array all'interno dell'tabella
			for(i=0;i<num_orig;i++){
				var resourceLocation = this.webBug1[i];
				var resource = this.webBug2[i];
				
				var t1 = document.createElement("treecell");
				var t2 = document.createElement("treecell");
				
				t1.setAttribute("label",resourceLocation);
				t2.setAttribute("label",resource);
		
				var treerow = document.createElement("treerow");
				treerow.appendChild(t1);
				treerow.appendChild(t2);
					
				var treeitem = document.createElement("treeitem");
				treeitem.appendChild(treerow);
				treechildren1.appendChild(treeitem);
			}
		},
		
		loadWebBug: function(){
			this.webBug1 = new Array();
			this.webBug2 = new Array();
			var elements=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getBlockableObjects('nowebbug');
			for (var elem in elements) {
				//console.log("PRIMA DELL IF host: "+this.host+"----"+elements[elem].reqOrig_domain+"------"+elements[elem].loc_domain+"------"+elements[elem].no3img+"--------"+this.thirdImage1.length);
				if ((elements[elem].reqOrig_domain==this.host) && (this.date==elements[elem].time)) {
					this.webBug1.push(elements[elem].loc_domain);
					this.webBug2.push(elements[elem].resource);
				}
			}

			var num_orig = this.webBug1.length;	
			return num_orig;
		},
		
		/*createTreeFlashCookie: function(){
			var treechildren1 = document.getElementById("notrace-treechildren1");
			var num_orig = this.flashcookie1.length;	
				
			//carico i flashCookie salvati nell'array all'interno della tabella
			for(i=0;i<num_orig;i++){
				var resourceLocation = this.flashcookie1[i];
				var resource = this.flashcookie2[i];
				
				var t1 = document.createElement("treecell");
				var t2 = document.createElement("treecell");
				
				t1.setAttribute("label",resourceLocation);
				t2.setAttribute("label",resource);
		
				var treerow = document.createElement("treerow");
				treerow.appendChild(t1);
				treerow.appendChild(t2);
					
				var treeitem = document.createElement("treeitem");
				treeitem.appendChild(treerow);
				treechildren1.appendChild(treeitem);
			}
		},
		
		loadFlashCookie: function(){
			this.dbconn = this.initDBConnection();
			var selectOriginsStatement = this.dbconn.createStatement("SELECT resourceLocation,resource FROM resources WHERE requestOrigin='"+this.host+"' AND time='"+this.date+"' AND noflashcookie='1'");
			this.flashcookie1 = new Array();
			this.flashcookie2 = new Array();
			try {
				while( selectOriginsStatement.executeStep() ) {
					var resourceLocation = selectOriginsStatement.getUTF8String(0);
					var resource = selectOriginsStatement.getUTF8String(1);
					this.flashcookie1.push(resourceLocation);
					this.flashcookie2.push(resource);
				}
			}
			finally { selectOriginsStatement.reset(); }	  

			var num_orig = this.flashcookie1.length;	
			return num_orig;
		},*/
		
		createTreeThirdWebSite: function(){
			var treechildren1 = document.getElementById("notrace-treechildren1");
			var num_orig = this.thirdWebSite1.length;	
				
			//carico i thirdWebsite salvati nell'array all'interno della tabella
			for(i=0;i<num_orig;i++){
				var resourceLocation = this.thirdWebSite1[i];
				var resource = this.thirdWebSite2[i];
				
				var t1 = document.createElement("treecell");
				var t2 = document.createElement("treecell");
				
				t1.setAttribute("label",resourceLocation);
				t2.setAttribute("label",resource);
		
				var treerow = document.createElement("treerow");
				treerow.appendChild(t1);
				treerow.appendChild(t2);
					
				var treeitem = document.createElement("treeitem");
				treeitem.appendChild(treerow);
				treechildren1.appendChild(treeitem);
			}
		},
		
		loadThirdWebSite: function(){
			this.thirdWebSite1 = new Array();
			this.thirdWebSite2 = new Array();
			var elements=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getBlockableObjects('no3js');
			for (var elem in elements) {
				if ((elements[elem].reqOrig_domain==this.host) && (elements[elem].loc_domain!=this.host) && (this.date==elements[elem].time) && (elements[elem].no3js==1)){
					this.thirdWebSite1.push(elements[elem].loc_domain);
					this.thirdWebSite2.push(elements[elem].resource);
				}
				
			}
			elements=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getBlockableObjects('no3hiddenobj');
			for (var elem in elements) {
				if ((elements[elem].reqOrig_domain==this.host) && (elements[elem].loc_domain!=this.host) && (this.date==elements[elem].time) && (elements[elem].no3hiddenobj==1)) {
					this.thirdWebSite1.push(elements[elem].loc_domain);
					this.thirdWebSite2.push(elements[elem].resource);
				}
				
			}
			elements=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getBlockableObjects('notop');
			for (var elem in elements) {
				if ((elements[elem].reqOrig_domain==this.host) && (elements[elem].loc_domain!=this.host) && (this.date==elements[elem].time) && (elements[elem].notop==1)) {
					this.thirdWebSite1.push(elements[elem].loc_domain);
					this.thirdWebSite2.push(elements[elem].resource);
				}
			}

			var num_orig = this.thirdWebSite1.length;	
			return num_orig;
		},
		
		createTreeThirdImage: function(){
			var treechildren1 = document.getElementById("notrace-treechildren1");
			var num_orig = this.thirdImage1.length;	
				
			//carico gli oggetti no3img salvati nell'array all'interno della tabella
			for(i=0;i<num_orig;i++){
				var resourceLocation = this.thirdImage1[i];
				var resource = this.thirdImage2[i];
				
				var t1 = document.createElement("treecell");
				var t2 = document.createElement("treecell");
				
				t1.setAttribute("label",resourceLocation);
				t2.setAttribute("label",resource);
		
				var treerow = document.createElement("treerow");
				treerow.appendChild(t1);
				treerow.appendChild(t2);
					
				var treeitem = document.createElement("treeitem");
				treeitem.appendChild(treerow);
				treechildren1.appendChild(treeitem);
			}
		},
		
		loadThirdImage: function(){
			this.thirdImage1 = new Array();
			this.thirdImage2 = new Array();
			var elements=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getBlockableObjects('no3img');
			for (var elem in elements) {
				//console.log("PRIMA DELL IF host: "+this.host+"----"+elements[elem].reqOrig_domain+"------"+elements[elem].loc_domain+"------"+elements[elem].no3img);
				if ((elements[elem].reqOrig_domain==this.host) && (elements[elem].loc_domain!=this.host) && (this.date==elements[elem].time) && (elements[elem].no3img==1)) {
					this.thirdImage1.push(elements[elem].loc_domain);
					this.thirdImage2.push(elements[elem].resource);
					//console.log("host: "+this.host+"----"+elements[elem].reqOrig_domain+"------"+elements[elem].loc_domain+"------"+elements[elem].no3img+"----Count: "+count+"----"+this.thirdImage1.length);
				}
			}

			var num_orig = this.thirdImage1.length;	
			return num_orig;
		},

	    /************************************************** 
		* Funzione che viene invocata all'interno di awareness.xul
		* attraverso l'evento "onload" del tag window, ci� permette
		* il caricamento del numero di oggetti rilevati per ogni host.
		**************************************************/
		load: function(){
			/************************************************** 
			 * Estrapolo e setto il valore dell'Host corrente
			 **************************************************/
			this.getURLForTabBrowser();
		
			/************************************************** 
			 * Calcolo la data corrente per le interrogazioni al db
			 **************************************************/
			this.date=this.getRealTimeDate();
			
			/************************************************** 
			 * Crea/Legge il contenuto dal file awarenessKeywords
			 * e lo memorizza all'interno di un array globale
			 *	===> this.awarenessKeywords
			 **************************************************/
			this.createAndReadKeywordsFile();

			/************************************************** 
			 * Carica le informazioni inerenti le label dal file 
			 * various.properties e le memorizza nell'array descriptionLoad
			 * "UTILE" per il estrapolare le informazioni dall'array listCaptured
			 **************************************************/
			this.loadInformationLabel();
			
			/************************************************** 
			 * Prelevo il numero degli oggetti rilevati sia
			 * nei FIRST cookie request/response e salvo
             * tale numero nella label inerente i cookie.			 
			 **************************************************/
			var numFirstCookieReq=this.loadRequestCookies();
			var numFirstCookieRes=this.loadResponseCookies();
			var tot=numFirstCookieReq+numFirstCookieRes;
			this.setLabelValue("a2",tot);
			
			/************************************************** 
			 * Prelevo il numero degli oggetti rilevati sia
			 * nei THIRD cookie request/response e salvo
             * tale numero nella label inerente i cookie.			 
			 **************************************************/
			var numThirdCookieReq=this.loadRequestThirdCookies();
			var numThirdCookieRes=this.loadResponseThirdCookies();
			var tot=numThirdCookieReq+numThirdCookieRes;
			this.setLabelValue("a3",tot);
			
			/************************************************** 
			 * Prelevo il numero degli oggetti Referer rilevati			 
			 **************************************************/
			var numReferer=this.loadReferer();
			this.setLabelValue("a1",numReferer);
			
			/************************************************** 
			 * Prelevo il numero degli oggetti Web-Bug rilevati			 
			 **************************************************/
			var numWebBug=this.loadWebBug();
			this.setLabelValue("a5",numWebBug);
			
			/************************************************** 
			 * Prelevo il numero degli oggetti Flash-Cookie rilevati			 
			 **************************************************/
			//var numFlashCookie=this.loadFlashCookie();
			//this.setLabelValue("a6",numFlashCookie);
			
			/************************************************** 
			 * Prelevo il numero degli oggetti Third Web-Site rilevati			 
			 **************************************************/
			var numThirdWebSite=this.loadThirdWebSite();
			this.setLabelValue("a4",numThirdWebSite);
			
			/************************************************** 
			 * Prelevo il numero degli oggetti Third Image rilevati			 
			 **************************************************/
			var numThirdImage=this.loadThirdImage();
			this.setLabelValue("a7",numThirdImage);
			
			/************************************************** 
			 * Verifico se c'� information leakage ed in caso
			 * positivo salvo le info nell'array GLOBALE this.listCaptured
			 **************************************************/
			this.getLeakageInformation();
			
			/************************************************** 
			 * Cambio l'awarenessLabel in base al rilievo o meno
			 * di eventuali informazioni.
			 **************************************************/
			this.changeAwarenessLabel();
			
			/***************************************************
			 * Apre la lista degli oggetti
			 ***************************************************/
			this.openDialogAwareness();
		},
		
		refresh: function(){
			//svuto il contenuto degli alberi delle finestre
			var panelAwareness=document.getElementById("hiddenAwareness-group");
			if (panelAwareness.style.display=="block" || panelAwareness.style.display=="none"){
				panelAwareness.style.display="none";
				var element=document.getElementById("childreeenAwareness");
				while (element.firstChild) {
					element.removeChild(element.firstChild);
				}
			}	
			
			var panelInfoList=document.getElementById("notrace-hiddenInfo-group");
			if (panelInfoList.style.display=="block" || panelInfoList.style.display=="none"){
				panelInfoList.style.display="none";
				var element=document.getElementById("notrace-treechildren1");
				while (element.firstChild) {
					element.removeChild(element.firstChild);
				}
			}
			//Reinizializzo gli array
			this.cookieReqValue=new Array();
			this.cookieResValue=new Array();
			this.cookieThirdReqValue=new Array();
			this.cookieThirdResValue=new Array();
			this.cookieThirdReqDomain=new Array();
			this.cookieThirdResDomain=new Array();
			this.referer1=new Array();
			this.referer2=new Array();
			this.webBug1=new Array();
			this.webBug2=new Array();
			//this.flashcookie1=new Array();
			//this.flashcookie2=new Array();
			this.thirdWebSite1=new Array();
			this.thirdWebSite2=new Array();
			this.thirdImage1=new Array();
			this.thirdImage2=new Array();
			this.awarenessKeywords=new Array();
			this.listCaptured=new Array();
			this.allInfo=new Array();
			this.descriptionLoad=new Array();
			
			//risetto le dimensioni della finestra
			this.setWindowSize(465);
			//ricarico le informazioni aggiornate
			this.load();
		},
		/************************************************** 
		 * Salva tutte le info memorizzate nei 7 array[delle 7 funzioni]
		 * all'interno di un unico array e lo passa in input al metodo this.getKeywordsCaptured();
		 **************************************************/
		getLeakageInformation: function(){
		 /* console.log("cookieReqValue: "+this.cookieReqValue.length);
			console.log("cookieResValue: "+this.cookieResValue.length);
			console.log("cookieThirdReqValue: "+this.cookieThirdReqValue.length);
			console.log("cookieThirdResValue: "+this.cookieThirdResValue.length);
			console.log("referer2: "+this.referer2.length);
			console.log("webBug2: "+this.webBug2.length);
			console.log("flashcookie2: "+this.flashcookie2.length);
			console.log("thirdWebSite2: "+this.thirdWebSite2.length);
			console.log("thirdImage2: "+this.thirdImage2.length);  */	
			if(this.cookieReqValue.length!=null || this.cookieReqValue.length!=0){	
				for(var i=0; i<this.cookieReqValue.length; i++){
					this.allInfo.push(this.cookieReqValue[i]);
				}
			}
		
			if(this.cookieResValue.length!=null || this.cookieResValue.length!=0){	
				for(var i=0; i<this.cookieResValue.length; i++){
					this.allInfo.push(this.cookieResValue[i]);
				}
			}
		
			if(this.cookieThirdReqValue.length!=null || this.cookieThirdReqValue.length!=0){	
				for(var i=0; i<this.cookieThirdReqValue.length; i++){
					this.allInfo.push(this.cookieThirdReqValue[i]);
				}
			}	
		
			if(this.cookieThirdResValue.length!=null || this.cookieThirdResValue.length!=0){	
				for(var i=0; i<this.cookieThirdResValue.length; i++){
					this.allInfo.push(this.cookieThirdResValue[i]);
				}
			}
		
			if(this.referer2.length!=null || this.referer2.length!=0){	
				for(var i=0; i<this.referer2.length; i++){
					this.allInfo.push(this.referer2[i]);
				}
			}
		
			if(this.webBug2.length!=null || this.webBug2.length!=0){	
				for(var i=0; i<this.webBug2.length; i++){
					this.allInfo.push(this.webBug2[i]);
				}
			}
		
			/*if(this.flashcookie2.length!=null || this.flashcookie2.length!=0){	
				for(var i=0; i<this.flashcookie2.length; i++){
					this.allInfo.push(this.flashcookie2[i]);
				}
			}*/
		
			if(this.thirdWebSite2.length!=null || this.thirdWebSite2.length!=0){	
				for(var i=0; i<this.thirdWebSite2.length; i++){
					this.allInfo.push(this.thirdWebSite2[i]);
				}
			}
		
			if(this.thirdImage2.length!=null || this.thirdImage2.length!=0){	
				for(var i=0; i<this.thirdImage2.length; i++){
					this.allInfo.push(this.thirdImage2[i]);
				}
			}
			
			this.listCaptured=this.getKeywordsCaptured();
			
		},
		
		/********************************************************************
		 *	Funzione che verifica se all'interno dell'array allInfo, ci sono
		 *	eventuali informazioni personali matchandole con le keywords awarenessKeywords 
		 *  ed in caso positivo, memorizza tutte le info corrispondeti al match all'interno 
		 *	di un array "selectedMatch". Quest'ultimo verr� passato in input al metodo
		 *	this.getInformationByRivisit(), che eliminer� tutti i match di informazioni duplicate.
		 ********************************************************************/
		getKeywordsCaptured: function(){
			var arrayTemp=this.allInfo;
			var regex = new RegExp(this.awarenessKeywords,"gi");
			var arrayTemp2=new Array();
			var selectedMatch=new Array();
			
			if(arrayTemp!=null){
				for(var i=0;i<arrayTemp.length;i++){
					if(regex.test(arrayTemp[i])){
						arrayTemp2=arrayTemp[i].match(regex);
						for(var j=0;j<arrayTemp2.length;j++)
							selectedMatch.push(arrayTemp2[j]);
					}
					else
						continue;
				}
				//console.log("Dimensione match riscontrati: "+selectedMatch.length);
			}
			
			var list=this.getInformationLeakedByRivisit(selectedMatch);
			//this.stampaKeywordsCaptured(list);
			
			return list;
		},
		
		/************************************************************
		 *	Funzione che verifica se le informazioni catturate nell'array 
		 *	allInfo sono duplicate e in caso positivo le preleva
		 *	una sola volta.
		 ************************************************************/
		getInformationLeakedByRivisit: function(array){
			var tempArray=array;
			var prova=new Array();
			var split1,split2=null;
			
			if(tempArray!=null){
				for(var i=0;i<tempArray.length;i++){
					if(tempArray[i].indexOf("=")!=-1 && tempArray[i]!=""){
						split1=tempArray[i].split("=");
						
						for(var j=i+1;j<tempArray.length;j++){
							if(tempArray[j].indexOf("=")!=-1){
								split2=tempArray[j].split("=");

								if(split1[0]==split2[0] && split1[1]==split2[1])
									tempArray[j]="";
								
								if(/kage|age/gi.test(split1[0]) && /kage|age/gi.test(split2[0]))
									tempArray[j]="";
									
								if(/kgender|gender|gen/gi.test(split1[0]) && /kgender|gender|gen/gi.test(split2[0]))
									tempArray[j]="";
										
								//if(/kgender|gender|gen/gi.test(split1[0]) && /kgender|gender|gen/gi.test(split2[0]))
									//tempArray[j]="";
										
							}
						}
						prova.push(tempArray[i]);
					}
				}
			}
		return prova;
		},
				
		/********************************************************************
		 *	Funzione che stampa i dati matchati con le regex caricate 
		 *  tramite this.awarenessKeywords
		 ********************************************************************/
		stampaKeywordsCaptured: function(array){
			var temp1=array;
			
			/*console.log("Dimensione totale array: "+temp1.length);
			for(var i=0;i<temp1.length;i++)
				console.log(temp1[i]);
			*/
		},
		
		/************************************************** 
		 * Funzione che setta le dimensioni della finestra
		 * in presenza/assenza di tabella info.
		 **************************************************/
		setTreeSize: function(){
			var w = screen.width;
			var h = screen.height;
			var tree = document.getElementById("notrace-historytree");
			var box = document.getElementById("notrace-hiddenInfo-group");
			tree.setAttribute("width",w);
			box.setAttribute("width",w);
		},
		
		setPanelAfterReset: function(){
			var panelAwareness=document.getElementById("hiddenAwareness-group");
			if (panelAwareness.style.display=="block"){
				panelAwareness.style.display="none";
				var element=document.getElementById("childreeenAwareness");
				while (element.firstChild) {
					element.removeChild(element.firstChild);
				}
			}
			else
				this.setTreeSize();
				
			var panelInfoList=document.getElementById("notrace-hiddenInfo-group");
			if (panelInfoList.style.display=="block"){
				panelInfoList.style.display="none";
				var element=document.getElementById("childreeenAwareness");
				while (element.firstChild) {
					element.removeChild(element.firstChild);
				}
			}
			else
				this.setTreeSize();
				
			this.setWindowSize(465);
		},
		
		/************************************************** 
		 * Funzione che cancella la tabella resources 
		 * del database(la history in pratica),RISETTA A 0 o NULL 
		 * i parametri[numero oggetti e array] esistenti, e richiude
		 * eventualmente il pannello della tabella se aperto.
		 **************************************************/
		deleteDB: function(){
			var conf = this.promptService.confirm(null,this.common.getLocalizedMessage("titlealert.label"),this.common.getLocalizedMessage("resetdb.label"));
			if(conf){
				/*******************************
				 *	Cancello interamente la tabella 
				 *	resources di notrace.sqlite
				 *******************************/
				isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.eraseDB();
					
				/*******************************
				 *	Azzero tutti gli array contenenti i dati
				 *******************************/
				 //Reinizializzo gli array
				this.cookieReqValue=new Array();
				this.cookieResValue=new Array();
				this.cookieThirdReqValue=new Array();
				this.cookieThirdResValue=new Array();
				this.cookieThirdReqDomain=new Array();
				this.cookieThirdResDomain=new Array();
				this.referer1=new Array();
				this.referer2=new Array();
				this.webBug1=new Array();
				this.webBug2=new Array();
				//this.flashcookie1=new Array();
				//this.flashcookie2=new Array();
				this.thirdWebSite1=new Array();
				this.thirdWebSite2=new Array();
				this.thirdImage1=new Array();
				this.thirdImage2=new Array();
				this.awarenessKeywords=new Array();
				this.listCaptured=new Array();
				this.allInfo=new Array();
				this.descriptionLoad=new Array();
				
				/*******************************
				 *	Richiudo il pannello di visualizzazione
				 *******************************/
				this.setPanelAfterReset();
				
				/*******************************
				 *	Cambio la faccina e le scritte su AwarenessLabel
				 *******************************/
				this.changeAwarenessLabel();
				
				/*******************************
				 *	Setto a 0 il numero di oggetti ritrovati
				 *******************************/
				this.setLabelValue("a1","0");
				this.setLabelValue("a2","0");
				this.setLabelValue("a3","0");
				this.setLabelValue("a4","0");
				this.setLabelValue("a5","0");
				//this.setLabelValue("a6","0");
				this.setLabelValue("a7","0");
			}
		},
		
		
		/***************************************************
		 *	Funzione,invocata all'interno di listOverlay.xul,
		 *	che al doppio click del mouse su un elemento della 
		 *	tabella di informazioni,permette l'apertura
		 * 	di una nuova finestra di visualizzazione dettagli
		 *	per elemento selezionato dalla tabella.
		 ****************************************************/
		dettagli: function(){
			var tree = document.getElementById("notrace-historytree");
			var treeview = tree.view;
			var index = treeview.selection.currentIndex;
			var col = tree.columns.getColumnAt(1);
			var coltxt = treeview.getCellText(index,col);
			if(coltxt!=""){
				window.open("chrome://notrace/content/leaksdettagli.xul","","chrome");
			}
		},
	
		/*************************************************
		 *	Funzione che effettua la sostituzione
		 *	di determinati caratteri presenti nel testo.
		 *************************************************/
		escape: function(str) {
		
			var listCaptured=str;
		
			/*if (!isNaN(parseInt(str)))
				return str;
			*/
			//elimino carattere ; se presente
			if(listCaptured.indexOf(";") != -1)
				listCaptured=listCaptured.replace(new RegExp(";", 'g'),"");
			
			//elimino il caratteri & se presente
			if(listCaptured.indexOf("&") != -1)
				listCaptured=listCaptured.replace(new RegExp("&", 'g'),"");
			
			//elimino carattere / se presente
			if(listCaptured.indexOf("/") != -1)
				listCaptured=listCaptured.replace(new RegExp("/", 'g'),"");
					
			//elimino carattere %40 se presente
			if(listCaptured.indexOf("%40") != -1)
				listCaptured=listCaptured.replace(new RegExp("%40", 'g'),"@");
					
			//elimino carattere %3 se presente
			if(listCaptured.indexOf("%2C") != -1)
				listCaptured=listCaptured.replace(new RegExp("%2C", 'g'),",");
		
			//elimino carattere %20 se presente
			if(listCaptured.indexOf("%20") != -1)
				listCaptured=listCaptured.replace(new RegExp("%20", 'g')," ");
                
			//elimino carattere %2B se presente
            if(listCaptured.indexOf("%2B") != -1)
                listCaptured=listCaptured.replace(new RegExp("%2B", 'g')," ");
			
			//elimino carattere %3A se presente
			if(listCaptured.indexOf("%3A") != -1)
				listCaptured=listCaptured.replace(new RegExp("%3A", 'g'),":");
			
			//elimino carattere %3D se presente
            if(listCaptured.indexOf("%3D") != -1)
                listCaptured=listCaptured.replace(new RegExp("%3D", 'g'),"=");
            
			//elimino carattere %27 se presente
			if(listCaptured.indexOf("%27") != -1){
				//console.log("1� "+listCaptured);
				listCaptured=listCaptured.replace(new RegExp("%27", 'g'),"'");
			}
			
			//elimino carattere %2F se presente
			if(listCaptured.indexOf("%2F") != -1)
				listCaptured=listCaptured.replace(new RegExp("%2F", 'g'),"/");
			
			//elimino carattere %7C se presente
			if(listCaptured.indexOf("%7C") != -1)
				listCaptured=listCaptured.replace(new RegExp("%7C", 'g'),"|");
	
			//elimino carattere %C3 se presente
			if(listCaptured.indexOf("%C3") != -1){
				//console.log("2� "+listCaptured);
				listCaptured=listCaptured.replace(new RegExp("%C3", 'g'),"�");
			}
			
			//elimino carattere %3F se presente
			if(listCaptured.indexOf("%3F") != -1)
				listCaptured=listCaptured.replace(new RegExp("%3F", 'g'),"?");
			
			//elimino carattere %C3 se presente
			if(listCaptured.indexOf("%C3") != -1)
				listCaptured=listCaptured.replace(new RegExp("%C3", 'g'),"�");
			
			//elimino carattere %B9 se presente
			if(listCaptured.indexOf("%B9") != -1)
				listCaptured=listCaptured.replace(new RegExp("%B9", 'g'),"");
		
			
			return listCaptured;
		}
	}
};
