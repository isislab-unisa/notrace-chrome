function no3cookie(tabUrl, resourceUrl, headers) {
	var refDomain = getDomainFromUrl(tabUrl);
    var objDomain = getDomainFromUrl(resourceUrl);
	var cookiePositions = new Array();
    var blacklistedSites = getBlacklistedSites();
	
	for (i = 0, h = headers.length; i < h; i++) {
		if (headers[i].name == 'Set-Cookie' || headers[i].name == 'set-cookie' || headers[i].name == 'cookie' || headers[i].name == 'Cookie') {
			cookiePositions.push(i);
		}
	}
    
	if (cookiePositions.length > 0) {
        for (i = 0, l = cookiePositions.length; i < l; i++) {
            if (getDomainFromCookie((headers[cookiePositions[i]]).value, resourceUrl) != refDomain && blacklistedSites.test(getDomainFromCookie((headers[cookiePositions[i]]).value, resourceUrl).split('.')[0])) {
                var blockedCookie = (headers[cookiePositions[i]]).value;
                headers[cookiePositions[i]].value = "";
				chrome.runtime.sendMessage({callerScript: 'no3cookie', cookieDomain: objDomain, cookie: blockedCookie});
            }
        }
	}
}