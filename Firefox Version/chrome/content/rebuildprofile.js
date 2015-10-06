Components.utils.import("resource://notrace/common.js");
Components.utils.import("resource://notrace/isisNoTraceSharedObjects.js");	
Components.utils.import("resource://notrace/isisLogWrapper.js");


if ("undefined" == typeof(isisNoTrace)) {

	var console = {
	  service: null,
	  log: function(msg) {
		if (!console.service) {
			console.service = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
		}
		console.service.logStringMessage(msg);
	  }
	};
	var isisNoTrace = {
		list:null,
		categories: new Array(),
		finger: "Fingerprinting",
		sensitive: "Sensitive Information",
		pii: "Personal Information",
		defaultList: new Array("doubleclick.net","google-analytics.com","scorecardresearch.com","adnxs.com","yieldmanager.com","2o7.net","crwdcntrl.net","pubmatic.com","2mdn.net","imrworldwide"),
		PII_presence: false,
		Sensitive_presence: false,
		PII_children: null,
		Sensitive_children: null,
		createMenuItemHTML: function(aLabel) {
			const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
			const HTML_NS = "http://www.w3.org/1999/xhtml";
			var parent = document.createElementNS(HTML_NS, "tr");
			var firstChild = document.createElementNS(HTML_NS, "td");
			var secondChild = document.createElementNS(HTML_NS, "li");
			secondChild.value=aLabel;
			firstChild.appendChild(secondChild);
			parent.appendChild(firstChild);
			
			firstChild = document.createElementNS(HTML_NS, "td");
			secondChild = document.createElementNS(XUL_NS, "label");
			secondChild.setAttribute("id",aLabel);
			secondChild.setAttribute("class","text-link");
			secondChild.setAttribute("style","text-decoration:underline;color:blue;margin-left:30px");
			secondChild.addEventListener("click", function (event) { isisNoTrace.changeThirdPartyDomain(aLabel) }, false); 
			secondChild.value=aLabel;
			firstChild.appendChild(secondChild);
			parent.appendChild(firstChild);
			/**
				<html:td><html:li>&NoTraceRebuildProfileDescription2.label;</html:li></html:td>
				<html:td><label id="a1" class="text-link" style="text-decoration:underline;color:blue;margin-left:30px" value="0" onclick="isisNoTrace.openDialogReferer();"/></html:td>
			*/
			return parent;
		},
		createMenuItem: function(aLabel) {
			const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
			var firstChild = document.createElementNS(XUL_NS, "label");
			firstChild.setAttribute("id",aLabel);
			firstChild.setAttribute("class","text-link");
			firstChild.setAttribute("style","text-decoration:underline;color:blue;margin-left:30px");
			firstChild.addEventListener("click", function (event) { isisNoTrace.changeThirdPartyDomain(aLabel) }, false); 
			firstChild.value=aLabel;
			/**
				<html:td><html:li>&NoTraceRebuildProfileDescription2.label;</html:li></html:td>
				<html:td><label id="a1" class="text-link" style="text-decoration:underline;color:blue;margin-left:30px" value="0" onclick="isisNoTrace.openDialogReferer();"/></html:td>
			*/
			return firstChild;
		},
		
		getDefaultList: function() {
			return isisNoTrace.defaultList;
		},
		refresh: function() {
			// svuoto i due pannelli principali
			for (var i=1; i<10;i++) {
				if(typeof document.getElementById("domain"+i) != 'undefined') {
					//console.log("Removed DOMAIN "+document.getElementById("domain"+i).value);
					document.getElementById("domain"+i).value="";
				}
			}
			for (var i=1;i<10;i++) {
				if(typeof document.getElementById("domain"+(i+10)) != 'undefined') {
					//console.log("Removed DOMAIN "+document.getElementById("domain"+(i+10)).value);
					document.getElementById("domain"+(i+10)).value="";
				}
			}
			//svuoto il titolo del nuovo albero
			document.getElementById("notrace-treeLabel").value="";
			
			//svuto il contenuto degli alberi delle finestre
			var panelAwareness=document.getElementById("hiddenAwareness-group");
			//console.log("SHOULD BE REMOVING EVEYTHING "+panelAwareness.style.display);
			if (panelAwareness.style.display=="block" || panelAwareness.style.display=="none"){
				panelAwareness.style.display="none";
				var element=document.getElementById("childreeenAwareness");
				while (element.firstChild) {
					element.removeChild(element.firstChild);
				}
			}	
			this.setTreeHiddenAwarenessWindowSize();
			this.cleanTree();
			//console.log("DENTRO REFRESH - EVERYTHING SHOULD BE REMOVED");
			this.onload();
		},
		onload: function() {
		    // getTop10AggregatorsHashMaps
		    /*document.getElementById("domain1").value="doubleclick.net";
		    document.getElementById("domain2").value="google-analytics.com";
		    document.getElementById("domain3").value="scorecardresearch.com";
		    document.getElementById("domain4").value="adnx.com";
		    document.getElementById("domain5").value="yieldmanager.com";*/
			var thirdPartyDomainsList=document.getElementById("thirdpartyaggregatorslist");
			isisNoTrace.list=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getTop10AggregatorsHashMaps();
			for (var i=1; i<=isisNoTrace.list.length && i<10;i++) {
				if(typeof isisNoTrace.list[i-1].key != 'undefined') {
				    //if (!isisNoTrace.list[i-1].key.match("doubleclick\.net|oogle-analytics\.com|scorecardresearch\.com|adnx\.com|yieldmanager\.com")) {
					   document.getElementById("domain"+i).value=isisNoTrace.list[i-1].key;
					   //console.log("ADDED DOMAIN "+isisNoTrace.list[i-1].key);
				    //}					
				}
			}
			isisNoTrace.listTTP=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.getTop10TrustedThirdPartyHashMaps();
			for (var i=1; i<=isisNoTrace.listTTP.length && i<10;i++) {
				if(typeof isisNoTrace.listTTP[i-1].key != 'undefined') {
					document.getElementById("domain"+(i+10)).value=isisNoTrace.listTTP[i-1].key;
					//console.log("ADDED DOMAIN2 "+isisNoTrace.listTTP[i-1].key);
				}
			}
			this.setTreeHiddenAwarenessWindowSize();
		},
		setTreeHiddenAwarenessWindowSize: function(){
			var w = screen.width;
			var h = screen.height;
			var tree = document.getElementById("awarenessTree");
			var box = document.getElementById("hiddenAwareness-group");
			tree.setAttribute("width",510);
			box.setAttribute("width",500);
		},
		cleanTree: function() {
			var element=document.getElementById("childreeenAwareness");
			while (element.firstChild) {
				element.removeChild(element.firstChild);
			}
		},
		openDomainsDetails: function(indexDomain){
			this.PII_presence=false;
			this.Sensitive_presence=false;
			this.PII_children=null;
			this.Sensitive_children=null;
			var hashForNoDuplicates=new Object();
			var hashForRequests=new Object();
			var counterRequest=1;
			this.setTreeHiddenAwarenessWindowSize();
			this.cleanTree();
			// Variables to assert that there are no duplicated resources
			var key=document.getElementById("domain"+indexDomain).value;
			var hashNoDuplicates=new Object();
			var hashNoDuplicatedEntry=new Object();
			//
			// Update the label ahead the tree
			document.getElementById("notrace-treeLabel-pre").value=isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("what.label");
			document.getElementById("notrace-treeLabel").value=key;
			document.getElementById("notrace-treeLabel-post").value=isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("knowaboutyou.label");
			var listCaptured;
			if (indexDomain>10) {
				indexDomain=indexDomain-10;
				listCaptured=isisNoTrace.listTTP[indexDomain-1].array;
			}
			else {
				listCaptured=isisNoTrace.list[indexDomain-1].array;
			}
			var size=listCaptured.length;
			
			var valueLeaked=null;
			var infoLeaked=null;
			var category=null;
			var temp=null;
			if (this.categories.length==0) {
				this.categories[0]=this.pii;
				this.categories[1]=this.sensitive;
			}
			for(var j=0;j<size;j++){
			    // Check for personal information
				for (elem in isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashForLeakedInformation.personal) {
					var regexp=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashForLeakedInformation.personal[elem];
					var result=listCaptured[j].resource.match(regexp);
					if (result!=null && result.length>0) {
						if (!hashNoDuplicates.hasOwnProperty(key)) {
							hashNoDuplicates[key]=new Object();
						}
						if (hashNoDuplicates[key].hasOwnProperty(elem)) {
							if (hashNoDuplicates[key][elem]==result[0]) {
								continue;
							}
						}
						else {
							hashNoDuplicates[key][elem]=result[0];
						}
						infoLeaked=elem;
						valueLeaked=result[1];
						if(typeof valueLeaked == 'undefined') {
							valueLeaked=result[0];
						}
						valueLeaked=this.checkAndReplaceUnescapedStrings(valueLeaked);
						valueLeaked=valueLeaked.substring(valueLeaked.lastIndexOf("=")+1);
					}
					if (infoLeaked!=null) {
						this.checkAndInsertPIILabel();
						var childresource=document.getElementById(infoLeaked);
						if (childresource) {
							childresource.setAttribute("label",valueLeaked);
						}
						else {
							var child = document.createElement("treeitem");
							var childrow = document.createElement("treerow");
							var childrequestOrigin = document.createElement("treecell");
							childrequestOrigin.setAttribute("label",isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage(infoLeaked+".label"));
							var childresource = document.createElement("treecell");
							childresource.setAttribute("id",infoLeaked);
							childresource.setAttribute("label",valueLeaked);
							var childtype = document.createElement("treecell");
							childrow.appendChild(childrequestOrigin);
							childrow.appendChild(childresource);
							childrow.appendChild(childtype);
							child.appendChild(childrow);
							this.PII_children.appendChild(child);	
						}
						valueLeaked=null;
						infoLeaked=null;
						category=null;
					}
				}
				// Check for sensitive information
				for (elem in isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashForLeakedInformation.sensistive) {
                    var regexp=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashForLeakedInformation.sensistive[elem];
                    var result=listCaptured[j].resource.match(regexp);
                    if (result!=null && result.length>0) {
                        if (!hashNoDuplicates.hasOwnProperty(key)) {
                            hashNoDuplicates[key]=new Object();
                        }
                        if (hashNoDuplicates[key].hasOwnProperty(elem)) {
                            if (hashNoDuplicates[key][elem]==result[0]) {
                                continue;
                            }
                        }
                        else {
                            hashNoDuplicates[key][elem]=result[0];
                        }
                        infoLeaked=elem;
                        valueLeaked=result[1];
                        if(typeof valueLeaked == 'undefined') {
                            valueLeaked=result[0];
                        }
                        valueLeaked=this.checkAndReplaceUnescapedStrings(valueLeaked);
                        valueLeaked=valueLeaked.substring(valueLeaked.lastIndexOf("=")+1);
                    }
                    if (infoLeaked!=null) {
                        this.checkAndInsertSensitiveLabel();
                        var childresource=document.getElementById(infoLeaked);
                        if (childresource) {
                            childresource.setAttribute("label",valueLeaked);
                        }
                        else {
                            var child = document.createElement("treeitem");
                            var childrow = document.createElement("treerow");
                            var childrequestOrigin = document.createElement("treecell");
                            childrequestOrigin.setAttribute("label",isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage(infoLeaked+".label"));
                            var childresource = document.createElement("treecell");
                            childresource.setAttribute("id",infoLeaked);
                            childresource.setAttribute("label",valueLeaked);
                            var childtype = document.createElement("treecell");
                            childrow.appendChild(childrequestOrigin);
                            childrow.appendChild(childresource);
                            childrow.appendChild(childtype);
                            child.appendChild(childrow);
                            this.Sensitive_children.appendChild(child);   
                        }
                        valueLeaked=null;
                        infoLeaked=null;
                        category=null;
                    }
                }
			}
			//}
			for(var j=0;j<size;j++){
				var elem=null;
				//console.log("INIZIO: "+listCaptured[j].loc_domain+"----"+listCaptured[j].referer+"---->"+listCaptured[j].resource);
				var elem="terms";
				//listCaptured[j]=this.escape(listCaptured[j]);
				if (listCaptured[j].referer) {
					if (!hashNoDuplicates.hasOwnProperty(key)) {
						hashNoDuplicates[key]=new Object();
					}
					if (hashNoDuplicates[key].hasOwnProperty(elem)) {
						if (hashNoDuplicates[key][elem]==listCaptured[j].resource) {
							continue;
						}
					}
					else {
						hashNoDuplicates[key][elem]=listCaptured[j].resource;
					}
					var temp=listCaptured[j].referer;
					temp=temp.replace(/^http(s)?:\/\//gi,"");
					temp=temp.replace(/^www\./gi,"");
					var array_temp=temp.match(/(.*?)\//i);
					var host_temp=array_temp[0];
					temp=temp.replace(/.*?\/(.*)/gi,"$1");
					infoLeaked=elem;
					valueLeaked=temp;
					if (valueLeaked==null || valueLeaked=="") {valueLeaked=host_temp;}
					valueLeaked=this.checkAndExtractMeaningfulWordFromURL(valueLeaked, 4);
					if(typeof(valueLeaked) == 'undefined' || valueLeaked=="") {
						infoLeaked=null;
					}
					//console.log("STAMPAPRIMA: "+listCaptured[j].referer+"----->"+infoLeaked+"-----"+valueLeaked+"-----"+typeof(valueLeaked));
					if (infoLeaked!=null && !hashNoDuplicatedEntry.hasOwnProperty(valueLeaked)) {
						hashNoDuplicatedEntry[valueLeaked]=valueLeaked;
						var regexp=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashForLeakedInformation.travel["roundtrip"];
						var result=listCaptured[j].referer.match(regexp);
						if (result!=null && result.length>0) {
							var regexp=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashForLeakedInformation.travel["isp"];
							var result=listCaptured[j].referer.match(regexp);
							if (result!=null && result.length>0) {
								this.checkAndInsertSensitiveLabel();
								// var childresource=document.getElementById(infoLeaked);
								// if (childresource) {
									// valueLeaked=this.mergeTwoString(childresource.getAttribute("label"),valueLeaked);
									// childresource.setAttribute("label",valueLeaked);
								// }
								// else {
								var child = document.createElement("treeitem");
								var childrow = document.createElement("treerow");
								var childrequestOrigin = document.createElement("treecell");
								childrequestOrigin.setAttribute("label",isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage(infoLeaked+".label"));
								//console.log("REF: "+listCaptured[j].loc_domain+"----"+listCaptured[j].referer+"---->"+listCaptured[j].resource);
								var childresource = document.createElement("treecell");
								//childresource.setAttribute("id",infoLeaked);
								childresource.setAttribute("label",valueLeaked);
								var childtype = document.createElement("treecell");
								childrow.appendChild(childrequestOrigin);
								childrow.appendChild(childresource);
								childrow.appendChild(childtype);
								child.appendChild(childrow);
								this.Sensitive_children.appendChild(child);	
								valueLeaked=null;
								infoLeaked=null;
								category=null;
							}
							// }
						}
						else {
							this.checkAndInsertSensitiveLabel();
							// var childresource=document.getElementById(infoLeaked);
							// if (childresource) {
								// valueLeaked=this.mergeTwoString(childresource.getAttribute("label"),valueLeaked);
								// childresource.setAttribute("label",valueLeaked);
							// }
							// else {
							var child = document.createElement("treeitem");
							var childrow = document.createElement("treerow");
							var childrequestOrigin = document.createElement("treecell");
							childrequestOrigin.setAttribute("label",isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage(infoLeaked+".label"));
							//console.log("REF: "+listCaptured[j].loc_domain+"----"+listCaptured[j].referer+"---->"+listCaptured[j].resource);
							var childresource = document.createElement("treecell");
							//childresource.setAttribute("id",infoLeaked);
							childresource.setAttribute("label",valueLeaked);
							var childtype = document.createElement("treecell");
							childrow.appendChild(childrequestOrigin);
							childrow.appendChild(childresource);
							childrow.appendChild(childtype);
							child.appendChild(childrow);
							this.Sensitive_children.appendChild(child);	
							valueLeaked=null;
							infoLeaked=null;
							category=null;
						}
					}
				}
				else {
					//no field referer, but another URL is present on the URL for the aggregator
					if (listCaptured[j].resource.match(/^http.+http/gi)) {
						//console.log("DENTRO: "+listCaptured[j].resource);
						if (!hashNoDuplicates.hasOwnProperty(key)) {
							hashNoDuplicates[key]=new Object();
						}
						if (hashNoDuplicates[key].hasOwnProperty(elem)) {
							continue;
						}
						else {
							hashNoDuplicates[key][elem]=listCaptured[j].resource;
						}
						var temp=listCaptured[j].resource;
						temp=temp.replace(/^http(s)?:\/\//gi,"");
						temp=temp.replace(/^www\./gi,"");
						temp=temp.replace(/.*?\/(.*)/gi,"$1");
						infoLeaked=elem;
						valueLeaked=temp;
						valueLeaked=this.checkAndExtractMeaningfulWordFromURL(valueLeaked, 4);
						if(valueLeaked==null || valueLeaked=="") {
							infoLeaked=null;
						}
						//console.log("STAMPASECONDA: "+listCaptured[j].resource+"----->"+infoLeaked+"-----"+valueLeaked);
						if (infoLeaked!=null && !hashNoDuplicatedEntry.hasOwnProperty(valueLeaked)) {
							hashNoDuplicatedEntry[valueLeaked]=valueLeaked;
							this.checkAndInsertSensitiveLabel();
							var child = document.createElement("treeitem");
							var childrow = document.createElement("treerow");
							var childrequestOrigin = document.createElement("treecell");
							childrequestOrigin.setAttribute("label",isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage(infoLeaked+".label"));
							//console.log("no ref: "+listCaptured[j].loc_domain+"----"+listCaptured[j].referer+"---->"+listCaptured[j].resource);
							var childresource = document.createElement("treecell");
							//childresource.setAttribute("id",infoLeaked);
							childresource.setAttribute("label",valueLeaked);
							var childtype = document.createElement("treecell");
							childrow.appendChild(childrequestOrigin);
							childrow.appendChild(childresource);
							childrow.appendChild(childtype);
							child.appendChild(childrow);
							this.Sensitive_children.appendChild(child);	
							valueLeaked=null;
							infoLeaked=null;
							category=null;
						}
					}
				}
				for (elem in isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashForLeakedInformation.travel) {
					var regexp=isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.hashForLeakedInformation.travel[elem];
					if (!listCaptured[j].referer) continue;
					//console.log("REFERER: "+listCaptured[j].loc_domain+"-----"+listCaptured[j].referer);
					var result=listCaptured[j].referer.match(regexp);
					if (result!=null && result.length>0) {
						if (!hashNoDuplicates.hasOwnProperty(key)) {
							hashNoDuplicates[key]=new Object();
						}
						if (hashNoDuplicates[key].hasOwnProperty(elem)) {
							continue;
						}
						else {
							hashNoDuplicates[key][elem]=result[0];
						}
						infoLeaked=elem;
						valueLeaked=result[1];
						if(typeof valueLeaked == 'undefined') {
							valueLeaked=result[0];
						}
						if (elem=="leave" || elem=="arrive") {
							valueLeaked=this.checkAndExtractDate(valueLeaked);
						}
						else {
							valueLeaked=this.checkAndReplaceUnescapedStrings(valueLeaked);
							valueLeaked=valueLeaked.substring(valueLeaked.indexOf("=")+1);
						}
						//console.log("FOUND TRAVEL: "+infoLeaked+"---->"+valueLeaked+"----"+result[0]+"-----"+result[1]);
					}
					/*else {
						if (valueLeaked && valueLeaked!="") valueLeaked=this.checkAndExtractMeaningfulWordFromURL(listCaptured[j].referer);
					}*/
					if (infoLeaked!=null && !hashNoDuplicatedEntry.hasOwnProperty(valueLeaked)) {
						hashNoDuplicatedEntry[valueLeaked]=valueLeaked;
						/*if (elem!="leave" && elem!="arrive" && elem!="origin" && elem!="destination") {
							valueLeaked=this.checkAndExtractMeaningfulWordFromURL(valueLeaked, 4);
						}*/
						this.checkAndInsertSensitiveLabel();
						var childresource=document.getElementById("travel");
						if (childresource) {
							//console.log("PRIMA: "+valueLeaked);
							valueLeaked=this.mergeTwoString(childresource.getAttribute("label"),valueLeaked);
							//console.log("DOPO: "+valueLeaked);
							childresource.setAttribute("label",valueLeaked);
						}
						else {
							var child = document.createElement("treeitem");
							var childrow = document.createElement("treerow");
							var childrequestOrigin = document.createElement("treecell");
							childrequestOrigin.setAttribute("label",isisNoTraceShare.isisNoTraceSharedObjects.common.getLocalizedMessage("terms"+".label"));
							//console.log("INIZIO: "+listCaptured[j].loc_domain+"----"+listCaptured[j].referer+"---->"+listCaptured[j].resource);
							var childresource = document.createElement("treecell");
							childresource.setAttribute("id","travel");
							childresource.setAttribute("label",valueLeaked);
							var childtype = document.createElement("treecell");
							childrow.appendChild(childrequestOrigin);
							childrow.appendChild(childresource);
							childrow.appendChild(childtype);
							child.appendChild(childrow);
							this.Sensitive_children.appendChild(child);	
							valueLeaked=null;
							infoLeaked=null;
							category=null;
						}
					}
				}
			}
			var panelAwareness=document.getElementById("hiddenAwareness-group");
			if (panelAwareness.style.display=="none"){
				panelAwareness.style.display="block";
			}
		},
		checkAndInsertPIILabel: function(){
			if (!this.PII_presence) {
				var treechildren1 = document.getElementById("childreeenAwareness");
				var origin = document.createElement("treeitem");
				origin.setAttribute("container",true);
				origin.setAttribute("open",true);
				var originrow = document.createElement("treerow");
				var origincell = document.createElement("treecell");
				origincell.setAttribute("label",this.pii);
				originrow.appendChild(origincell);
				origin.appendChild(originrow);
				treechildren1.appendChild(origin);
				this.PII_children = document.createElement("treechildren");
				origin.appendChild(this.PII_children);
				this.PII_presence=true;
			}
		},
		checkAndInsertSensitiveLabel: function(){
			if (!this.Sensitive_presence) {
				var treechildren1 = document.getElementById("childreeenAwareness");
				var origin = document.createElement("treeitem");
				origin.setAttribute("container",true);
				origin.setAttribute("open",true);
				var originrow = document.createElement("treerow");
				var origincell = document.createElement("treecell");
				origincell.setAttribute("label",this.sensitive);
				originrow.appendChild(origincell);
				origin.appendChild(originrow);
				treechildren1.appendChild(origin);
				this.Sensitive_children = document.createElement("treechildren");
				origin.appendChild(this.Sensitive_children);
				this.Sensitive_presence=true;
			}
		},
		checkAndReplaceUnescapedStrings: function(str){
			str=str.replace(/%3D/gi,"=");//e%3Dgabriella.schizzetta%2540gmail.com%26
			str=str.replace(/%253D/gi,"=");
			str=str.replace(/%2540/gi,"@");
			str=str.replace(/%252540/gi,"@");
			str=str.replace(/%26/gi,"&");
			str=str.replace(/%2526/gi,"&");
			str=str.replace(/%20/gi," ");
			str=str.replace(/%2B/gi,"");
			str=str.replace(/%252B/gi,"");
			str=str.replace(/&ln=/gi," ");
			str=str.replace(/&$/gi,"");
			str=str.replace(/\+/gi," ");
			str=str.replace(/-/gi,"");
			str=str.replace(/_/gi,"");
			str=str.replace(/%2F/gi,"");// /
			return str;
		},
		checkAndExtractPassedURL: function(str) {
			var result=str.match(/(http(s)?%3A%2F%2F.*?)&/gi);
			if (result!=null && result.length>0) {
				var array=new Array();
				var referer=result[0];
				referer.replace(/%3A/gi,":");
				referer.replace(/%2F/gi,"/");
				str=str.replace(/%3D/gi,"=");
				str=str.replace(/%3F/gi,"?");
				str=str.replace(/%2520/gi," ");
				var host=this.getServer(str);
				var array=str.match(/\w+/gi);
				array.push(host);
				return array.join(", ");
				//http%3A%2F%2Fwww.webmd.com%2Fsearch%2Fsearch_results%2Fdefault.aspx%3Fquery%3Dbreast%2520cancer&
			}
			return str;
		},
		unique: function(arrayParam) {
		    var array = arrayParam.concat();
            for(var i=0; i<array.length; ++i) {
                for(var j=i+1; j<array.length; ++j) {
                    if(array[i] === array[j])
                        array.splice(j--, 1);
                }
            }
            return array;
    },
		mergeTwoString: function(string1, string2) {
			//console.log(string1+"----"+string2);
			var array1=string1.split(", ");
			var array2=string2.split(", ");
			/**
			 *  It appears that an extension of a built-in JS type was made. This is not allowed for security and compatibility reasons. 
			 *  Therefore the "unique" function has been defined as a function of this class.
			 * */
			var array3=unique(array1.concat(array2));
			var str=array3.join(", ");
			return str.replace(", , ",", ");
		},
		
		/**
		 *  This function return true only when the words passed as parameters has more than 3 consecutive vowels 
		 *  or more than 4 consecutive consonants. In these cases the word is not considered as leakage
		 *  */
		checkWordQuality: function(word){
		    word = word.toLowerCase();
		    var vowels = 0;
		    var consonants = 0;
		    for (var i=0; i<word.length; i++) {
		        switch (word[i]) {
		            case 'a':
		              vowels++;
		              consonants = 0;
		              break;
		            case 'e':
                      vowels++;
                      consonants = 0;
                      break;
                    case 'i':
                      vowels++;
                      consonants = 0;
                      break;
                    case 'o':
                      vowels++;
                      consonants = 0;
                      break;
                    case 'u':
                      vowels++;
                      consonants = 0;
                      break;
                    default: 
                        consonants++;
                        vowels = 0;
		        }
		        if (vowels > 2 || consonants > 3) {
		            return true;
		        }
		    }
		    return false;
		},
		checkAndExtractMeaningfulWordFromURL: function(url, len) {
			var string1="";
			//url=this.checkAndReplaceUnescapedStrings(url);
			var temphash=new Object();
			var rawArray=url.match(/\b([A-Za-z]+)\b(?![=%,])/gi);
			//var rawArray=url.match(/\b([A-Za-z]+)\b/gi);
			// If there is at least one element in the array
			if (rawArray) {
				for (var i=0; i<rawArray.length;i++) {
					if (rawArray[i].match(/[a-z][A-Z]/)) {
						rawArray.splice(i,1);
						i--;
						continue;
					}
					//else {
						if ((rawArray[i].length<len) || (rawArray[i].match(isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.regexp_stopword))) {
							rawArray.splice(i,1);
							i--;
							continue;
						}
						else {
						    //isisLogWrapper.logToConsole("Inside: "+rawArray[i]+"------"+this.checkWordQuality(rawArray[i]));
						    if ((rawArray[i].length<len) || (this.checkWordQuality(rawArray[i]))) {
                                rawArray.splice(i,1);
                                i--;
                                continue;
                            }
                            else {
                                if (temphash.hasOwnProperty(rawArray[i])) {
                                    rawArray.splice(i,1);
                                    i--;
                                    continue;
                                }
                                else {
                                    temphash[rawArray[i]]=null;
                                }
                            }
						}
					//}
				}
				string1=rawArray.join(", ");
			}
			var string2="";
			var rawArrayOther=url.match(/(%2f|-|_)([A-Za-z]+)/gi);
			if (rawArrayOther) {
				for (var i=0; i<rawArrayOther.length;i++) {
					rawArrayOther[i]=this.checkAndReplaceUnescapedStrings(rawArrayOther[i]);
					if (rawArrayOther[i].match(/[a-z][A-Z]/)) {
						rawArrayOther.splice(i,1);
						i--;
						continue;
					}
					if ((rawArrayOther[i].length<len) || (rawArrayOther[i].match(isisNoTraceShare.isisNoTraceSharedObjects.internalLogger.regexp_stopword))) {
						rawArrayOther.splice(i,1);
						i--;
					}
					else {
						if (temphash.hasOwnProperty(rawArrayOther[i])) {
							rawArrayOther.splice(i,1);
							i--;
						}
						else {
							temphash[rawArrayOther[i]]=null;
						}
					}
				}
				string2=rawArrayOther.join(", ");
			}
			return string1+(string1.length>0 && string2.length>0?", ":"")+string2;
		},
		checkAndExtractDate: function(params) {
			var newString="";
			newString=params.replace(/\&(leave|ret)day=(\d+)\&(leave|ret)month=(\d+)%2F(\d+)\&(leave|ret)time=(\w+)\&/,"$2-$4-$5 $7");
			return newString;
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
		dettagli: function(){
			window.open("chrome://notrace/content/leakedterms.xul","","chrome");
		}
	};
};