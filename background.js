//lo uso per prendere quello che ho mandato
var inMemoryRequestHeaders = null;
var tabUrl = null;

/* Per vedere se la tecnica nocookie è abilitata, non facciamo il controllo ogni volta
/* prima di inviare gli headers, bensì sfruttiamo l'API ContentSettings di Google, in base
/* alla quale indichiamo una sola volta se vogliamo abilitare o meno i cookie. In particolare
/* tale preferenza la ricaviamo nel momento in cui l'utente modifica le tecniche da applicare
/* nella finestra di NoTrace e poi preme Ok per salvare. Il controllo verrà fatto nel file
/* options.js. Lo script verifica se la casella è spuntata e manda un messaggio al background.
/* Discorso analogo viene fatto per nojs, che disabilita l'esecuzione di tutti gli script Javascript. */
/* 
/* TECNICHE TRATTATE:
/*
/* nometaredirectandcookie
/* nocookie
/* nojs
/* nojscookie
/* no3cookie
*/
chrome.runtime.onMessage.addListener (
	function (request, sender, sendResponse) {
		// Innanzitutto dobbiamo vedere da quale script è partito il messaggio,
		// poichè, in base a questo, possiamo sapere cosa è contenuto in request
		if (request.callerScript == 'contentScript') {
			if (request.method == 'metaredirectandcookie') { // Per la tecnica metaredirectandcookie
				addToBlockedList('nometaredirectandcookie', request.list);
			}
		}
		else if (request.callerScript == 'options') {
			if (request.tech == 'cookie') { // L'utente vuole disabilitare tutti i cookie
				chrome.contentSettings.cookies.set({
					'primaryPattern': '*://*/*',
					'setting': request.setting
				}
				);
			}
			else if (request.tech == 'js'){ // L'utente vuole disabilitare le esecuzioni di tutti gli Javascript
				chrome.contentSettings.javascript.set({
					'primaryPattern': '*://*/*',
					'setting': request.setting
				}
				);
			}
			else if (request.tech == '3cookie') { // L'utente vuole disabilitare i cookie di terze parti
				chrome.privacy.websites.thirdPartyCookiesAllowed.set({value: Boolean(request.setting)});	
			}
		}
		else if (request.callerScript == 'nojscookie') {
			addToBlockedObject('nojscookie', request.cookieDomain, request.cookie);
		}
		else if (request.callerScript == 'no3cookie') {
			addToBlockedObject('no3cookie', request.cookieDomain, request.cookie);
		}
	}
);

chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
	
	var requestHeaders = details.requestHeaders;
	var redirectTo = nofingerprinting(details, tabUrl);
	var blockingResponse = {};
	
	// Salvo l'URL della pagina, così come viene mostrato nella barra
	// degli indirizzi del tab dal quale è partita la richiesta.
	// Mi servirà nel fingerprinting, quando devo vedere se il dominio
	// della richiesta coincide col dominio della pagina presente nel
	// tab visualizzato.
	chrome.tabs.get(details.tabId, function (tab) {
		tabUrl = tab.url;
	});
	
	/* CONTROLLI PRESENZA URL IN WHITELIST O BLACKLIST */
	
	// Controllo se l'URL DELLA RICHIESTA, NON QUELLO DEL TAB, è nella whitelist
	if (isInWhiteList(getDomainFromUrl(details.url))) {
		return blockingResponse;
	} 
	
	// Controllo se è in blacklist
	if (isInBlackList(details.url)) {
		removeFromBlackList(details.url); // Cancello l'elemento dalla blacklist e...
		return {cancel: true}; // ...blocco la richiesta
	}
	
	/* CONTROLLO LE TECNICHE APPLICABILI TRA: 
	/* notop:					filtra le richieste ai top-10 domini di terze parti;
    /* noad:					rimuove gli oggetti di advertisement;
	/* no3pe:					filtra le richieste per siti di terze parti
	/* no3objnoid:				filtra le richieste per siti di terze parti che trasmettono info personali
	/* noidheader:				rimuove info personali dall'header, ossia: User-Agent, From, Host, Referer e Cookie
	/* nofingerprinting:		rimuove info identificanti dell'utente dall'URL della richiesta
	/* no3img:					cancella richieste di immagini verso siti di terze parti
	/* noimg:					cancella le richieste per qualsiasi immagine
	/* no3hiddenobj:			rimuove le esecuzioni di Javascript di reti di advertisement
	/* no3js:					disabilita l'esecuzione di tutti i codici Javascript di terze parti
	*/
	
	// La prima funzione controlla se la tecnica è abilitata, la seconda la applica
	if(isNotop() && notop(details)) {
		addToBlockedObject("notop", getDomainFromUrl(details.url), details.url);
		return {cancel: true};
	}
  
	if(isNoad() && noad(details)) {
		addToBlockedObject("noad", getDomainFromUrl(details.url), details.url);
		return {cancel: true};
	}
  
	if(isNo3pe() && no3pe(details, tabUrl)) {
		addToBlockedObject("no3pe", getDomainFromUrl(details.url), details.url);
		return {cancel: true};
	}
  
	if(isNo3objnoid() && no3objnoid(details)) {
		addToBlockedObject("no3objnoid", getDomainFromUrl(details.url), details.url);
		return {cancel: true};
	}
	
	if (redirectTo != null) {
		return {redirectUrl : redirectTo};
	}
  
	if (isNoidheader()) {
		requestHeaders = noidheader(requestHeaders);
		addToBlockedObject("noidheader", getDomainFromUrl(details.url), details.url);
	}
  
	if (isNofingerprinting()) {
		requestHeaders = nofingerprintinguseragent(details, tabUrl, requestHeaders);
		addToBlockedObject("nofingerprinting", getDomainFromUrl(details.url), details.url);
	}
	
	if(isNo3img() && no3img(details, tabUrl)) { // Cancello le richieste di immagini verso siti di terze parti
		addToBlockedObject("no3img", getDomainFromUrl(details.url), details.url);
		return {cancel: true};
	}
	
	if(isNoimg() && noimg(details)){ // Cancello le richieste di QUALSIASI immagine
		addToBlockedObject("noimg", getDomainFromUrl(details.url), details.url);
		return {cancel: true};
	}
	
	if(isNo3hiddenobj() && no3hiddenobj(details)){
		addToBlockedObject("no3hiddenobj", getDomainFromUrl(details.url), details.url);
		return {cancel: true};
	}
	
	if (isNo3js() && no3js(details, tabUrl)) {
		addToBlockedObject("no3js", getDomainFromUrl(details.url), details.url);
		return {cancel: true};
	}
  
	// Tengo in memoria i requestHeader, mi serviranno dopo
	inMemoryRequestHeaders = requestHeaders;
  
	// restituisco la blocking response
	blockingResponse.requestHeaders = requestHeaders;
	
	return blockingResponse;
}, 
{urls: ["<all_urls>"]}, 
['requestHeaders', 'blocking']
);

chrome.webRequest.onHeadersReceived.addListener(function(details){
  var responseHeaders = details.responseHeaders, blockingResponse = {};
  
	/* CONTROLLO LE TECNICHE APPLICABILI TRA: 
	/* noadnetwcookie:	rimuove i cookie settati da ad-networks
	*/
	
	// DA COMPLETARE!
	/*if (isNoadnetwcookie()) {
		responseHeaders = noadnetwcookie(responseHeaders);
	}*/

  // restituisco la blocking response
  blockingResponse.responseHeaders = responseHeaders;
  
  return blockingResponse;
},
{urls: [ "<all_urls>" ]},['responseHeaders','blocking']);

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {

  if(request.method == 'getLocalStorage'){
    sendResponse({data: localStorage});
  } else if(request.method == 'addToBlockedList'){
    for(var i=0; i<request.list.length; i++){
      addToBlockedObject(request.type, getDomainFromUrl(request.list[i]), request.list[i]);
    }
  } else if(request.method == 'addToBlackList'){
    for(var i=0; i<request.list.length; i++){
	  addToBlackList(request.list[i]);
    }
  }
  // discernere sulla richiesta fatta
});

function show_options() {
  chrome.tabs.getSelected(null, function(tab) {
    if (window.testUrl == "") {
      window.testUrl = tab.url;
    }
    var tabs = chrome.extension.getViews({"type": "tab"});
    if (tabs && tabs.length) {
      // To avoid "Uncaught TypeError: Object Window has no method
      // 'setUrl' ". Sometimes tabs are not the desired extension tabs.
      if (tabs[0].$suburl != undefined) {
        tabs[0].setUrl(testUrl);
      }
      var optionsUrl = chrome.extension.getURL("options.html");
      chrome.tabs.getAllInWindow(null, function(all) {
        for (var i = 0; i < all.length; i++) {
          if (all[i].url == optionsUrl) {
            chrome.tabs.update(all[i].id, {selected: true});
            return;
          }
        }
      });
    } else {
      chrome.tabs.create({"url":"options.html"});
    }
  });
}

chrome.browserAction.onClicked.addListener(show_options);
		
		