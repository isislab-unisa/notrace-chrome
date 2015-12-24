function nofingerprintinguseragent(details, tabUrl, requestHeaders){

	log("START NOFINGERPRINTINGUSERAGENT: " + details.url);

	try {
		var localDomain = getDomainFromUrl(tabUrl);
	} catch(ex) {
		return;
	}
	
	var requestDomain = getDomainFromUrl(details.url);

	var isno3obj = (localDomain != requestDomain);
	
	var regExp1 = getRegExp1();
	var regExp2 = getRegExp2();
	
	var tempUrl = details.url;
	if(isno3obj && (regExp1.test(tempUrl) || regExp2.test(tempUrl))){
		for( var i = 0, l = requestHeaders.length; i < l; ++i ) {
			if(requestHeaders[i].name == 'User-Agent' && isno3obj && isNofingerprinting()) {
				requestHeaders[i].value = getRandomUserAgentOld(requestHeaders[i].value);
			}
		}
	}

}


function getRegExp1(){
	return new RegExp("([&;])(utmsr|sr|WT\.sr|sc\_r|j|brscrsz|scr)=(\\d+)x(\\d+)");
}
function getRegExp2(){
	return new RegExp("([&;])(utmsc|cd|WT\.cd|sc\_d)=(\\d+)");
}

function getRandomUserAgentOld(oldOne){
	var ua=oldOne;
	while (ua==oldOne) {
		ua = getRandomUserAgent();
	}
	return ua;
}