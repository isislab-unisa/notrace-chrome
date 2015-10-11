var tabUrl = null;
var tabs = {};
var selectedTab = null;
var refreshed = false;

chrome.runtime.onInstalled.addListener(function(details) {
    localStorage['numeroElementi'] = 0;
    localStorage['noTraceSospeso'] = false;
    localStorage['whitelist'] = new Array();
    localStorage['blacklist'] = new Array();
    clearBlockedObject();
});

chrome.runtime.onMessage.addListener (
	function (request, sender, sendResponse) {
		// Innanzitutto dobbiamo vedere da quale script è partito il messaggio,
		// poichè, in base a questo, possiamo sapere cosa è contenuto in request
		if (request.callerScript == 'no3cookie') {
            if (!addToBlockedObject("no3cookie", request.cookieDomain, request.cookie)) {
                //localStorage['numeroElementi'] = (parseInt(localStorage['numeroElementi']) + 1);
                //tabs[selectedTab][0] += 1;
            }
        }
	}
);

/* Le informazioni sui tab dobbiamo recuperarle al di fuori dei listener delle webRequest.
 * Questo perchè le chiamate alla callback di chrome.tabs.get sono asincrone, quindi il
 * funzionamento non sarebbe corretto.
 */

// In alcuni casi chrome.tabs può non essere definito (crbug.com/60435), quindi controlliamo che esista
if (chrome.tabs) {
    chrome.tabs.onRemoved.addListener(function (tabId) {
        delete tabs[tabId];
    });
    chrome.tabs.onActivated.addListener(function (info) {
        selectedTab = info.tabId;
        
        try {
            if (tabs[selectedTab][0] + tabs[selectedTab][1] > 0) {
                chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 255]});
            
                chrome.browserAction.setBadgeText({text: '' + (tabs[selectedTab][0] + tabs[selectedTab][1])});
            }
            else {
                chrome.browserAction.setBadgeText({text: ''});
            }
        }
        catch (e) {
            tabs[selectedTab] = new Array(0, 0);   
            chrome.browserAction.setBadgeText({text: ''});
        }
    });
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        if (changeInfo.status == 'loading') {
            if (!refreshed) {
                tabs[tabId] = new Array(0, 0);
                clearBlockedObject();
                chrome.browserAction.setBadgeText({text: ''});
                refreshed = true;
            }
        }
        else if (changeInfo.status == 'complete') {
            refreshed = false;
        }
    });
}
chrome.webRequest.onBeforeRequest.addListener(function (details) {
    /* CONTROLLO LE TECNICHE APPLICABILI TRA: 
    /* notop:					filtra le richieste ai top-10 domini di terze parti;
    /* noad:					rimuove gli oggetti di advertisement;
    /* no3pe:					filtra le richieste per siti di terze parti
    /* no3objnoid:				filtra le richieste per siti di terze parti che trasmettono info personali
    /* no3img:					cancella richieste di immagini verso siti di terze parti
    /* no3hiddenobj:			rimuove le esecuzioni di Javascript di reti di advertisement
    /* */

    if (localStorage['noTraceSospeso'] === 'false' && details.tabId != -1) {
        // Salvo l'URL della pagina, così come viene mostrato nella barra
        // degli indirizzi del tab dal quale è partita la richiesta.
        // Mi servirà nel fingerprinting, quando devo vedere se il dominio
        // della richiesta coincide col dominio della pagina presente nel
        // tab visualizzato.
        
        /* Per ogni pagina la richiesta alla risorsa principale (main_frame) è unica, inoltre sappiamo che è sempre
         * la prima ad essere effettuata, quindi quando troviamo tale richiesta resettiamo i contatori.
         */
        if (details.type == "main_frame") {
            // Salvo l'URL della pagina, così come viene mostrato nella barra
            // degli indirizzi del tab dal quale è partita la richiesta.
            // Mi servirà nel fingerprinting, quando devo vedere se il dominio
            // della richiesta coincide col dominio della pagina presente nel
            // tab visualizzato.
            tabUrl = details.url; // L'URL del tab sarebbe quello di richiesta del main_frame
        }
    
        /* CONTROLLI PRESENZA URL IN WHITELIST O BLACKLIST */

        // Controllo se l'URL DEL TAB è nella whitelist
        if (isInWhiteList(getDomainFromUrl(tabUrl))) {
            return {cancel: false};
        } 

        // La prima funzione controlla se la tecnica è abilitata, la seconda la applica
        if (isNotop() && notop(details)) {
            if (!addToBlockedObject("notop", getDomainFromUrl(details.url), details.url)) {
                localStorage['numeroElementi'] = (parseInt(localStorage['numeroElementi']) + 1);
                tabs[details.tabId][0] += 1; // Incremento il contatore dei tracciamenti evitati
            }
            return {cancel: true};
        }

        if (isNoad() && noad(details)) {
            if (!addToBlockedObject("noad", getDomainFromUrl(details.url), details.url)) {
                localStorage['numeroElementi'] = (parseInt(localStorage['numeroElementi']) + 1);
                tabs[details.tabId][1] += 1;
            }
            return {cancel: true};
        }

        if (isNo3pe() && no3pe(details, tabUrl)) {
            if (!addToBlockedObject("no3pe", getDomainFromUrl(details.url), details.url)) {
                localStorage['numeroElementi'] = (parseInt(localStorage['numeroElementi']) + 1);
                tabs[details.tabId][1] += 1;
            }
            return {cancel: true};
        }

        if (isNo3objnoid() && no3objnoid(details)) {
            if (!addToBlockedObject("no3objnoid", getDomainFromUrl(details.url), details.url)) {
                localStorage['numeroElementi'] = (parseInt(localStorage['numeroElementi']) + 1);
                tabs[details.tabId][0] += 1;
            }
            return {cancel: true};
        }

        if(isNo3img() && no3img(details, tabUrl)) { // Cancello le richieste di immagini verso siti di terze parti
            if (!addToBlockedObject("no3img", getDomainFromUrl(details.url), details.url)) {
                localStorage['numeroElementi'] = (parseInt(localStorage['numeroElementi']) + 1);
                tabs[details.tabId][0] += 1;
            }
            return {redirectUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="};
        }

        if(isNo3hiddenobj() && no3hiddenobj(details)){
            if (!addToBlockedObject("no3hiddenobj", getDomainFromUrl(details.url), details.url)) {
                localStorage['numeroElementi'] = (parseInt(localStorage['numeroElementi']) + 1);
                tabs[details.tabId][1] += 1;
            }
            return {cancel: true};
        }
        
        if(isNofingerprinting() && (redirect = nofingerprinting(details, tabUrl)) != null) {
            if (!addToBlockedObject("nofingerprinting", getDomainFromUrl(details.url), details.url)) {
                localStorage['numeroElementi'] = (parseInt(localStorage['numeroElementi']) + 1);
                tabs[details.tabId][0] += 1;
            }
            return {redirectUrl: redirect};
        }
    }
},
{urls: ["<all_urls>"]},
['blocking']                                              
);

chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
    
    if (localStorage['noTraceSospeso'] === 'false' && details.tabId != -1) {
        
        var requestHeaders = details.requestHeaders;
        var blockingResponse = {};

        /* CONTROLLO LE TECNICHE APPLICABILI TRA:
        /* noidheader:				rimuove info personali dall'header, ossia: User-Agent, From, Referer
        /* nofingerprinting:		rimuove info identificanti dell'utente dall'URL della richiesta, come la risoluzione dello schermo, il browser e la profondità dei colori
        /* no3cookie:               disabilit i cookie di terze parti
        */
        
        // Controllo se l'URL DEL TAB è nella whitelist
        if (isInWhiteList(getDomainFromUrl(tabUrl))) {
            return {cancel: false};
        } 

        if (isNoidheader() && noidheader(requestHeaders)) {
            if (!addToBlockedObject("noidheader", getDomainFromUrl(details.url), details.url)) {
                //localStorage['numeroElementi'] = (parseInt(localStorage['numeroElementi']) + 1);
                //tabs[details.tabId][0] += 1;
            }
        }

        if (isNofingerprinting() && !isNoidheader()) {
            nofingerprintingUserAgent(details, tabUrl, requestHeaders);
        }
        
        if (isNo3cookie()) {
            no3cookie(tabUrl, details.url, requestHeaders);
        }

        // Alla fine restituisco gli header modificati dalle tecniche
        blockingResponse.requestHeaders = requestHeaders;

        return blockingResponse;
    }
    
}, 
{urls: ["<all_urls>"]}, 
['requestHeaders', 'blocking']
);

chrome.webRequest.onHeadersReceived.addListener(function (details) {
    // Vedo se devo applicare no3cookie. Viene ripetuta qui per cancellare i campi Set-Cookie delle risposte HTTP
    if (localStorage['noTraceSospeso'] === 'false' && details.tabId != -1) {
        var responseHeaders = details.responseHeaders;
        var blockingResponse = {};
        
        // Controllo se l'URL DEL TAB è nella whitelist
        if (isInWhiteList(getDomainFromUrl(tabUrl))) {
            return {cancel: false};
        }
        
        if (isNo3cookie()) {
            no3cookie(tabUrl, details.url, responseHeaders);
        }
        
        // Alla fine restituisco gli header modificati dalle tecniche
        blockingResponse.responseHeaders = responseHeaders;
        
        if (tabs[selectedTab][0] + tabs[selectedTab][1] > 0) {
            chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 255]});
            
            chrome.browserAction.setBadgeText({text: '' + (tabs[selectedTab][0] + tabs[selectedTab][1])});
        }

        return blockingResponse;
    }
},
{urls: ["<all_urls>"]}, 
['responseHeaders', 'blocking']
);

// Serve al file options.js quando deve mostrare il numero di elementi bloccati per categoria (trac. e pubb.)
function getContatori () {
    if (!selectedTab) {
        return new Array(0, 0);
    }
    return new Array(tabs[selectedTab][0], tabs[selectedTab][1]);
}