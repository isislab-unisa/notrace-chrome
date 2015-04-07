//lo uso per prendere quello che ho mandato
var inMemoryRequestHeaders = null;
var tabUrl = null;

/*
chrome.webRequest.onBeforeRequest.addListener(function(details){
  console.time(details.url);
},{urls: [ "<all_urls>" ]},['blocking']);

chrome.webRequest.onCompleted.addListener(function(details){
  console.timeEnd(details.url);
},{urls: [ "<all_urls>" ]});
*/

chrome.webRequest.onBeforeSendHeaders.addListener(function(details){

  log("START ONBEFORE-SEND-HEADERS URL: " + details.url);
  
  // imposto il tabid. La prima richiesta su un nuovo tab aperto può
  // avere un tabid -1, tuttavia, le risorse richieste avranno il tabid
  // corretto da cui sarà possibile ottenere l'url della barra degli
  // indirizzi
  try{
	  chrome.tabs.get(details.tabId, function (tab) {
			if(tab!=null)
			  tabUrl = tab.url;
	  });
  } catch(ex){}
  
  var requestHeaders = details.requestHeaders, blockingResponse = {};

  // verifico che il dominio a cui sto effettuando la richiesta sia in whitelist
  if(isInWhiteList(getDomainFromUrl(details.url))){
    log("DOMAIN IN WHITELIST: " + getDomainFromUrl(details.url));
    return blockingResponse;
  } else {
    log("DOMAIN NOT IN WHITELIST GO ON WITH TECH: " + getDomainFromUrl(details.url));
  }

  // trovato in blacklist, blocco la richiesta
  if(isInBlackList(details.url)){
    // cancello l'elemento dalla blacklist una volta che l'ho bloccato
    removeFromBlackList(details.url);
    return {cancel: true};
  }
  
  
  if(isNotop() && notop(details)){
    // blocco la richiesta
    log("STOP ONBEFORE-SEND-HEADERS ON NOTOP URL: " + details.url);
	addToBlockedObject("notop", getDomainFromUrl(details.url), details.url);
    return {cancel: true};
  }
  
  if(isNoad() && noad(details)){
    log("STOP ONBEFORE-SEND-HEADERS ON NOAD URL: " + details.url);
	addToBlockedObject("noad", getDomainFromUrl(details.url), details.url);
    return {cancel: true};
  }
  
  if(isNo3pe() && no3pe(details, tabUrl)){
    log("STOP ONBEFORE-SEND-HEADERS ON NO3PE URL: " + details.url);
	addToBlockedObject("no3pe", getDomainFromUrl(details.url), details.url);
    return {cancel: true};
  }
  
  
  if(isNo3objnoid() && no3objnoid(details)){
    log("STOP ONBEFORE-SEND-HEADERS ON NO3OBJNOID URL: " + details.url);
	addToBlockedObject("no3objnoid", getDomainFromUrl(details.url), details.url);
    return {cancel: true};
  }

  var redirectTo = nofingerprinting(details, tabUrl);
  if(redirectTo != null){
    log("STOP ONBEFORE-SEND-HEADERS ON REDIRECT URL: " + details.url + " TO: " + redirectTo);
	return {redirectUrl : redirectTo};
  }
  
  if(isNo3cookie()){
    requestHeaders = no3cookie(details, requestHeaders);
	addToBlockedObject("no3cookie", getDomainFromUrl(details.url), details.url);
  }
  
  if(isNoidheader()){
    requestHeaders = noidheader(requestHeaders);
	addToBlockedObject("noidheader", getDomainFromUrl(details.url), details.url);
  }
  
  if(isNofingerprinting()){
    requestHeaders = nofingerprintinguseragent(details, tabUrl, requestHeaders);
	addToBlockedObject("nofingerprinting", getDomainFromUrl(details.url), details.url);
  }
  
  // Tengo in memoria i requestHeader, mi serviranno dopo
  inMemoryRequestHeaders = requestHeaders;
  
  // restituisco la blocking response
  blockingResponse.requestHeaders = requestHeaders;
  log("STOP ONBEFORE-SEND-HEADERS URL: " + details.url);
  return blockingResponse;
},
{urls: [ "<all_urls>" ]},['requestHeaders','blocking']);

chrome.webRequest.onHeadersReceived.addListener(function(details){

  log("START ONHEADERS-RECEIVED URL: " + details.url);
  var responseHeaders = details.responseHeaders, blockingResponse = {};

  if(isNocookie()){
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
