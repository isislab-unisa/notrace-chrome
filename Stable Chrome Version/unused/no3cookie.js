function no3cookie(details, headers, tabUrl) {
	var objDomain = getDomainFromUrl(details.url);
	var refDomain = getDomainFromUrl(tabUrl);
	var cookiePositions = new Array();
	
	for (i = 0, h = headers.length; i < h; i++) {
		if (headers[i].name == 'Set-Cookie') {
			cookiePositions.push(i);
		}
	}
	if (cookiePositions.length > 0) {
		if (refDomain != objDomain) {
			for (i = 0, l = cookiePositions.length; i < l; i++) {
				chrome.runtime.sendMessage({callerScript: 'no3cookie', cookieDomain: objDomain, cookie: (headers[cookiePositions[i]]).value});
				(headers[cookiePositions[i]]).value = "";
			}
		}
	}
	return headers;
}

function getCookieValue (cookieValue,tipologia,host,referer){
	
	var cookies=new Array();
	var arrayCook=new Array();
	if(tipologia=="Cookie"){
		cookies=this.dividiCookie(cookieValue);
		var clen = cookies.length;
		var curcookie;
		var cookiename;
		for(var i=0;i<clen;i++){
			curcookie = cookies[i];
			cookiename = this.getCookieName(curcookie);
			if(/path|domain|expires|httponly/gi.test(cookiename)!=true){
				arrayCook.push(cookiename);
			}
		}
		curcookie=null;
		cookiename=null;
		clen=null;
	} else
		if(tipologia=="Set-Cookie"){
			cookies=this.dividiSetCookie(cookieValue);
			var clen = cookies.length;
			var curcookie;
			var cookiename;
			for(var i=0;i<clen;i++){
				curcookie = cookies[i];
				cookiename = this.getCookieName(curcookie);
				if(/path|domain|expires|httponly/gi.test(cookiename)!=true){
					arrayCook.push(cookiename);
				}
			}
			curcookie=null;
			cookiename=null;
			clen=null;
		}
	cookies=null;
	return arrayCook;
}