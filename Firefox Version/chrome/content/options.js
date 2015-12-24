Components.utils.import("resource://notrace/common.js");
Components.utils.import("resource://notrace/isisNoTraceSharedObjects.js");
Components.utils.import("resource://notrace/isisLogWrapper.js");


if ("undefined" == typeof(isisNoTrace)) { 
	
	Components.utils.import("resource://gre/modules/NetUtil.jsm");
	Components.utils.import("resource://gre/modules/AddonManager.jsm");
	var isisNoTrace = {
		//prefs: null,
		monthInMils: 2592000000, // 1000 * 60 *60 * 24 * 30 //600000; 
		// week in millisec 604800000 = 1000 * 60 * 60 * 24 * 7
		twoWeeksInMils: 1296000000, //300000;
		// day in millisec 86400000 = 1000 * 60 * 60 * 24
		dayInMils: 86400000, //21428;
		month: ["January","February","March","April","may","June","July","August","September","October","November","December"],
		cbnocookie: null,
		cbno3cookie: null,
		cbnojscookie: null,
		cbnometacookie: null,
		cbnojs: null,
		cbno3js: null,
		cbnonoscript: null,
		cbnoimg: null,
		//cbno3pe: null,
		cbno3img: null,
		cbnowebbug: null,
		cbno3objnoid: null,
		//cbnotop: null,
		cbnometaredirectandcookie: null,
		cbnoidheader: null,
		cbnoad: null,
		cbnoflashcookie: null,
		cbnohtml5storage: null,
		cbno3hiddenobj: null,
		cbnofingerprinting: null,
		perc: 0,
		cbdis: null,
		obspersonal: null,
		obstracking: null,
		obsannoying: null,
		countnonoscript: 0,
		countnometacookie: 0,
		countnometaredirectandcookie: 0,
		countnojscookie: 0,
		countnojs: 0,
		countnoimg: 0,
		countno3cookie: 0,
		countno3img: 0,
		countno3js: 0,
		//countno3obj: 0,
		countno3objnoid: 0,
		countnoad: 0,
		countnocookie: 0,
		countnoidheader: 0,
		//countnotop: 0,
		countnowebbug: 0,
		countnoflashcookie: 0,
		countno3hiddenobj: 0,
		countnofingerprinting: 0,
		globalscore: 0,
		globalscoreb: 0,
		os: null,
		numres: 0,
		myTimer: null,
		timer_bol: true,
		observedPref: null,
		jsonToSend: null,
		scriptlist:  {
			selectStatement: null,
			insertStatement: null,
			checkStatement: null,
			removeStatement: null,
			arrayOfScriptElements: null,
			initDB: function(){
				this.refreshList();
			},	
			initscriptlist: function(){
				isisNoTraceShare.isisNoTraceSharedObjects.scriptlist.initDB();
				var list=isisNoTraceShare.isisNoTraceSharedObjects.scriptlist.getList();
				var treechildren = document.getElementById("nt-scriptlist-children");
				for (var key in list ){
					var domain = list[key];
					var treecell = document.createElement("treecell");
					treecell.setAttribute("label",domain);
				
					var treerow = document.createElement("treerow");
					treerow.appendChild(treecell);
					
					var treeitem = document.createElement("treeitem");
					treeitem.setAttribute("id",domain);
					treeitem.appendChild(treerow);
					treechildren.appendChild(treeitem);
				}
			},
			refreshList: function(){
				this.arrayOfScriptElements = [];
				var file = Components.classes["@mozilla.org/file/directory_service;1"]
					.getService(Components.interfaces.nsIProperties)
					.get("ProfD", Components.interfaces.nsIFile);
				file.append("notracedb");
				file.append("scriptlist.txt");
				if(file.exists() && file.isFile()){
					this.arrayOfScriptElements=isisNoTraceShare.isisNoTraceSharedObjects.getListFromFile(file);
				}
			},
			getList: function(){
				return this.arrayOfScriptElements;
			},
			add: function(){
				var newitem = document.getElementById("newitem").value;
				var sp = newitem.split(".");
				if(sp.length == 2){
					if (!this.checkScriptPresence(newitem)) {
						this.arrayOfScriptElements.push(newitem);
						this.saveToFile(this.arrayOfScriptElements, "scriptlist.txt");
						var treechildren = document.getElementById("nt-scriptlist-children");
						var treecell = document.createElement("treecell");
						treecell.setAttribute("label",newitem);

						var treerow = document.createElement("treerow");
						treerow.appendChild(treecell);
						
						var treeitem = document.createElement("treeitem");
						treeitem.setAttribute("id",newitem);
						treeitem.appendChild(treerow);
						treechildren.appendChild(treeitem);
						sp=null;
						return true;
					}
					else{
						isisNoTraceShare.isisNoTraceSharedObjects.alertsService.showAlertNotification("chrome://notrace/content/imgs/info_24.png", "INFO", isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("scriptalreadyexist.label"), false, "", null, "");
					}
				}
				else{
					isisNoTraceShare.isisNoTraceSharedObjects.alertsService.showAlertNotification("chrome://notrace/content/imgs/info_24.png", "INFO", isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("notascript.label"), false, "", null, "");
				}
			}
		},
		optlist: {
			cont: null,
			tot: null,
			initoptlist: function(){
				var check;
				var arrayFam=["googleFam","aolFam","yahooFam","microsoftFam","valueclickFam","akamaiFam","omnitureFam","otherFam"];
				var arrayName=["namegoogle","nameaol","nameyahoo","namemicrosoft","namevalueclick","nameakamai","nameomniture","nameother"];
				var arrayChild=["google","aol","yahoo","microsoft","valueclick","akamai","omniture","other"];
				var optTotal=0;
				var optActived=0;
				var optDisabled=0;
				for(var i=0;i<8;i++){
					var cont=0;
					var verif=0;
					var child=""+arrayChild[i];
					var nomeDom=""+arrayName[i];
					var fam=""+arrayFam[i];
					var sent=true;
					var treechildren = document.getElementById(child);
					// child is the AdCompany family
					var obj=isisNoTraceShare.isisNoTraceSharedObjects.optOutObject.OptOut.sites;
					// array is the list of site to check later
					var array=isisNoTraceShare.isisNoTraceSharedObjects.optOutObject.OptOut.families[child];
					for (var domain in array){
						// domain is the name of the site
						var st;
						for (var p in array[domain]){
							st=array[domain][p];
						}
						var family = child;
						var domOpt="";
						verif=0;
						c=0;
						// each site can have multiple domains, for each domain
						for (domOpt in obj[domain]){
							var array=obj[domain][domOpt];
							// check the array of cookie to set for the domain
							for (var key in array) {
								var pathOpt = array[key].path;
								var nameOpt = array[key].name;
								var valueOpt = array[key].value;
								var cookieMgr = Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager);
								c++;	
								for(var e = cookieMgr.enumerator; e.hasMoreElements();) {
									var cookie = e.getNext().QueryInterface(Components.interfaces.nsICookie);
									if(cookie.host==domOpt && cookie.name==nameOpt && cookie.value==valueOpt) 
										verif++;								
								}
							}
						}
						if(verif!=c){
							st="false";
							optDisabled++;
							sent=false;
						}
						else{
							st="true";
							optActived++;
						}
						optTotal++;					
						var treecell = document.createElement("treecell");
						treecell.setAttribute("label",domain);
						treecell.setAttribute("id",nomeDom+cont);
						
						var stato = document.createElement("treecell");
						stato.setAttribute("value",st);
						stato.setAttribute("id",child+cont);
						
						stato.setAttribute("label",child+cont);
					
						var treerow = document.createElement("treerow");
						treerow.appendChild(treecell);
						treerow.appendChild(stato);
						
						var treeitem = document.createElement("treeitem");
						
						treeitem.appendChild(treerow);
						treechildren.appendChild(treeitem);
						cont++;
						if(sent)
							document.getElementById(fam).setAttribute("value","true");
						else
							document.getElementById(fam).setAttribute("value","false");		
					}
				}		
				var optTot = document.getElementById("optTot");
				var optAtt = document.getElementById("optAtt");
				optTot.value=optTotal;
				optAtt.value=optActived;
				//document.getElementById('a130').setAttribute('value',optActived);
			},
			onoffoptlist: function(sce,cont){
				if(sce=="on"){
					if(cont=="1"){
						var scelta = confirm(isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("selectall.label"));
					}
					else
						scelta=true;
					if(scelta){
						var obj=isisNoTraceShare.isisNoTraceSharedObjects.optOutObject.OptOut.sites;
						var site="";
						// check each site
						for (site in obj) {
							var domOpt="";
							// each site can have multiple domains, for each domain
							for (domOpt in obj[site]){
								var array=obj[site][domOpt];
								// check the array of cookie to set for the domain
								for (var key in array) {
									var pathOpt = array[key].path;
									var nameOpt = array[key].name;
									var valueOpt = array[key].value;
									var newDomOpt=domOpt;
									if(newDomOpt.charAt(0)==".")
										var string=""+nameOpt+"="+valueOpt+";domain="+newDomOpt+";path="+pathOpt+";expires=Thu, 3 Jan 2087 14:55 GMT;";
									else
										var string=""+nameOpt+"="+valueOpt+";path="+pathOpt+";expires=Thu, 3 Jan 2087 14:55 GMT;";
									var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
									var cookieSvc = Components.classes["@mozilla.org/cookieService;1"].getService(Components.interfaces.nsICookieService);
									if(newDomOpt.charAt(0)==".")
										newDomOpt=newDomOpt.substring(1);
									var cookieUri = ios.newURI("http://"+newDomOpt, null, null);
									cookieSvc.setCookieString(cookieUri, null,string, null);	
								}
							}
						}
						var arrayFam=["googleFam","aolFam","yahooFam","microsoftFam","valueclickFam","akamaiFam","omnitureFam","otherFam"];
						var arrayName=["namegoogle","nameaol","nameyahoo","namemicrosoft","namevalueclick","nameakamai","nameomniture","nameother"];
						var arrayChild=["google","aol","yahoo","microsoft","valueclick","akamai","omniture","other"];
						var tot=0;
						for(var i=0;i<8;i++){
							var child=""+arrayChild[i];
							var nomeDom=""+arrayName[i];
							var fam=""+arrayFam[i];
							var check;
							var j=0;
							while((check = document.getElementById(child+""+j))!=null){
								check.setAttribute("value","true");	
								j++;
								tot++;
							}
							document.getElementById(fam).setAttribute("value","true");				
						}
						var optTot = document.getElementById("optTot");
						var optAtt = document.getElementById("optAtt");
						optTot.value=tot;
						optAtt.value=tot;
						//document.getElementById('a130').setAttribute('value',tot);
					}
				}
				else{
					if(cont=="1"){
						var scelta = confirm(isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("selectnoone.label"));
					}
					else
						scelta=true;
					if(scelta){
						var obj=isisNoTraceShare.isisNoTraceSharedObjects.optOutObject.OptOut.sites;
						var site="";
						// check each site
						for (site in obj) {
							var domOpt="";
							// each site can have multiple domains, for each domain
							for (domOpt in obj[site]){
								var array=obj[site][domOpt];
								// check the array of cookie to set for the domain
								for (var key in array) {
									var pathOpt = array[key].path;
									var nameOpt = array[key].name;
									var valueOpt = array[key].value;
									var cmgr = Components.classes["@mozilla.org/cookiemanager;1"].getService();
									cmgr = cmgr.QueryInterface(Components.interfaces.nsICookieManager);
									cmgr.remove(domOpt,nameOpt,pathOpt,false);			
								}
							}
						}
						var arrayFam=["googleFam","aolFam","yahooFam","microsoftFam","valueclickFam","akamaiFam","omnitureFam","otherFam"];
						var arrayName=["namegoogle","nameaol","nameyahoo","namemicrosoft","namevalueclick","nameakamai","nameomniture","nameother"];
						var arrayChild=["google","aol","yahoo","microsoft","valueclick","akamai","omniture","other"];
						var tot=0;
						for(var i=0;i<8;i++){
							var child=""+arrayChild[i];
							var nomeDom=""+arrayName[i];
							var fam=""+arrayFam[i];
							var check;
							var j=0;
							while((check = document.getElementById(child+""+j))!=null){
								check.setAttribute("value","false");
								j++;
								tot++;
							}
							document.getElementById(fam).setAttribute("value","false");
						}
						var optTot = document.getElementById("optTot");
						var optAtt = document.getElementById("optAtt");
						optTot.value=tot;
						optAtt.value=0;
						//document.getElementById('a130').setAttribute('value',0);
					}
				}
			},
			modifyoptlist: function(event){
				var tree = document.getElementById("tree-optout");
				var tbo = tree.treeBoxObject;
				var row = { }, col = { }, child = { };
				tbo.getCellAt(event.clientX, event.clientY, row, col, child);
				var cellText = tree.view.getCellText(row.value, col.value);
				var arrayFam=["googleFam","aolFam","yahooFam","microsoftFam","valueclickFam","akamaiFam","omnitureFam","otherFam"];
				var arrayChild=["google","aol","yahoo","microsoft","valueclick","akamai","omniture","other"];	
				var sent=0;
				var optAtt = document.getElementById("optAtt");
				var atti=optAtt.value;
				var disa=114-atti;
				var att = atti;
				var dis = disa;
				for(var i=0;i<8;i++){		
					if(cellText==arrayFam[i]){
						sent=1;
						var valCheck=document.getElementById(cellText).getAttribute("value");
						var check;
						var childFam=arrayChild[i];
						// childFarm is the family and i iterate on the site name
						var j=0;
						// child is the AdCompany family
						var sites=isisNoTraceShare.isisNoTraceSharedObjects.optOutObject.OptOut.sites;
						// array is the list of site to check later
						var array=isisNoTraceShare.isisNoTraceSharedObjects.optOutObject.OptOut.families[childFam];
						for (var site in array){
							// site is the name of the site, use this to get the domains
							if(valCheck=="true"){
								check = document.getElementById(childFam+j);			
								if(check.getAttribute("value")=="false"){
									for (domOpt in sites[site]){
										var array=sites[site][domOpt];
										// check the array of cookie to set for the domain
										for (var key in array) {
											var pathOpt = array[key].path;
											var nameOpt = array[key].name;
											var valueOpt = array[key].value;
											var newDomOpt=domOpt;
											if(newDomOpt.charAt(0)==".")
												var string=""+nameOpt+"="+valueOpt+";domain="+newDomOpt+";path="+pathOpt+";expires=Thu, 3 Jan 2087 14:55 GMT;";
											else
												var string=""+nameOpt+"="+valueOpt+";path="+pathOpt+";expires=Thu, 3 Jan 2087 14:55 GMT;";
											
											var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
											var cookieSvc = Components.classes["@mozilla.org/cookieService;1"].getService(Components.interfaces.nsICookieService);
											if(newDomOpt.charAt(0)==".")
												newDomOpt=newDomOpt.substring(1);
											var cookieUri = ios.newURI("http://"+newDomOpt, null, null);
											cookieSvc.setCookieString(cookieUri, null,string, null);
										}
									}
									check.setAttribute("value","true");		
									att++;
									dis--;
								}			
								j++;	
							}
							else{
								check = document.getElementById(childFam+j);		
								if(check.getAttribute("value")=="true"){
									for (domOpt in sites[site]){
										var array=sites[site][domOpt];
										// check the array of cookie to set for the domain
										for (var key in array) {
											var pathOpt = array[key].path;
											var nameOpt = array[key].name;
											var valueOpt = array[key].value;
											var cmgr = Components.classes["@mozilla.org/cookiemanager;1"].getService();
											cmgr = cmgr.QueryInterface(Components.interfaces.nsICookieManager);
											cmgr.remove(domOpt,nameOpt,pathOpt,false);
										}
									}
									check.setAttribute("value","false");
									dis++;
									att--;
								}							
								j++;										
							}
						}
						optAtt.value=att;
						isisNoTraceShare.isisNoTraceSharedObjects.prefs.setIntPref("optActived",att);
						//document.getElementById('a130').setAttribute('value',att);
					}
				}
				var labelDomain="name"+cellText;	
				var labelValue=null;
				if (document.getElementById(labelDomain))
					labelValue=document.getElementById(labelDomain).getAttribute("label");
				if(sent==0 && labelValue!=null){
					//labelValue is the site name
					var check = document.getElementById(cellText);
					var sites=isisNoTraceShare.isisNoTraceSharedObjects.optOutObject.OptOut.sites;
					if(check.getAttribute("value")=="true"){
						for (domOpt in sites[labelValue]){
							var array=sites[labelValue][domOpt];
							// check the array of cookie to set for the domain
							for (var key in array) {
								var newDomOpt=domOpt;
								var pathOpt = array[key].path;
								var nameOpt = array[key].name;
								var valueOpt = array[key].value;
								if(newDomOpt.charAt(0)==".")
									var string=""+nameOpt+"="+valueOpt+";domain="+newDomOpt+";path="+pathOpt+";expires=Thu, 3 Jan 2087 14:55 GMT;";
								else
									var string=""+nameOpt+"="+valueOpt+";path="+pathOpt+";expires=Thu, 3 Jan 2087 14:55 GMT;";
								var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
								var cookieSvc = Components.classes["@mozilla.org/cookieService;1"].getService(Components.interfaces.nsICookieService);
								if(newDomOpt.charAt(0)==".")
									newDomOpt=newDomOpt.substring(1);
								var cookieUri  = ios.newURI("http://"+newDomOpt, null, null);
								cookieSvc.setCookieString(cookieUri,null,string, null);		
							}
						}
						att++;
						dis--;						
					}
					else{
						for (domOpt in sites[labelValue]){
							var array=sites[labelValue][domOpt];
							// check the array of cookie to set for the domain
							for (var key in array) {
								var pathOpt = array[key].path;
								var nameOpt = array[key].name;
								var valueOpt = array[key].value;
								var cmgr = Components.classes["@mozilla.org/cookiemanager;1"].getService();
								cmgr = cmgr.QueryInterface(Components.interfaces.nsICookieManager);
								cmgr.remove(domOpt,nameOpt,pathOpt,false);
							}
						}
						dis++;
						att--;
					}
					optAtt.value=att;
				}
				this.verCheckFam();
			},
			verCheckFam:function(){
				var check;
				var arrayFam=["googleFam","aolFam","yahooFam","microsoftFam","valueclickFam","akamaiFam","omnitureFam","otherFam"];
				var arrayName=["namegoogle","nameaol","nameyahoo","namemicrosoft","namevalueclick","nameakamai","nameomniture","nameother"];
				var arrayChild=["google","aol","yahoo","microsoft","valueclick","akamai","omniture","other"];
					
				for(var i=0;i<8;i++){
					var child=""+arrayChild[i];
					var nomeDom=""+arrayName[i];
					var fam=""+arrayFam[i];
					var check;
					var j=0;
					var sent=true;
					while((check = document.getElementById(child+""+j))!=null){
						var checked=check.getAttribute("value");	
						if(checked=="false")
							sent=false;
							j++;
						}
					if(sent)
						document.getElementById(fam).setAttribute("value","true");	
					else
						document.getElementById(fam).setAttribute("value","false");
				}	
			},
			onCloseOptOutWindow: function() {
				countOptOnclose();		
			}
		},
		adlist: {	
			loadAdList:function(){
				var file = this.loadFile("Select a File", Components.interfaces.nsIFilePicker.modeOpen);
				if(file.leafName=="adList.txt")
					this.copyFileScript(file);
				else
					isisNoTraceShare.isisNoTraceSharedObjects.alertsService.showAlertNotification("chrome://notrace/content/imgs/info_24.png", "INFO", isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("adlistwrongfile.label"), false, "", null, "");
			},
			loadFile:function(title, mode){
				var nsIFilePicker = Components.interfaces.nsIFilePicker;
				var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
				fp.init(window, title, mode);
				fp.appendFilters(nsIFilePicker.filterText);
				var res = fp.show();
				if (res == nsIFilePicker.returnOK || nsIFilePicker.returnReplace){
					return fp.file;      
				}
				else{
					return null;
				}
			},
			copyFileScript:function(file){
				if(file != null){
					var parentDir= Components.classes["@mozilla.org/file/directory_service;1"]
						.getService(Components.interfaces.nsIProperties)
						.get("ProfD", Components.interfaces.nsIFile);
					parentDir.append("notracedb");
					var appData = Components.classes["@mozilla.org/file/directory_service;1"]
						.getService(Components.interfaces.nsIProperties)
						.get("ProfD", Components.interfaces.nsIFile);
					appData.append("notracedb");
					appData.append("adList.txt");
					var delFilePath = appData.path;
					var delFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
					delFile.initWithPath(delFilePath);
					if(delFile.exists())
						delFile.remove(true);		
					var aFilePath = appData.path;
					var aFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
					aFile.initWithPath(parentDir.path);						
					file.copyTo(aFile,"adList.txt");   
					isisNoTraceShare.isisNoTraceSharedObjects.alertsService.showAlertNotification("chrome://notrace/content/imgs/info_24.png", "INFO", isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("updatesuccess.label"), false, "", null, "");
					var element = document.getElementById("adlist-children");
					while (element.firstChild) {
						element.removeChild(element.firstChild);
					}
					this.adListTree();
				}
				return true;
			},
			AddToPersonalAdList: function (){
				var regexp=document.getElementById("notrace-customregexp");
				var temp=regexp.value;
				if (temp!="") {
					regexp.value="";	
					isisNoTraceShare.isisNoTraceSharedObjects.adlist.addToPersonalList(temp);
					this.adListTree();
				}
				else {
					isisNoTraceShare.isisNoTraceSharedObjects.alertsService.showAlertNotification("chrome://notrace/content/imgs/info_24.png", "WARNING", isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("regexpnotvalid.label"), false, "", null, "");
				}
			},
			clearTree: function() {
				var tree = document.getElementById("noadlist");
				var treechildren = document.getElementById("adlist-children");
				tree.removeChild(treechildren);
				treechildren = document.createElement("treechildren");
				treechildren.setAttribute("id","adlist-children");
				tree.appendChild(treechildren);
			},
			deleteSingleElement: function(tree) {
				var treeview = tree.view;
				var index = treeview.selection.currentIndex;
				isisNoTraceShare.isisNoTraceSharedObjects.adlist.deleteFromPersonalList(index);
				var colLoc = tree.columns.getColumnAt(0);

				var loctxt = treeview.getCellText(index,colLoc);
					
				var tree = document.getElementById("noadlist");
				/*var treechildren=element.parentNode;
				treechildren.removeChild(element);
				if (treechildren.firstChild==null) {
					var treeitem=treechildren.parentNode;
					treeitem.removeChild(treechildren);
					var new_treechildren=treeitem.parentNode;
					new_treechildren.removeChild(treeitem);
				}*/
				this.adListTree();
			},
			removeFromPersonalAdList: function() {
				this.deleteSingleElement(document.getElementById("noadlist"));
			},
			adListTree:function(){
				var chb=document.getElementById("chb_AdListFeddback");
				var feedbackPref=isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("AdListfeedback");
				chb.checked=feedbackPref;
				var file = Components.classes["@mozilla.org/file/directory_service;1"]
					.getService(Components.interfaces.nsIProperties)
					.get("ProfD", Components.interfaces.nsIFile);
				file.append("notracedb");
				file.append("Personal_adList.txt");
				var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream); 	
				istream.init(file, 0x01, 0444, 0);
				istream.QueryInterface(Components.interfaces.nsILineInputStream);
				var line = {}, lines = [], hasmore;
				/**
				Should delete all the elements from the tree
				*/
				this.clearTree();
				var treechildren = document.getElementById("adlist-children");
				do { 
					hasmore = istream.readLine(line);
					lines.push(line.value);			
					var adValue = line.value;
					
					var treecell = document.createElement("treecell");
					treecell.setAttribute("label",adValue);

					var treerow = document.createElement("treerow");
					treerow.appendChild(treecell);
					
					var treeitem = document.createElement("treeitem");
					treeitem.setAttribute("id",adValue);

					treeitem.appendChild(treerow);
					treechildren.appendChild(treeitem);
				} while(hasmore); 
				istream.close();		
			}	
		},
		os_adjustment: function() {
			this.os= navigator.userAgent;
			if (this.os.indexOf("Mac") != -1){
				document.getElementById("mainTabID").style.height="550px";
				document.getElementById("panepersonal1").style.height="550px";
				document.getElementById("whitelistTabPanel").style.height="550px";
				document.getElementById("shareTabID").style.height="550px";
				document.getElementById("helpLegendID").style.height="550px";
				document.getElementById("nt-aboutPage").style.width="630px";
				document.getElementById("hbox_to_modify").style.width="630px";
				document.getElementById("helpLegendID").style.height="550px";
			}
			else {
				document.getElementById("tab1").setAttribute("image","imgs/user.png");
				document.getElementById("tab2").setAttribute("image","imgs/behav.png");
				document.getElementById("tab3").setAttribute("image","imgs/noad.png");
			}
		},
		initLocalStorageDBConnection: function() {
			if (this.dbconn_local_storage==null) {
				var file = Components.classes["@mozilla.org/file/directory_service;1"]
					.getService(Components.interfaces.nsIProperties)
					.get("ProfD", Components.interfaces.nsIFile);
				file.append("webappsstore.sqlite");
				var storageService = Components.classes["@mozilla.org/storage/service;1"].getService(Components.interfaces.mozIStorageService);
				this.dbconn_local_storage = storageService.openDatabase(file);
			}
			return this.dbconn_local_storage;
		},
		aggiornapref: function(){
			var cbs = document.getElementsByTagName("checkbox");
			var cbslen = cbs.length;
			for(var i=0;i<cbslen;i++){
				var curcb = cbs[i];
				var checked = curcb.checked;
				var lab = curcb.getAttribute("preference");
				if( lab.indexOf(" ") == -1 ){
					if(checked){
						isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique."+lab,true);
					}
					else{
						isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique."+lab,false);
					}
				}
			}
			var anonymous=document.getElementById("type0");
			var chb=document.getElementById("chb_feedback");
			isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("feedbacktype",anonymous.selected);
			isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("feedback",chb.checked);
			var chbAdListFeddback=document.getElementById("chb_AdListFeddback");
			isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("AdListfeedback",chbAdListFeddback.checked);
			isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("addonbarbutton", document.getElementById("cbaddonbarbutton"));
			//this.score.start();  
		},
		disablefun: function(curcb){
			var id = curcb.getAttribute("id");
			if(id=="cbnohtml5storage"){
				if(!this.obstracking){
					if(this.os=="win"){
						document.getElementById("cbnohtml5storage").checked = false;
					}
					else{
						isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.nohtml5storage",false);
					}
				}
				var par = curcb.parentNode;
				par.style.display = "";
				var ch = document.getElementById("nohtml5storagerow");
				ch.style.display = "";
				return;
			}
			if(id=="cbno3cookie") {
				if(!this.obstracking) {
					if(this.os=="win") {
						document.getElementById("cbno3cookie").checked = false;
					}
					else{
						isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.no3cookie",false);
					}
				}
				var par = curcb.parentNode;
				par.style.display = "";
				return;
			}
			if(id=="cbnoflashcookie"){
				if(!this.obstracking){
					if(this.os=="win"){
						document.getElementById("cbnoflashcookie").checked = false;
					}
					else{
						isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.noflashcookie",false);
					}
				}
				var par = curcb.parentNode;
				par.style.display = "";
				var ch = document.getElementById("noflashrow");
				ch.style.display = "";
				return;
			}
			if(id=="cbno3hiddenobj"){
				if(!this.obstracking){
					if(this.os=="win"){
						document.getElementById("cbno3hiddenobj").checked = false;
					}
					else
						isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.no3hiddenobj",false);
				}
				var par = curcb.parentNode;
				par.style.display = "";
				var ch = document.getElementById("no3hiddenobjrow");
				ch.style.display = "";
				return;
			}
			if(id=="cbno3js"){
				if(!this.obstracking){
					if(this.os=="win"){
						document.getElementById("cbno3js").checked = false;
						document.getElementById("cb3hiddenobj").disabled=false;//antonio hidden
						document.getElementById("cb3hiddenobj").checked=false;	
					}
					else{
						isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.no3js",false);
						isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.no33hiddenobj",false);
					}
				}
				var par = curcb.parentNode;
				par.style.display = "";
				return;
			}
			if(id=="cbno3img"){
				if(!this.obstracking){
					if(this.os=="win"){
						document.getElementById("cbno3img").checked = false;
					}
					else
						isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.no3img",false);
				}
				var par = curcb.parentNode;
				par.style.display = "";
				return;
			}
			if(id=="cbnowebbug"){
				if(!this.obstracking){
					if(this.os=="win"){
						document.getElementById("cbnowebbug").checked = false;
					}
					else
						isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.nowebbug",false);
				}
				if(!prefs.getBoolPref("technique.no3img")){
					var par = curcb.parentNode;
					par.style.display = "";
				}
				return;
			}
			var lab = curcb.getAttribute("preference");
			if(this.os=="win")
				document.getElementById(id).checked = false;
			else
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique."+lab,false);
		},
		selectPane: function(cbid){
			var paneid;	
			if(cbid=="cb1") paneid = "panepersonal1";
			if(cbid=="cb2") paneid = "panetracking";
			if(cbid=="cb3") paneid = "paneannoying";
			var pane = document.getElementById(paneid);
			var cb = document.getElementById(cbid);
			
			var sel = cb.checked;
			var cbs = pane.getElementsByTagName("checkbox");
			var cbslen = cbs.length;

			if(sel==false){
				for(var i=0;i<cbslen;i++){
					var curcb = cbs[i];
					curcb.setAttribute("disabled","true");
				}
			}
			else{
				for(var i=0;i<cbslen;i++){
					var curcb = cbs[i];
					try{curcb.removeAttribute("disabled");}catch(ex){}
				}
			}
		},
		disNotrace: function(){
			if(!document.getElementById('dis').checked){
				document.getElementById('cb1').checked=false;
				document.getElementById('cb1').disabled=true;
				document.getElementById('cb2').checked=false;
				document.getElementById('cb2').disabled=true;
				document.getElementById('cb3').checked=false;
				document.getElementById('cb3').disabled=true;	
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.personal",false);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.tracking",false);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.annoying",false);	
				this.selectPaneb('cb1');
				this.selectPaneb('cb2');
				this.selectPaneb('cb3');
				this.selectPane('cb1');
				this.selectPane('cb2');
				this.selectPane('cb3');	
				//************************************************************
				//By Raffaele
				this.changeLabelEnabledStatus(true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.personal",false);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.tracking",false);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.annoying",false);
				//selectPaneb('nt-lblPrivacy');calcolaGlobalb('personal');
				//selectPaneb('nt-lblBehavioralAdvertising');calcolaGlobalb('tracking');
				//selectPaneb('nt-lblAdvertisements');calcolaGlobalb('annoying');
				//************************************************************
			}	
			else{
				document.getElementById('cb1').checked=false;
				document.getElementById('cb1').disabled=false;
				document.getElementById('cb2').checked=false;
				document.getElementById('cb2').disabled=false;
				document.getElementById('cb3').checked=false;
				document.getElementById('cb3').disabled=false;	
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.personal",false);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.tracking",false);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.annoying",false);
				this.selectPaneb('cb1');
				this.selectPaneb('cb2');
				this.selectPaneb('cb3');
				this.selectPane('cb1');
				this.selectPane('cb2');
				this.selectPane('cb3');	
				//************************************************************
				//By Raffaele
				this.changeLabelEnabledStatus(false);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.personal",false);// It shoudl be true
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.tracking",false);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.annoying",false);
				//selectPaneb('nt-lblPrivacy');calcolaGlobalb('personal');
				//selectPaneb('nt-lblBehavioralAdvertising');calcolaGlobalb('tracking');
				//selectPaneb('nt-lblAdvertisements');calcolaGlobalb('annoying');
				//************************************************************		
			}
		},
		disNotrace1: function(){
			if(document.getElementById('dis').checked){
				document.getElementById('cb1').checked=false;
				document.getElementById('cb1').disabled=true;
				document.getElementById('cb2').checked=false;
				document.getElementById('cb2').disabled=true;
				document.getElementById('cb3').checked=false;
				document.getElementById('cb3').disabled=true;		
				//************************************************************
				//By Raffaele
				this.changeLabelEnabledStatus(true);
				//************************************************************
				this.selectPaneb('cb1');
				this.selectPaneb('cb2');
				this.selectPaneb('cb3');
				this.selectPane('cb1');
				this.selectPane('cb2');
				this.selectPane('cb3');
			}	
		},		
		/**
		 * Called when the label "I care about" is called
		 */
		selectPaneb: function(cbid){
			var paneid;	
			var p;
			if(cbid=="cb1"){
				paneid = "panepersonal1";
				p = "observe.personal";
			}
			if(cbid=="cb2"){
				paneid = "panetracking";
				p = "observe.tracking";
			}
			if(cbid=="cb3"){
				paneid = "paneannoying";
				p = "observe.annoying";
			}
			var pane = document.getElementById(paneid);
			var cb = document.getElementById(cbid);
			if(!document.getElementById('dis').checked && cb.disabled)
				var sel = true;
			else
				var sel = cb.checked;
			var cbs = pane.getElementsByTagName("checkbox");
			var cbslen = cbs.length;
			if(sel){
				for(var i=0;i<cbslen;i++){
					var curcb = cbs[i];
					curcb.setAttribute("disabled","true");
					curcb.setAttribute("checked","false");
					this.disablefun(curcb);
				}
			}
			else{
				for(var i=0;i<cbslen;i++){
					var curcb = cbs[i];
					try{curcb.removeAttribute("disabled");}catch(ex){}

				}
			}
		},
		calcolaScore: function(){
			var adnet=isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.noadnetwcookie");
			if (adnet) {
				this.showDialogOptoutList();
			}
			else {
				this.hideDialogOptoutList();
			}
			var sc = document.getElementById("a5");
			sc.value=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getCount('nonoscript');
			sc = document.getElementById("a6");
			sc.value=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getCount('nojscookie');
			sc = document.getElementById("a9");
			sc.value=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getCount('nometaredirectandcookie');
			/*sc.value=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getCount('nometacookie');
			sc = document.getElementById("a8");
			sc.value=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getCount('nometaredirect');*/
			sc = document.getElementById("a2");
			sc.value=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getCount('nojs');
			sc = document.getElementById("a3");
			sc.value=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getCount('noimg');
			sc = document.getElementById("a14-1");
			sc.value=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getCount('no3cookie');
			sc = document.getElementById("a12-2");
			sc.value=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getCount('no3img');
			sc = document.getElementById("a11-1");
			sc.value=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getCount('no3js');
			sc = document.getElementById("a4");
			sc.value=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getCount('no3pe');
			sc = document.getElementById("a13");
			sc.value=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getCount('no3objnoid');
			sc = document.getElementById("a10");
			sc.value=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getCount('noad');
			sc = document.getElementById("a1");
			sc.value=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getCount('nocookie');
			sc = document.getElementById("a7");
			sc.value=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getCount('noidheader');
			//sc = document.getElementById("a15");
			//sc.value=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getCount('notop');
			sc = document.getElementById("a16-2");
			sc.value=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getCount('nowebbug');
			//sc = document.getElementById("a11");
			//sc.value=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getCount('noflashcookie');
			sc = document.getElementById("a20");
			sc.value=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getCount('no3hiddenobj');
			/*sc = document.getElementById("a130");
			sc.value=0;*/
		},
		getChecked: function(){
			this.cbnocookie = document.getElementById("cbnocookie").checked;
			this.cbno3cookie = document.getElementById("cbno3cookie").checked;
			this.cbnojscookie = document.getElementById("cbnojscookie").checked;
			this.cbnojs = document.getElementById("cbnojs").checked;
			this.cbno3js = document.getElementById("cbno3js").checked;
			this.cbnonoscript = document.getElementById("cbnonoscript").checked;
			this.cbnoimg = document.getElementById("cbnoimg").checked;
			//this.cbno3pe = document.getElementById("cbno3pe").checked;
			this.cbno3img = document.getElementById("cbno3img").checked;
			this.cbnowebbug = document.getElementById("cbnowebbug").checked;
			this.cbno3objnoid = document.getElementById("cbno3objnoid").checked;
			//this.cbnotop = document.getElementById("cbnotop").checked;
			//this.cbnometaredirect = document.getElementById("cbnometaredirect").checked;
			//this.cbnometacookie = document.getElementById("cbnometacookie").checked;
			this.cbnometaredirectandcookie= document.getElementById("cbnometaredirectandcookie").checked;
			this.cbnoidheader = document.getElementById("cbnoidheader").checked;
			this.cbnoad = document.getElementById("cbnoad").checked;
			this.cbnoflashcookie = document.getElementById("cbnoflashcookie").checked;
			this.cbnohtml5storage = document.getElementById("cbnohtml5storage").checked;
			this.cbno3hiddenobj = document.getElementById("cbno3hiddenobj").checked;
			this.cbdis = document.getElementById("dis").checked;	
		},
		getChecked2: function(){
			this.obspersonal = document.getElementById("cb1").checked;
			this.obstracking = document.getElementById("cb2").checked;
			this.obsannoying = document.getElementById("cb3").checked;
			this.obsdis = document.getElementById("dis").checked;
		},
		getCheckedb: function(id){
			if(id=="cbnojs"){
				this.cbnojs = !document.getElementById("cbnojs").checked;
				var high=document.getElementById("green").getAttribute("selected"); 
			}		
			else
				this.cbnojs = document.getElementById("cbnojs").checked;
			
			if(id=="cbnocookie"){
				this.cbnocookie = !document.getElementById("cbnocookie").checked;
				var high=document.getElementById("green").getAttribute("selected"); 
				var low=document.getElementById("red").getAttribute("selected"); 
				//document.getElementById("cbno3cookie").checked = false;
				//document.getElementById("cbno3cookie").disabled = false;
			}
			else
				this.cbnocookie = document.getElementById("cbnocookie").checked;

			if(id=="cbnoimg"){
				this.cbnoimg = !document.getElementById("cbnoimg").checked;	
				var high=document.getElementById("green").getAttribute("selected"); 
			}
			else
				this.cbnoimg = document.getElementById("cbnoimg").checked;

			if (id == "cbno3img") {
				this.cbno3img = !document.getElementById("cbno3img").checked;
			}
			else 
				this.cbno3img = document.getElementById("cbno3img").checked;
				
			if(id=="cbnojscookie")
				this.cbnojscookie = !document.getElementById("cbnojscookie").checked;
			else
				this.cbnojscookie = document.getElementById("cbnojscookie").checked;
			
			if(id=="cbno3hiddenobj")
				this.cbno3hiddenobj = !document.getElementById("cbno3hiddenobj").checked;
			else
				this.cbno3hiddenobj = document.getElementById("cbno3hiddenobj").checked;
			
			if(id=="cbno3js")
				this.cbno3js = !document.getElementById("cbno3js").checked;
			else
				this.cbno3js = document.getElementById("cbno3js").checked;

			if(id=="cbnonoscript")
				this.cbnonoscript = !document.getElementById("cbnonoscript").checked;
			else
				this.cbnonoscript = document.getElementById("cbnonoscript").checked;

			if(id=="cbnowebbug")
				this.cbnowebbug = !document.getElementById("cbnowebbug").checked;
			else
				this.cbnowebbug = document.getElementById("cbnowebbug").checked;
				
			if(id=="cbno3objnoid")
				this.cbno3objnoid = !document.getElementById("cbno3objnoid").checked;
			else
				this.cbno3objnoid = document.getElementById("cbno3objnoid").checked;
				
			/*if(id=="cbnotop")
				this.cbnotop = !document.getElementById("cbnotop").checked;
			else
				this.cbnotop = document.getElementById("cbnotop").checked;
			*/
			/*if(id=="cbnometaredirect")
				this.cbnometaredirect = !document.getElementById("cbnometaredirect").checked;
			else
				this.cbnometaredirect = document.getElementById("cbnometaredirect").checked;
				
			if(id=="cbnometacookie")
				this.cbnometacookie = !document.getElementById("cbnometacookie").checked;
			else
				this.cbnometacookie = document.getElementById("cbnometacookie").checked;	*/
				
			if(id=="cbnometaredirectandcookie")
				this.cbnometacookie = !document.getElementById("cbnometaredirectandcookie").checked;
			else
				this.cbnometacookie = document.getElementById("cbnometaredirectandcookie").checked;

			if(id=="cbnoidheader")
				this.cbnoidheader = !document.getElementById("cbnoidheader").checked;
			else
				this.cbnoidheader = document.getElementById("cbnoidheader").checked;

			if(id=="cbnoad")
				this.cbnoad = !document.getElementById("cbnoad").checked;
			else
				this.cbnoad = document.getElementById("cbnoad").checked;
		},
		getChecked2b: function(clas){
			if(clas=="personal")
				this.obspersonal = !document.getElementById("cb1").checked;
			else
				this.obspersonal = document.getElementById("cb1").checked;
			
			if(clas=="tracking")
				this.obstracking = !document.getElementById("cb2").checked;
			else
				this.obstracking = document.getElementById("cb2").checked;
			
			if(clas=="annoying")
				this.obsannoying = !document.getElementById("cb3").checked;
			else
				this.obsannoying = document.getElementById("cb3").checked;
		},
		pushPref: function(pref){
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
		},
		/**
		 * Called when the panel opens
		 */
		calcolaGlobal: function(){
			if (navigator.userAgent.indexOf("Win") != -1) os = "win";	
			this.caricaLivello();
			this.getChecked();
			this.getChecked2();
			//this.calcola();	
		},
		/**
		 * Called when che "i care about" is clicked
		 */
		calcolaGlobalb: function(clas){
			this.getChecked();
			this.getChecked2b(clas);
			//this.calcola();
		},
		/**
		 * Called when a ceckbox is clicked in order to activate a technique
		 */
		calcolaGlobalb2: function(cbid){
			var cb = document.getElementById(cbid);
			var dis = cb.getAttribute("disabled");
			if(dis!="true"){
				this.getCheckedb(cbid);
				//this.calcola();
				//this.cambiaImg();
			}
		},
		showHideAddonBarButton: function(cbid){
		    var cb = document.getElementById(cbid);
            var chk = cb.getAttribute("checked");
            var visibility = true;
            if (chk!="true"){
               visibility = false; 
            }
            var mediator = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);  
            var doc = mediator.getMostRecentWindow("navigator:browser").document;
            var toolbarbutton = doc.getElementById("nt-mainButton");
            toolbarbutton.hidden = visibility;
            var addonBar = doc.getElementById("addon-bar");
            // The following piece of code mimic the setToolbarVisibility function in browser.js
            var hidingAttribute = addonBar.getAttribute("type") == "menubar" ? "autohide" : "collapsed";
            addonBar.setAttribute(hidingAttribute, visibility);
            doc.persist(addonBar.id, hidingAttribute);
            
		},
		openNewWindow: function(tech,techdesc){
			var t = document.getElementById("tech");
			t.setAttribute("value",tech);
			var t = document.getElementById("tech2");
			t.setAttribute("value",techdesc);
			var screen_w = screen.width;
			var screen_h = screen.height
			var win_w = screen_w*3/7;
			var win_h = screen_h*3/7;
			var pos_x = (screen_w/2)-(win_w/2);
			var pos_y = (screen_h/2)-(win_h/2);
			var win = window.open("chrome://notrace/content/objects.xul","","chrome,resizable=1,width="+win_w+",height="+win_h+",screenX="+pos_x+",screenY="+pos_y);
		},
		addEvent: function(win){
			win.addEventListener("unload", function() { /*isisNoTrace.score.start();*/ }, false);
		},
		importWhiteList: function(){
			var file = this.loadFileWhitelist("Select a File", Components.interfaces.nsIFilePicker.modeOpen);
			this.copyFileWhiteList(file);
		},
		loadFileWhitelist: function(title, mode){
			var nsIFilePicker = Components.interfaces.nsIFilePicker;
			var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
			fp.init(window, title, mode);
			fp.appendFilters(nsIFilePicker.filterText);
			var res = fp.show();
			if (res == nsIFilePicker.returnOK || nsIFilePicker.returnReplace){
			  return fp.file;      
			}
			else{
			  return null;
			}
		},
		copyFileWhiteList: function(file){
			if(file != null){
				var delFile = Components.classes["@mozilla.org/file/directory_service;1"]
					.getService(Components.interfaces.nsIProperties)
					.get("ProfD", Components.interfaces.nsIFile);
				delFile.append("notracedb");
				delFile.append("whitelist.txt");
				if(delFile.exists())
					delFile.remove(true);		
				var aFile = Components.classes["@mozilla.org/file/directory_service;1"]
					.getService(Components.interfaces.nsIProperties)
					.get("ProfD", Components.interfaces.nsIFile);
				aFile.append("notracedb");
				file.copyTo(aFile,"whitelist.txt");   
				isisNoTraceShare.isisNoTraceSharedObjects.alertsService.showAlertNotification("chrome://notrace/content/imgs/info_24.png", "INFO", isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("updatesuccess.label"), false, "", null, "");
				var element = document.getElementById("nt-whitelist");
				while (element.firstChild) {
					element.removeChild(element.firstChild);
				}
				//isisNoTraceShare.isisNoTraceSharedObjects.whitelist.refreshList();
				isisNoTraceShare.isisNoTraceSharedObjects.whitelist.initwhitelist();
			}
			return true;
		},
		createLogFile: function(file){
			if(file != null){
			isisNoTraceShare.isisNoTraceSharedObjects.prefs.setCharPref("logfilepath",file.path);
			isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("logenabled",true);
			try{
				var strm = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
				strm.QueryInterface(Components.interfaces.nsIOutputStream);
				strm.QueryInterface(Components.interfaces.nsISeekableStream);
				strm.init( file, 0x02 | 0x08 | 0x40 | 0x20, -1, 0 );
				   
				var towrite = "******************************************************\n"+
					  "Container URL\nObject - Server - Blocking technique\n"+
					  "******************************************************\n\n";
				strm.write(towrite,towrite.length);
				strm.close();
				}catch(ex){
					return false;
				}  
			}
			return true;
		},
		getFile: function(title, mode){
			var nsIFilePicker = Components.interfaces.nsIFilePicker;
			var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
			fp.init(window, title, mode);
			fp.appendFilters(nsIFilePicker.filterAll);
			var res = fp.show();
			if (res == nsIFilePicker.returnOK || nsIFilePicker.returnReplace){
			  return fp.file;      
			}else{
			  return null;
			}
		},
		livelloTecDB: function(tec){
			/*this.dbconn = isisNoTraceShare.isisNoTraceSharedObjects.initDBConnection();
			var updateTec = this.dbconn.createStatement("UPDATE logTable SET livelloAtt=?1");	
			updateTec.bindInt32Parameter(0,tec);
			updateTec.executeAsync({
				handleResult: function(aResultSet) {
				},
				handleError: function(aError) {
					isisLogWrapper.logToConsole("Error: " + aError.message);
				},
				handleCompletion: function(aReason) {
					if (aReason != Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED)
						isisLogWrapper.logToConsole("Query canceled or aborted!");
				}
			});*/
		},
		flashcookie: function(){
			var check = document.getElementById("cbnoflashcookie").checked;
			var filePath;
			if (this.os.indexOf("Linux") != -1) {
				var appData = Components.classes["@mozilla.org/file/directory_service;1"]
						.getService(Components.interfaces.nsIProperties)
						.get("Home", Components.interfaces.nsIFile);
					appData.append(".macromedia");
					appData.append("Flash_Player");
					appData.append("#SharedObjects");
					filePath=appData.path;
					try {
						var file = Components.classes["@mozilla.org/file/local;1"]
							.createInstance(Components.interfaces.nsIFile);
						file.initWithPath(filePath);
						file.remove(true);   
					} catch(ex) {
						isisLogWrapper.logToConsole("Exception: "+ex);
					}
				var appData2 = Components.classes["@mozilla.org/file/directory_service;1"]
						.getService(Components.interfaces.nsIProperties)
						.get("Home", Components.interfaces.nsIFile);
					appData2.append(".macromedia");
					appData2.append("Flash_Player");
					appData2.append("macromedia.com");
					appData2.append("support");
					appData2.append("flashplayer");
					appData2.append("sys");
					settingsFilePath = appData2.path;
					try {
						var settingsFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
						settingsFile.initWithPath(settingsFilePath);
						var cance = settingsFile.remove(true);   		  
					} catch(ex) {
						isisLogWrapper.logToConsole("Exception: "+ex);
					}	 

                    if(!check){
    					var appData = Components.classes["@mozilla.org/file/directory_service;1"]
    						.getService(Components.interfaces.nsIProperties)
    						.get("AppData", Components.interfaces.nsIFile);
    					appData.append(".macromedia");
    					appData.append("Flash_Player");
    					appData.append("macromedia.com");
    					appData.append("support");
    					appData.append("flashplayer");
    					var filePath = appData.path;
    					var file = Components.classes["@mozilla.org/file/local;1"]
    						.createInstance(Components.interfaces.nsIFile);
    					file.initWithPath(filePath);
    					file.append("sys"); 
    					if(!file.exists() || !file.isDirectory()) {
    						file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);	
    					}
    					AddonManager.getAddonByID("notrace@unisa.it", function(addon) {
    						var iOService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    						var myReadChannel = iOService.newChannelFromURI(addon.getResourceURI("/chrome/content/lso/settings.sol"));
    						var myInputStream = myReadChannel.open();
    						var fileOutput = Components.classes["@mozilla.org/file/directory_service;1"]
    							.getService(Components.interfaces.nsIProperties)
    							.get("Home", Components.interfaces.nsIFile);
    						fileOutput.append(".macromedia");
    						fileOutput.append("Flash_Player");
    						fileOutput.append("macromedia.com");
    						fileOutput.append("support");
    						fileOutput.append("flashplayer");
    						fileOutput.append("sys");
    						fileOutput.append("settings.sol");
    						if (!fileOutput.exists()) {
    							fileOutput.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
    						}
    						var ostream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
    						ostream.init(fileOutput, -1, -1, 0);
    						NetUtil.asyncCopy(myInputStream, ostream, function(aResult) {
    						  if (!Components.isSuccessCode(aResult)) {
    							isisLogWrapper.logToConsole("Error copying file settings.sol");
    						  }
    						  else {
    						    isisLogWrapper.logToConsole("Successfully copied file settings.sol");  
    						  }
    						})
    					});
    				}
			}
			else {
				if (this.os.indexOf("Win") != -1) {
					var appData = Components.classes["@mozilla.org/file/directory_service;1"]
						.getService(Components.interfaces.nsIProperties)
						.get("AppData", Components.interfaces.nsIFile);
					appData.append("Macromedia");
					appData.append("Flash Player");
					appData.append("#SharedObjects");
					filePath = appData.path;
					try {
                        var file = Components.classes["@mozilla.org/file/local;1"]
                            .createInstance(Components.interfaces.nsIFile);
                        file.initWithPath(filePath);
                        file.remove(true);   
                    } catch(ex) {
                        isisLogWrapper.logToConsole("Exception: "+ex);
                    }  
					var appData2 = Components.classes["@mozilla.org/file/directory_service;1"]
						.getService(Components.interfaces.nsIProperties)
						.get("AppData", Components.interfaces.nsIFile);
					appData2.append("Macromedia");
					appData2.append("Flash Player");
					appData2.append("macromedia.com");
					appData2.append("support");
					appData2.append("flashplayer");
					appData2.append("sys");
					settingsFilePath = appData2.path;
					try {
						var settingsFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
						settingsFile.initWithPath(settingsFilePath);
						var cance = settingsFile.remove(true);   		  
					} catch(ex) {
                        isisLogWrapper.logToConsole("Exception: "+ex);
                    } 
                    
					if(!check){
						var appData = Components.classes["@mozilla.org/file/directory_service;1"]
							.getService(Components.interfaces.nsIProperties)
							.get("AppData", Components.interfaces.nsIFile);
						appData.append("Macromedia");
						appData.append("Flash Player");
						appData.append("macromedia.com");
						appData.append("support");
						appData.append("flashplayer");
						var filePath = appData.path;
						var file = Components.classes["@mozilla.org/file/local;1"]
							.createInstance(Components.interfaces.nsIFile);
						file.initWithPath(filePath);
						file.append("sys"); 
						if(!file.exists() || !file.isDirectory()) {
							file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);	
						}
						AddonManager.getAddonByID("notrace@unisa.it", function(addon) {
							var iOService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
							var myReadChannel = iOService.newChannelFromURI(addon.getResourceURI("/chrome/content/lso/settings.sol"));
							var myInputStream = myReadChannel.open();
							var fileOutput = Components.classes["@mozilla.org/file/directory_service;1"]
								.getService(Components.interfaces.nsIProperties)
								.get("AppData", Components.interfaces.nsIFile);
							fileOutput.append("Macromedia");
							fileOutput.append("Flash Player");
							fileOutput.append("macromedia.com");
							fileOutput.append("support");
							fileOutput.append("flashplayer");
							fileOutput.append("sys");
							fileOutput.append("settings.sol");
							if (!fileOutput.exists()) {
								fileOutput.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
							}
							var ostream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
							ostream.init(fileOutput, -1, -1, 0);
							NetUtil.asyncCopy(myInputStream, ostream, function(aResult) {
							  if (!Components.isSuccessCode(aResult)) {
								isisLogWrapper.logToConsole("Error copying file settings.sol");
							  }
							})
						});
					}
				}
				else {
					if (this.os.indexOf("Mac") != -1) {
						var appData = Components.classes["@mozilla.org/file/directory_service;1"]
							.getService(Components.interfaces.nsIProperties)
							.get("Home", Components.interfaces.nsIFile);
						appData.append("Library");
						appData.append("Preferences");
						appData.append("Macromedia");
						appData.append("Flash Player");
						appData.append("#SharedObjects");
						filePath = appData.path;
						try {
                            var file = Components.classes["@mozilla.org/file/local;1"]
                                .createInstance(Components.interfaces.nsIFile);
                            file.initWithPath(filePath);
                            file.remove(true);   
                        } catch(ex) {
                            isisLogWrapper.logToConsole("Exception: "+ex);
                        }   
						var appData2 = Components.classes["@mozilla.org/file/directory_service;1"]
							.getService(Components.interfaces.nsIProperties)
							.get("Home", Components.interfaces.nsIFile);
						appData2.append("Library");
						appData2.append("Preferences");
						appData2.append("Macromedia");
						appData2.append("Flash Player");
						appData2.append("macromedia.com");
						appData2.append("support");
						appData2.append("flashplayer");
						appData2.append("sys");
						settingsFilePath = appData2.path;
						try {
							var settingsFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
							settingsFile.initWithPath(settingsFilePath);
							var cance = settingsFile.remove(true);   		  
						} catch(ex) {
                            isisLogWrapper.logToConsole("Exception: "+ex);
                        } 
						
						if(!check){
							var appData = Components.classes["@mozilla.org/file/directory_service;1"]
								.getService(Components.interfaces.nsIProperties)
								.get("Home", Components.interfaces.nsIFile);
							appData.append("Library");
							appData.append("Preferences");
							appData.append("Macromedia");
							appData.append("Flash Player");
							appData.append("macromedia.com");
							appData.append("support");
							appData.append("flashplayer");
							var filePath = appData.path;
							var file = Components.classes["@mozilla.org/file/local;1"]
								.createInstance(Components.interfaces.nsIFile);
							file.initWithPath(filePath);
							file.append("sys"); 
							if(!file.exists() || !file.isDirectory()) {
								file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);	
							}
							AddonManager.getAddonByID("notrace@unisa.it", function(addon) {
								var iOService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
								var myReadChannel = iOService.newChannelFromURI(addon.getResourceURI("/chrome/content/lso/settings.sol"));
								var myInputStream = myReadChannel.open();
								var fileOutput = Components.classes["@mozilla.org/file/directory_service;1"]
									.getService(Components.interfaces.nsIProperties)
									.get("Home", Components.interfaces.nsIFile);
								appData.append("Library");
								appData.append("Preferences");
								fileOutput.append("Macromedia");
								fileOutput.append("Flash Player");
								fileOutput.append("macromedia.com");
								fileOutput.append("support");
								fileOutput.append("flashplayer");
								fileOutput.append("sys");
								fileOutput.append("settings.sol");
								if (!fileOutput.exists()) {
									fileOutput.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
								}
								var ostream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
								ostream.init(fileOutput, -1, -1, 0);
								NetUtil.asyncCopy(myInputStream, ostream, function(aResult) {
								  if (!Components.isSuccessCode(aResult)) {
									isisLogWrapper.logToConsole("Error copying file settings.sol");
								  }
								})
							});
						}
					}
				}
			}
		},
		loadFile: function(title, mode){
			var nsIFilePicker = Components.interfaces.nsIFilePicker;
			var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
			fp.init(window, title, mode);
			fp.appendFilters(nsIFilePicker.filterText);
			var res = fp.show();
			if (res == nsIFilePicker.returnOK || nsIFilePicker.returnReplace){
				return fp.file;      
			}
			else{
				return null;
			}
		},
		loadHiddenScript: function(){
			var file = this.loadFile("Select a File", Components.interfaces.nsIFilePicker.modeOpen);
			if (file) {
				if(file.leafName=="scriptList.txt")
					this.copyFileScript(file);
				else
					alert(isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("scriptlistincorrectfile.label"));
			}
		},
		copyFileScript: function(file){
			if(file != null){
				var parentDir= Components.classes["@mozilla.org/file/directory_service;1"]
					.getService(Components.interfaces.nsIProperties)
					.get("ProfD", Components.interfaces.nsIFile);
				parentDir.append("notracedb");
				var appData = Components.classes["@mozilla.org/file/directory_service;1"]
					.getService(Components.interfaces.nsIProperties)
					.get("ProfD", Components.interfaces.nsIFile);
				appData.append("notracedb");
				appData.append("scriptList.txt");
				
				var delFilePath = appData.path;
				var delFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
				delFile.initWithPath(delFilePath);
				if(delFile.exists())
					delFile.remove(true);		
				var aFilePath = parentDir.path;
				var aFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
				aFile.initWithPath(aFilePath);							
				file.copyTo(aFile,"scriptList.txt");   
				/*if(delFile.exists())
					delFile.remove(true);*/
				isisNoTraceShare.isisNoTraceSharedObjects.alertsService.showAlertNotification("chrome://notrace/content/imgs/info_24.png", "INFO", isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("updatesuccess.label"), false, "", null, "");
				var element = document.getElementById("nt-scriptlist-children");
				while (element.firstChild) {
					element.removeChild(element.firstChild);
				}
				this.scriptlist.refreshList();
				this.scriptlist.initscriptlist();
			}
			return true;
		},
		caricaLivello: function(){
			var liv=isisNoTraceShare.isisNoTraceSharedObjects.prefs.getIntPref("flag");
			if(liv=="1"){
				document.getElementById("black").setAttribute("selected","false");
				document.getElementById("red").setAttribute("selected","true");
				document.getElementById("orange").setAttribute("selected","false");
				document.getElementById("green").setAttribute("selected","false");
				document.getElementById("blue").setAttribute("selected","false");
				document.getElementById("cb1").disabled=true;
				document.getElementById("cb2").disabled=true;
				document.getElementById("cb3").disabled=true;
				//************************************************************
				//By Raffaele
				this.changeLabelEnabledStatus(true);
				//************************************************************
				this.livello("1");
			}
			else if(liv=="2"){
				document.getElementById("black").setAttribute("selected","false");
				document.getElementById("red").setAttribute("selected","false");
				document.getElementById("orange").setAttribute("selected","true");
				document.getElementById("green").setAttribute("selected","false");
				document.getElementById("blue").setAttribute("selected","false");
				document.getElementById("cb1").disabled=true;
				document.getElementById("cb2").disabled=true;
				document.getElementById("cb3").disabled=true;		
				//************************************************************
				//By Raffaele
				this.changeLabelEnabledStatus(false);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.personal",true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.tracking",true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.annoying",true);
				//************************************************************
				this.livello("2");
			}
			else if(liv=="3"){
				document.getElementById("black").setAttribute("selected","false");
				document.getElementById("red").setAttribute("selected","false");
				document.getElementById("orange").setAttribute("selected","false");
				document.getElementById("green").setAttribute("selected","true");
				document.getElementById("blue").setAttribute("selected","false");
				document.getElementById("cb1").disabled=true;
				document.getElementById("cb2").disabled=true;
				document.getElementById("cb3").disabled=true;	
				//************************************************************
				//By Raffaele
				this.changeLabelEnabledStatus(false);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.personal",true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.tracking",true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.annoying",true);
				//************************************************************
				this.livello("3");
			}
			else if(liv=="5"){
				document.getElementById("black").setAttribute("selected","true");
				document.getElementById("red").setAttribute("selected","false");
				document.getElementById("orange").setAttribute("selected","false");
				document.getElementById("green").setAttribute("selected","false");
				document.getElementById("blue").setAttribute("selected","false");
				//************************************************************
				//By Raffaele
				this.changeLabelEnabledStatus(false);
				//************************************************************
				this.livello("5");
			}
			else if(liv=="4"){
				document.getElementById("black").setAttribute("selected","false");
				document.getElementById("red").setAttribute("selected","false");
				document.getElementById("orange").setAttribute("selected","false");
				document.getElementById("green").setAttribute("selected","false");
				document.getElementById("blue").setAttribute("selected","true");	
				document.getElementById("cb1").disabled=true;
				document.getElementById("cb2").disabled=true;
				document.getElementById("cb3").disabled=true;	
				//************************************************************
				//By Raffaele
				this.changeLabelEnabledStatus(true);
				//************************************************************			
				this.disabledCheckBox();	
				this.livello("4");
			}
		},
		prepareForLevel: function(id){
			if (id=='1') {
				document.getElementById("cbnocookie").checked=false;
				document.getElementById("cbnocookie").disabled=false;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.nocookie",false);
				this.getCheckedb("cbnocookie");
				
				document.getElementById("cbnoimg").checked=false;
				document.getElementById("cbnoimg").disabled=false;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.noimg",false);
				this.getCheckedb("cbnoimg");
				
				var panel=document.getElementById("optOutList-group");
				panel.style.display="none";
			}
			else if (id=='2') {
				document.getElementById("cbnocookie").checked=false;
				document.getElementById("cbnocookie").disabled=false;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.nocookie",false);
				this.getCheckedb("cbnocookie");
				
				document.getElementById("cbno3cookie").checked=true;
				document.getElementById("cbno3cookie").disabled=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.no3cookie",true);
				this.getCheckedb("cbno3cookie");
				
				document.getElementById("cbno3js").checked=false;
				document.getElementById("cbno3js").disabled=false;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.no3js",false);
				this.getCheckedb("cbno3js");
				
				var panel=document.getElementById("optOutList-group");
				panel.style.display="none";
			}
			else if (id=='3') {
				document.getElementById("cbno3img").checked=false;
				document.getElementById("cbno3img").disabled=false;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.no3img",false);
				this.getCheckedb("cbno3img");
				
				document.getElementById("cbnoadnetwcookie").checked=true;
				document.getElementById("cbnoadnetwcookie").disabled=false;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.noadnetwcookie",true);
				this.getCheckedb("cbnoadnetwcookie");
				
				isisNoTrace.optlist.onoffoptlist('on','0');
				var panel=document.getElementById("optOutList-group");
				var panelHiddenScript=document.getElementById("hiddenScript-group");
				panel.style.display="block";
				panelHiddenScript.style.display="none";
				isisNoTrace.optlist.initoptlist();
			}
		},
		livello: function(id){
			var liv=isisNoTraceShare.isisNoTraceSharedObjects.prefs.getIntPref("flag");
			if(id=="5"){
				if(liv!="5"){ 
					this.disabledCheckBox();
					this.calcolaGlobalb('personal');
					this.calcolaGlobalb('tracking');
					this.calcolaGlobalb('annoyng');
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.personal",false);
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.tracking",false);
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.annoying",false);	
					document.getElementById("cb1").disabled=false;
					document.getElementById("cb2").disabled=false;
					document.getElementById("cb3").disabled=false;		
					document.getElementById("cb1").checked=false;
					document.getElementById("cb2").checked=false;
					document.getElementById("cb3").checked=false;		
					//************************************************************
					//By Raffaele
					this.changeLabelEnabledStatus(false);
					//************************************************************
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setIntPref("flag",5);
				}
				else{
					this.checkManualLevelOnLoad();
					this.getChecked();
					this.getChecked2();
					//this.calcola();	
				}
			}
			else if(id=="1"){
				//this.hideDivResults();
				this.disabledCheckBox();
				//************************************************************
				//By Raffaele
				this.changeLabelEnabledStatus(true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.personal",true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.tracking",true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.annoying",true);
				//************************************************************
				document.getElementById("cb1").disabled=true;
				document.getElementById("cb2").disabled=true;
				document.getElementById("cb3").disabled=true;
				document.getElementById("cb1").checked=true;
				document.getElementById("cb2").checked=true;
				document.getElementById("cb3").checked=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.personal",true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.tracking",true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.annoying",true);
				document.getElementById("cbnoidheader").checked=false;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.noidheader",false);
				//this.getCheckedb("cbnoidheader");
				
				document.getElementById("cbno3cookie").checked=true;
				document.getElementById("cbno3cookie").disabled=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.no3cookie",true);
				this.getCheckedb("cbno3cookie");
				
				if( document.getElementById("red").getAttribute("selected") && isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.nocookie")){
					document.getElementById("cbnocookie").checked=true;
					document.getElementById("cbnocookie").disabled=false;
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.nocookie",true);
					this.getCheckedb("cbnocookie");
				}
				else{
					document.getElementById("cbnocookie").checked=false;
					document.getElementById("cbnocookie").disabled=false;
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.nocookie",false);
					this.getCheckedb("cbnocookie");		
				}
				
				if( document.getElementById("red").getAttribute("selected") && isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.noimg")){
					document.getElementById("cbnoimg").checked=true;
					document.getElementById("cbnoimg").disabled=false;
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.noimg",true);
					this.getCheckedb("cbnoimg");
				}
				else{
					document.getElementById("cbnoimg").checked=false;
					document.getElementById("cbnoimg").disabled=false;
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.noimg",false);
					this.getCheckedb("cbnoimg");		
				}
				
				this.calcolaGlobalb('personal');
				this.calcolaGlobalb('tracking');
				this.calcolaGlobalb('annoyng');
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setIntPref("flag",1);
			}
			else if(id=="2"){
				//************************************************************
				//By Raffaele
				this.changeLabelEnabledStatus(true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.personal",true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.tracking",true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.annoying",true);
				//************************************************************
				//this.hideDivResults();
				this.disabledCheckBox();
				document.getElementById("cb1").disabled=true;
				document.getElementById("cb2").disabled=true;
				document.getElementById("cb3").disabled=true;
				document.getElementById("cb1").checked=true;
				document.getElementById("cb2").checked=true;
				document.getElementById("cb3").checked=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.personal",true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.tracking",true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.annoying",true);
				
				
				/*document.getElementById("cbnocookie").checked=true;
				document.getElementById("cbnocookie").disabled=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.nocookie",true);
				this.getCheckedb("cbnocookie");	*/
				
				document.getElementById("cbno3cookie").checked=true;
				document.getElementById("cbno3cookie").disabled=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.no3cookie",true);
				this.getCheckedb("cbno3cookie");
				
				document.getElementById("cbnowebbug").checked=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.nowebbug",true);
				this.getCheckedb("cbnowebbug");
				
				document.getElementById("cbnoflashcookie").checked=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.noflashcookie",true);
				this.getCheckedb("cbnoflashcookie");
				
				document.getElementById("cbnohtml5storage").checked=false;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.nohtml5storage",false);
				this.getCheckedb("cbnohtml5storage");
								
				document.getElementById("cbnoad").checked=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.noad",true);
				this.getCheckedb("cbnoad");
				
				/*document.getElementById("cbno3js").checked=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.no3js",true);
				this.getCheckedb("cbno3js");*/
				
				/*document.getElementById("cbnometaredirect").checked=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.nometaredirect",true);
				this.getCheckedb("cbnometaredirect");
				
				document.getElementById("cbnometacookie").checked=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.nometacookie",true);
				this.getCheckedb("cbnometacookie");*/
				document.getElementById("cbnometaredirectandcookie").checked=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.nometaredirectandcookie",true);
				this.getCheckedb("cbnometaredirectandcookie");
				
				document.getElementById("cbnojscookie").checked=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.nojscookie",true);
				this.getCheckedb("cbnojscookie");
				
				document.getElementById("cbno3hiddenobj").checked=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.no3hiddenobj",true);
				this.getCheckedb("cbno3hiddenobj");
				
				/*document.getElementById("cbnotop").checked=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.notop",true);
				this.getCheckedb("cbnotop");*/
				
				if( document.getElementById("orange").getAttribute("selected") && isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.nocookie")){
					document.getElementById("cbnocookie").checked=true;
					document.getElementById("cbnocookie").disabled=false;
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.nocookie",true);
					this.getCheckedb("cbnocookie");
				}
				else{
					document.getElementById("cbnocookie").checked=false;
					document.getElementById("cbnocookie").disabled=false;
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.nocookie",false);
					this.getCheckedb("cbnocookie");		
				}
				if( document.getElementById("orange").getAttribute("selected") && isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.no3js")){
					document.getElementById("cbno3js").checked=true;
					document.getElementById("cbno3js").disabled=false;
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.no3js",true);
					this.getCheckedb("cbno3js");
				}
				else{
					document.getElementById("cbno3js").checked=false;
					document.getElementById("cbno3js").disabled=false;
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.no3js",false);
					this.getCheckedb("cbno3js");		
				}
				
				this.calcolaGlobalb('personal');
				this.calcolaGlobalb('tracking');
				this.calcolaGlobalb('annoyng');
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setIntPref("flag",2);
			}
			else if(id=="3"){ 
				//************************************************************
				//By Raffaele
				this.changeLabelEnabledStatus(true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.personal",true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.tracking",true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.annoying",true);
				//************************************************************
				//this.hideDivResults();		
				this.disabledCheckBox();
				document.getElementById("cb1").disabled=true;
				document.getElementById("cb2").disabled=true;
				document.getElementById("cb3").disabled=true;
				document.getElementById("cb1").checked=true;
				document.getElementById("cb2").checked=true;
				document.getElementById("cb3").checked=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.personal",true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.tracking",true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.annoying",true);
				
				/*document.getElementById("cbno3img").checked=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.no3img",true);
				this.getCheckedb("cbno3img");*/
				
				document.getElementById("cbno3cookie").checked=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.no3cookie",true);
				this.getCheckedb("cbno3cookie");
				
				document.getElementById("cbnonoscript").checked=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.nonoscript",true);
				this.getCheckedb("cbnonoscript");
				
				document.getElementById("cbnoad").checked=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.noad",true);
				this.getCheckedb("cbnoad");
				
				document.getElementById("cbno3hiddenobj").checked=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.no3hiddenobj",true);
				this.getCheckedb("cbno3hiddenobj");
				
				document.getElementById("cbnoflashcookie").checked=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.noflashcookie",true);
				this.getCheckedb("cbnoflashcookie");
				
				document.getElementById("cbnohtml5storage").checked=false;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.nohtml5storage",false);
				this.getCheckedb("cbnohtml5storage");
				
				document.getElementById("cbnoadnetwcookie").checked=true;
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.noadnetwcookie",true);
				this.getCheckedb("cbnoadnetwcookie");
								
				var red=document.getElementById("red").getAttribute("selected");
				var green=document.getElementById("green").getAttribute("selected");
				
				if( document.getElementById("green").getAttribute("selected") && isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.nocookie")){
					document.getElementById("cbnocookie").checked=true;
					document.getElementById("cbnocookie").disabled=false;
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.nocookie",true);
					this.getCheckedb("cbnocookie");
				}
				else{
					document.getElementById("cbnocookie").checked=false;
					document.getElementById("cbnocookie").disabled=false;
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.nocookie",false);
					this.getCheckedb("cbnocookie");		
				}
				if( document.getElementById("green").getAttribute("selected") && isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.nojs")){
					document.getElementById("cbnojs").checked=true;
					document.getElementById("cbnojs").disabled=false;
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.nojs",true);
					this.getCheckedb("cbnojs");
				}
				else{
					document.getElementById("cbnojs").checked=false;
					document.getElementById("cbnojs").disabled=false;
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.nojs",false);
					this.getCheckedb("cbnojs");		
				}
				if( document.getElementById("green").getAttribute("selected") && isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.no3js")){
					document.getElementById("cbno3js").checked=true;
					document.getElementById("cbno3js").disabled=false;
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.no3js",true);
					this.getCheckedb("cbno3js");
				}
				else{
					document.getElementById("cbno3js").checked=false;
					document.getElementById("cbno3js").disabled=false;
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.no3js",false);
					this.getCheckedb("cbno3js");		
				}
				
				if( document.getElementById("green").getAttribute("selected") && isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.noimg")){
					document.getElementById("cbnoimg").checked=true;
					document.getElementById("cbnoimg").disabled=false;
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("tecnique.noimg",true);
					this.getCheckedb("cbnoimg");
				}
				else{
					document.getElementById("cbnoimg").checked=false;
					document.getElementById("cbnoimg").disabled=false;
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("tecnique.noimg",false);
					this.getCheckedb("cbnoimg");
				}
				
				if( document.getElementById("green").getAttribute("selected") && isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.no3img")){
					document.getElementById("cbno3img").checked=true;
					document.getElementById("cbno3img").disabled=false;
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("tecnique.no3img",true);
					this.getCheckedb("cbno3img");
				}
				else{
					document.getElementById("cbno3img").checked=false;
					document.getElementById("cbno3img").disabled=false;
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("tecnique.no3img",false);
					this.getCheckedb("cbno3img");
				}
				
				if( document.getElementById("green").getAttribute("selected") && isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("technique.no3pe")){
					document.getElementById("cbno3pe").checked=true;
					document.getElementById("cbno3pe").disabled=false;
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.no3pe",true);
					this.getCheckedb("cbno3pe");
				}
				else{
					document.getElementById("cbno3pe").checked=false;
					document.getElementById("cbno3pe").disabled=false;
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("technique.no3pe",false);
					this.getCheckedb("cbno3pe");
				}
				this.calcolaGlobalb('personal');
				this.calcolaGlobalb('tracking');
				this.calcolaGlobalb('annoyng');
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setIntPref("flag",3);
			}
			 else if(id=="4"){ 
				//************************************************************
				//By Raffaele
				this.changeLabelEnabledStatus(false);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.personal",true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.tracking",true);
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.annoying",true);
				//************************************************************
				//this.hideDivResults();
				document.getElementById("cb1").disabled=true;
				document.getElementById("cb2").disabled=true;
				document.getElementById("cb3").disabled=true;
				this.disabledCheckBox();
				
				
				let liv=isisNoTraceShare.isisNoTraceSharedObjects.prefs.getIntPref("flag");
				//var lev="";
				var gg=0;
				if(liv!="4"){
					//this.restartTraining();
					//lev="Low";	
					this.livello("1");
				}
				//else if(liv=="4") {
					//this.checkAuto();
				//}
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setIntPref("flag",4);
			}
		},
		checkManualLevelOnLoad: function() {
			var pane1 = document.getElementById("panepersonal1");
			var pane2 = document.getElementById("panetracking");
			var pane3 = document.getElementById("paneannoying");
				
			var cb1 = document.getElementById('cb1');
			var cb2 = document.getElementById('cb2');
			var cb3 = document.getElementById('cb3');
			
			var nt1 = document.getElementById('nt-lblPrivacy');
			var nt2 = document.getElementById('nt-lblBehavioralAdvertising');
			var nt3 = document.getElementById('nt-lblAdvertisements');
			
			if(cb1.checked==false || nt1.disabled) {
				var cbs = pane1.getElementsByTagName("checkbox");
				var cbslen = cbs.length;
				for(var i=0;i<cbslen;i++){
					var curcb = cbs[i];
					curcb.setAttribute("disabled","true");
					curcb.setAttribute("checked","false");
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref(curcb.getAttribute("preference"),false);
				}
			}
			
			if (cb2.checked==false || nt2.disabled)	{
				cbs = pane2.getElementsByTagName("checkbox");
				cbslen = cbs.length;
				for(var i=0;i<cbslen;i++){
					var curcb = cbs[i];
					curcb.setAttribute("disabled","true");
					curcb.setAttribute("checked","false");
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref(curcb.getAttribute("preference"),false);
				}
			}
			
			if (cb3.checked==false || nt3.disabled)	{
				cbs = pane3.getElementsByTagName("checkbox");
				cbslen = cbs.length;
				for(var i=0;i<cbslen;i++){
					var curcb = cbs[i];
					curcb.setAttribute("disabled","true");
					curcb.setAttribute("checked","false");
					isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref(curcb.getAttribute("preference"),false);
				}
			}
		},
		disabledCheckBox: function(){
			var pane1 = document.getElementById("panepersonal1");
			var pane2 = document.getElementById("panetracking");
			var pane3 = document.getElementById("paneannoying");
			var cbs = pane1.getElementsByTagName("checkbox");
			var cbslen = cbs.length;
			for(var i=0;i<cbslen;i++){
				var curcb = cbs[i];
				curcb.setAttribute("disabled","true");
				curcb.setAttribute("checked","false");
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref(curcb.getAttribute("preference"),false);
			}
			cbs = pane2.getElementsByTagName("checkbox");
			cbslen = cbs.length;
			for(var i=0;i<cbslen;i++){
				var curcb = cbs[i];
				curcb.setAttribute("disabled","true");
				curcb.setAttribute("checked","false");
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref(curcb.getAttribute("preference"),false);
			}
			cbs = pane3.getElementsByTagName("checkbox");
			cbslen = cbs.length;
			for(var i=0;i<cbslen;i++){
				var curcb = cbs[i];
				curcb.setAttribute("disabled","true");
				curcb.setAttribute("checked","false");
				isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref(curcb.getAttribute("preference"),false);
			}
		},
		visualizzaDiv: function() {
			obj=document.getElementById('cpDiv');
			if (obj.style.display == "none") {
				obj.style.display = "block";
			} else {
				obj.style.display = "none";
			} 
		},
		openDialogHiddenScript: function() {
			var panel=document.getElementById("hiddenScript-group");
			var panelOptOutList=document.getElementById("optOutList-group");
			if (panel.style.display=="block"){
				panel.style.display="none";
				var button=document.getElementById("advancedHiddenScript");
				button.setAttribute("label", isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("advanced.label"));
				if (document.getElementById('cbnoadnetwcookie').checked){
					panelOptOutList.style.display="block";
				}
			}
			else {
				panel.style.display="block";
				panelOptOutList.style.display="none";
				var button=document.getElementById("advancedHiddenScript");
				var oldTxt=button.getAttribute("label");
				button.setAttribute("label", isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("hide.label"));
				this.scriptlist.initscriptlist();
			}
		},
		showDialogOptoutList: function() {
			var panel=document.getElementById("optOutList-group");
			var panelHiddenScript=document.getElementById("hiddenScript-group");
			panel.style.display="block";
			panelHiddenScript.style.display="none";
			this.optlist.initoptlist();
		},
		hideDialogOptoutList: function() {
			var panel=document.getElementById("optOutList-group");
			panel.style.display="none";
		},
		openDialogOptoutList: function() {
			var panel=document.getElementById("optOutList-group");
			var panelHiddenScript=document.getElementById("hiddenScript-group");
			if (panel.style.display=="block"){
				panel.style.display="none";
			}
			else {
				panel.style.display="block";
				panelHiddenScript.style.display="none";
				this.optlist.initoptlist();
			}
		},
		enableDisableOptOut: function(){
			obj=document.getElementById('cbnoadnetwcookie').checked;
			if(obj==false) {	
				this.optlist.onoffoptlist('on','1');
			}
			else
				this.optlist.onoffoptlist('off','1');
		},
		enableCheckboxOptOut: function() {
			document.getElementById('cbnoadnetwcookie').setAttribute('checked','true');
		},
		disableCheckboxOptOut: function(){
			document.getElementById('cbnoadnetwcookie').setAttribute('checked','false');
		},
		openDialogAdList: function() {
			var panel=document.getElementById("noAds-group");
			if (panel.style.display=="block"){
				panel.style.display="none";
				var button=document.getElementById("advancedNoAds");
				button.setAttribute("label", isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("advanced.label"));
			}
			else {
				panel.style.display="block";
				var button=document.getElementById("advancedNoAds");
				button.setAttribute("label", isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("hide.label"));
				this.adlist.adListTree();
			}
		},
		enableDisableAdNetCookies: function() {
			this.optlist.initoptlist();
			obj=document.getElementById('cbnoadnetwcookie');
			if(obj.checked) {
				optlist.onoffoptlist('on','1');
				var arrayFam=["googleFam","aolFam","yahooFam","microsoftFam","valueclickFam","akamaiFam","omnitureFam","otherFam"];
				var arrayName=["namegoogle","nameaol","nameyahoo","namemicrosoft","namevalueclick","nameakamai","nameomniture","nameother"];
				var arrayChild=["google","aol","yahoo","microsoft","valueclick","akamai","omniture","other"];
				var tot=0;
				for(var i=0;i<8;i++){
					var child=""+arrayChild[i];
					var nomeDom=""+arrayName[i];
					var fam=""+arrayFam[i];
					var check;
					var j=0;
					while((check = document.getElementById(child+""+j))!=null){
						check.setAttribute("value","true");	
						j++;
						tot++;
					}
					document.getElementById(fam).setAttribute("value","true");
				}
			}
			else
				this.optlist.onoffoptlist('off','1');
		},
		deleteAllFromLocalStorage: function() {
		//delete all from locale storage
			var scelta = confirm(isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("wanttodeletelocalstorage.label"));
			if(scelta){
				this.resetLocalStorageFromDB();
				alert(isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("wanttodeletelocalstorage.confirmed.label"));
				//then assure to refresh the view
				//this.calcolaScore();
			}
		},
		resetLocalStorageFromDB: function(){
			this.dbconn_local_storage = this.initLocalStorageDBConnection();
			var delstat = this.dbconn_local_storage.createStatement("DELETE FROM webappsstore2");
			delstat.executeAsync({
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
		},
		deleteAllResourcesFromDB: function(){
			var scelta = confirm(isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("wanttoreset.label"));
			if(scelta){
				//this.resetResourcesFromDB();
				isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.eraseDB();
				isisNoTraceShare.isisNoTraceSharedObjects.alertsService.showAlertNotification("chrome://notrace/content/imgs/info_24.png", "INFO", isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("wanttoreset.confirmed.label"), false, "", null, "");
				//then assure to refresh the view
				this.calcolaScore();
				/*var sc = document.getElementById("a130");
				sc.value=0;
				sc = document.getElementById("a1");
				sc.value=0;
				sc = document.getElementById("a11");
				sc.value=0;
				sc = document.getElementById("a20");
				sc.value=0;
				sc = document.getElementById("a2");
				sc.value=0;
				sc = document.getElementById("a3");
				sc.value=0;
				sc = document.getElementById("a5");
				sc.value=0;
				sc = document.getElementById("a6");
				sc.value=0;
				sc = document.getElementById("a7");
				sc.value=0;
				sc = document.getElementById("a8");
				sc.value=0;
				sc = document.getElementById("a9");
				sc.value=0;
				sc = document.getElementById("a6");
				sc.value=0;
				sc = document.getElementById("a10");
				sc.value=0;
				sc1 = document.getElementById("a11-1");
				sc1.value=0;
				sc2 = document.getElementById("a12-2");
				sc2.value=0;
				sc = document.getElementById("a13");
				sc.value=0;
				sc1 = document.getElementById("a14-1");
				sc1.value=0;
				sc = document.getElementById("a15");
				sc.value=0;
				sc2 = document.getElementById("a16-2");
				sc2.value=0;*/
			}
		},
		resetResourcesFromDB: function(){
			isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.eraseDB();
		},
		onClickRestoreDefaultButton: function() {
			isisNoTraceShare.isisNoTraceSharedObjects.prefs.setIntPref("flag",5);
			//this.hideDivResults();		
			this.disabledCheckBox();
			//********************************************************************
			// By Raffaele
			isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.personal",true);
			isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.tracking",true);
			isisNoTraceShare.isisNoTraceSharedObjects.prefs.setBoolPref("observe.annoying",true);
			document.getElementById("nt-lblPrivacy").disabled=false;
			document.getElementById("nt-lblBehavioralAdvertising").disabled=false;
			document.getElementById("nt-lblAdvertisements").disabled=false;		
			//********************************************************************
			document.getElementById("level").selectedIndex = 3;
			document.getElementById("cb1").disabled=false;
			document.getElementById("cb2").disabled=false;
			document.getElementById("cb3").disabled=false;		
			document.getElementById("cb1").checked=false;
			document.getElementById("cb2").checked=false;
			document.getElementById("cb3").checked=false;		
			this.livello("5");
		},
		countOptOutCookie: function() {
			/*let optAct=isisNoTraceShare.isisNoTraceSharedObjects.prefs.getIntPref("optActived");
			document.getElementById("a130").setAttribute("value",optAct);*/
		},
		countOptOnclose: function() {
			/*let optAct=isisNoTraceShare.isisNoTraceSharedObjects.prefs.getIntPref("optActived");
			if(optAct!=0){
				document.getElementById("a130").setAttribute("value",optAct);
			}	*/	
		},
		enableAllOpt: function() {
			isisNoTraceShare.isisNoTraceSharedObjects.prefs.setIntPref("optActived",114);
		},
		disableAllOpt: function() {
			isisNoTraceShare.isisNoTraceSharedObjects.prefs.setIntPref("optActived",0);
		},
		showFirstPanel: function(){
			var label=document.getElementById('nt-lblPrivacy');
			if (label.disabled==false){
				document.getElementById('nt-privacyManagementTab').selectedIndex=0;
				document.getElementById('notraceprefwin').showPane( document.getElementById('panepersonal') );
			}
		},
		showSecondPanel: function(){
			var label=document.getElementById('nt-lblBehavioralAdvertising');
			if (label.disabled==false){
				document.getElementById('nt-privacyManagementTab').selectedIndex=1;
				document.getElementById('notraceprefwin').showPane( document.getElementById('panepersonal') );
			}
		},
		showThirdPanel: function(){
			var label=document.getElementById('nt-lblAdvertisements');
			if (label.disabled==false){
				document.getElementById('nt-privacyManagementTab').selectedIndex=2;
				document.getElementById('notraceprefwin').showPane( document.getElementById('panepersonal') );
			}
		},
		changeLabelEnabledStatus: function(status){
			document.getElementById('nt-lblPrivacy').disabled=status;
			document.getElementById('nt-lblBehavioralAdvertising').disabled=status;
			document.getElementById('nt-lblAdvertisements').disabled=status;
		},
		disableCustomizedProtection: function(){
			var panel=document.getElementById("customizedProtectionGroup");
			panel.style.display="none";
		},
		enableDisableCustomizedProtection: function(){
			var panel=document.getElementById("customizedProtectionGroup");
			var isEnabled=document.getElementById("level").selectedIndex==3;
			if (!isEnabled){
				panel.style.display="none";
			}
			else {
				if (panel.style.display=="none") {
					panel.style.display="inherit";
					this.livello('5');
					this.hideDialogOptoutList();
					this.onClickRestoreDefaultButton();
					this.selectPaneb('cb1');
					this.calcolaGlobalb('personal');
					this.selectPaneb('cb2');
					this.calcolaGlobalb('tracking');
					this.selectPaneb('cb3');
					this.calcolaGlobalb('annoying');
				}
			}
		},
		enableCheckCustomProtectionOnLoad: function() {
			let liv=isisNoTraceShare.isisNoTraceSharedObjects.prefs.getIntPref("flag");
			let inTraining=isisNoTraceShare.isisNoTraceSharedObjects.prefs.getIntPref("inTraining");
			if (liv=="1")
				isisNoTrace.livello('1');
			else if (liv=="2")
				isisNoTrace.livello('2');
			else if (liv=="3")
				isisNoTrace.livello('3');
			else if(liv=="4") {
				isisNoTrace.livello('4');
				//if (inTraining=="1")
					//isisNoTrace.setRefreshTimer();
			}
			else if (liv=="5") {
				isisNoTrace.livello('5');
				var panel=document.getElementById("customizedProtectionGroup");
				panel.style.display="inherit";
			}
			/*if (document.getElementById("orange").getAttribute("selected")) {
				isisNoTrace.optlist.onoffoptlist('on','0');
				var panel=document.getElementById("optOutList-group");
				var panelHiddenScript=document.getElementById("hiddenScript-group");
				panel.style.display="block";
				panelHiddenScript.style.display="none";
				isisNoTrace.optlist.initoptlist();
			}
			else {
				if (!document.getElementById("black").getAttribute("selected")) {
					var panel=document.getElementById("optOutList-group");
					panel.style.display="none";
				}
			}*/
			isisNoTrace.showNotificationOnLoad();
		},
		showNotificationOnLoad: function() {
			var listener = {
				observe: function(subject, topic, data) {
					if (topic == "alertclickcallback") {
						openWindow2('chrome://notrace/content/options.xul');
					}
				}
			}
		},
		initAbout: function(){
			Components.utils.import("resource://gre/modules/AddonManager.jsm");
			AddonManager.getAddonByID("notrace@unisa.it",function(aAddon) {
				document.getElementById("nt-title").textContent=aAddon.name;
				document.getElementById("nt-version").textContent=aAddon.version;
				document.getElementById("nt-description").textContent=aAddon.description;
				document.getElementById("nt-homepage").textContent=aAddon.homepageURL;
				document.getElementById("nt-homepage").value=aAddon.homepageURL;
				document.getElementById("nt-homepage").href=aAddon.homepageURL;
				//document.getElementById("nt-author").textContent=aAddon.creator;
				document.getElementById("nt-author").textContent="ISISLab, University of Salerno";
				document.getElementById("nt-developers").textContent=aAddon.developers;
				document.getElementById("nt-contributors").textContent=aAddon.contributors;
			});
		},
		initLists: function(){
		    isisNoTraceShare.isisNoTraceSharedObjects.scriptlist.initDB();
            isisNoTraceShare.isisNoTraceSharedObjects.adlist.initDB();
            isisNoTraceShare.isisNoTraceSharedObjects.whitelist.initDB();
		},
		openHTML5Window: function() {
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
			var win = wm.getMostRecentWindow("global:notracehtml5");
			if(win==null){
				var screen_w = screen.width;
				var screen_h = screen.height
				var win_w = screen_w*3/9;
				var win_h = screen_h*3/9;
				var pos_x = (screen_w/2)-(win_w/2);
				var pos_y = (screen_h/2)-(win_h/2);
				window.open("chrome://notrace/content/html5localstorage.xul","","chrome,resizable=1,width="+win_w+",height="+win_h+",screenX="+pos_x+",screenY="+pos_y);
			}
			else{
				win.focus();
			}
		},
		initsharepane: function(){
			var feedbackType=isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("feedbacktype");
			var group=document.getElementById("feedbackgroup");
			var isAnonymous=true;
			if (feedbackType) {
				group.selectedIndex=0;
			}
			else {
				group.selectedIndex=1;
			}
			var feedbackPref=isisNoTraceShare.isisNoTraceSharedObjects.prefs.getBoolPref("feedback");
			var feedbackInterval=isisNoTraceShare.isisNoTraceSharedObjects.prefs.getIntPref("feedbackdaysinterval");
			var chb=document.getElementById("chb_feedback");
			chb.checked=feedbackPref;
			isisNoTrace.updateDataPreview(!feedbackType);
		},
		changeRadioButton: function(notAnonymous){
			var group=document.getElementById("feedbackgroup");
			if (!notAnonymous) {
				group.selectedIndex=0;
			}
			else {
				group.selectedIndex=1;
			}
			isisNoTrace.updateDataPreview(notAnonymous?true:false);
		},
		toHexString: function(charCode){
			return ("0" + charCode.toString(16)).slice(-2);
		},
		updateDataPreview: function(notAnonymous){
			//clean the tree
			var tree = document.getElementById("feedback-treeid");
			var treechildren = document.getElementById("feedback-list");
			while (treechildren.firstChild!=null) {
				treechildren.removeChild(treechildren.firstChild);
			}
			// start to construct the json string
			jsonToSend="{";
			var treechildren2 = document.getElementById("feedback-list");
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
						//temp=Sha1.hash(temp);
					}
					var sep2="";
					jsonToSend+=sep+temp+":{";
					origincell.setAttribute("label",temp);
					origincell.setAttribute("original",temp);
					origincell.setAttribute("id",temp);
					originrow.appendChild(origincell);
					origin.appendChild(originrow);
					treechildren2.appendChild(origin);
					var children = document.createElement("treechildren");
					origin.appendChild(children);
					for (var key in elements[elem]){
						var value = elements[elem][key].length;
						var child = document.createElement("treeitem");
						child.setAttribute("original",value);
						child.setAttribute("id",value);
						var childrow = document.createElement("treerow");
						var childrequestOrigin = document.createElement("treecell");
						childrequestOrigin.setAttribute("label","");
						var childresource = document.createElement("treecell");
						var str=key;
						/*str=str.substring(4,str.length-1);
						if (str.charAt(1)=='('){
							str=str.substring(2,str.length);
						}*/
						childresource.setAttribute("label",str);
						var childtype = document.createElement("treecell");
						childtype.setAttribute("label",value);
						childrow.appendChild(childrequestOrigin);
						childrow.appendChild(childresource);
						childrow.appendChild(childtype);
						child.appendChild(childrow);
						children.appendChild(child);
						jsonToSend+=sep2+str+":"+value;
						sep2=",";
					}
					jsonToSend+="}";
					sep=",";
				}
			}
			jsonToSend+="}";
		},
		send: function (data){
			var req = new XMLHttpRequest();
			var self = this;
			var dest = document.getElementById("feedback-dest").value;
			req.open("POST", dest, true);
			req.setRequestHeader("Content-Type", "text/plain");
			req.setRequestHeader("X-Data-Check", data);
			req.onreadystatechange = function (evt)	{
				if (req.readyState == 4)
					isisNoTraceShare.isisNoTraceSharedObjects.alertsService.showAlertNotification("chrome://notrace/content/imgs/info_24.png", "INFO", isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("feedbacksent.label"), false, "", null, "");
			}
			req.send(data);
		},
	}
}
