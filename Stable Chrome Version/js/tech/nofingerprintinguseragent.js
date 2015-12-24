function nofingerprintingUserAgent(details, tabUrl, requestHeaders) {
    
    var localDomain = getDomainFromUrl(tabUrl);
	var requestDomain = getDomainFromUrl(details.url);
    var requestUrl = details.url;
    var isno3obj = (localDomain != requestDomain);
    
    if (isno3obj){
        /* USER-AGENT */
        for (var i = 0, l = requestHeaders.length; i < l; i++ ) {
			if (requestHeaders[i].name == 'User-Agent') {
				requestHeaders[i].value = getRandomUserAgentOld(requestHeaders[i].value);
			}
		}
    }       
}

function getRandomUserAgentOld(oldOne){
	var ua=oldOne;
	while (ua==oldOne) {
		ua = getRandomUserAgent();
	}
	return ua;
}