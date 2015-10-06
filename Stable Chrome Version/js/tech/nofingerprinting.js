var hashOfVisitedLink = new Object();
var hashOfDomain = new Object();

function nofingerprinting(details, tabUrl) {
    
    var localDomain = getDomainFromUrl(tabUrl);
	var requestDomain = getDomainFromUrl(details.url);
    var requestUrl = details.url;
    var isno3obj = (localDomain != requestDomain);
	var regExp1 = getRegExp1();
	var regExp2 = getRegExp2();
    
    if (isno3obj && (regExp1.test(requestUrl) || regExp2.test(requestUrl))){
        if (hashOfVisitedLink.hasOwnProperty(requestUrl)) { // Facendo la redirect ritorneremo alla stessa url
            return null;
        }
			
        if (!hashOfDomain.hasOwnProperty(localDomain)) {
            var obj = new Object();
            
            // Con .$x leggiamo il pattern x dell'ultima espressione di cui è avvenuto il match. Lasciamo lo stesso nome, cambiando il valore a random
            requestUrl = requestUrl.replace(regExp1, RegExp.$1 + RegExp.$2 + "=" + getRandomScreenResolutionOld(RegExp.$3+"x"+RegExp.$4));
            regExp1.test(requestUrl);
            obj["sr"] = RegExp.$3 + "x" + RegExp.$4;
            requestUrl = requestUrl.replace(regExp2, RegExp.$1 + RegExp.$2 + "=" + getRandomColorDepthOld(RegExp.$3));
            regExp2.test(requestUrl);
            obj["cd"] = RegExp.$3;
            hashOfDomain[localDomain]=obj;
        } 
        else {
            var obj = hashOfDomain[localDomain];
            requestUrl = requestUrl.replace(regExp1, RegExp.$1 + RegExp.$2 + "=" + obj["sr"]);
            requestUrl = requestUrl.replace(regExp2, RegExp.$1 + RegExp.$2 + "=" + obj["cd"]);
        }
			
        hashOfVisitedLink[requestUrl]=new Object();
        
        return requestUrl;
    }
}


/* SCREEN RESOLUTION */
function getRegExp1(){
	return new RegExp("([&;])(utmsr|sr|WT\.sr|sc\_r|j|brscrsz|scr)=(\\d+)x(\\d+)");
}

/* COLOR DEPTH */
function getRegExp2(){
	return new RegExp("([&;])(utmsc|cd|WT\.cd|sc\_d)=(\\d+)");
}

function getRandomScreenResolutionOld(oldOne){
	var sr=oldOne;
	while (sr==oldOne) {
		sr = getRandomScreenResolution();
	}
	return sr;
}

function getRandomColorDepthOld(oldOne){
	var cd=oldOne;
	while (cd==oldOne) {
		cd = getRandomColorDepth();
	}
	return cd;
}

