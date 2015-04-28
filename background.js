//lo uso per prendere quello che ho mandato
var inMemoryRequestHeaders = null;
var tabUrl = null;

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
	/* notop:			filtra le richieste ai top-10 domini di terze parti;
    /* noad:			rimuove gli oggetti di advertisement;
	/* no3pe:			filtra le richieste per siti di terze parti
	/* no3objnoid:		filtra le richieste per siti di terze parti che trasmettono info personali
	/* no3cookie:		disabilita i cookie di terze parti
	/* noidheader:		rimuove info personali dall'header, ossia: User-Agent, From, Host, Referer e Cookie
	/* nofingerprinting:rimuove info identificanti dell'utente dall'URL della richiesta
	/* nojs:			disabilita l'esecuzione di tutti i codici Javascript
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
  
	if (isNo3cookie()) {
		requestHeaders = no3cookie(details, requestHeaders);
		addToBlockedObject("no3cookie", getDomainFromUrl(details.url), details.url);
	}
  
	if (isNoidheader()) {
		requestHeaders = noidheader(requestHeaders);
		addToBlockedObject("noidheader", getDomainFromUrl(details.url), details.url);
	}
  
	if (isNofingerprinting()) {
		requestHeaders = nofingerprintinguseragent(details, tabUrl, requestHeaders);
		addToBlockedObject("nofingerprinting", getDomainFromUrl(details.url), details.url);
	}
	
	if (isNojs()) { // Non voglio permettere l'esecuzione di codice Javascript, quindi...
		addToBlockedObject("nojs", getDomainFromUrl(details.url), details.url);
		var toBlock = nojs(details); // ...toBlock sarà a true se si tratta di una richiesta di uno script, false altrimenti
		return {cancel: toBlock};
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

  log("START ONHEADERS-RECEIVED URL: " + details.url);
  var responseHeaders = details.responseHeaders, blockingResponse = {};

  if (isNocookie()){
    responseHeaders = nocookie(inMemoryRequestHeaders, responseHeaders);
	addToBlockedObject("nocookie", getDomainFromUrl(details.url), details.url);
  }

  if(isNoimg() && noimg(details)){
    // blocco la richiesta
    log("STOP ONHEADERS-RECEIVED NOIMG URL: " + details.url);
	addToBlockedObject("noimg", getDomainFromUrl(details.url), details.url);
    return {cancel: true};
  }

  if(isNo3img() && no3img(details, tabUrl)){
    log("STOP ONHEADERS-RECEIVED NO3IMG URL: " + details.url);
	addToBlockedObject("no3img", getDomainFromUrl(details.url), details.url);
    return {cancel: true};
  }

  if((isNojs() || isNo3hiddenobj()) && no3hiddenobj(details)){
    log("STOP ONHEADERS-RECEIVED NO3HIDDENOBJ URL: " + details.url);
	addToBlockedObject("nojs", getDomainFromUrl(details.url), details.url);
    return {cancel: true};
  }
  
  // restituisco la blocking response
  blockingResponse.responseHeaders = responseHeaders;
  
  log("STOP ONHEADERS-RECEIVED URL: " + details.url);
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
		
		