function nofingerprinting(details, tabUrl){

	log("START NOFINGERPRINTING: " + details.url);

	try {
		var localDomain = getDomainFromUrl(tabUrl);
	} catch(ex) {
		return;
	}
	
	var requestDomain = getDomainFromUrl(details.url);

	var isno3obj = (localDomain != requestDomain);
	
	var hashOfVisitedLink = new Object();
	var hashOfDomain = new Object();
	
	var regExp1 = getRegExp1();
	var regExp2 = getRegExp2();
	
	var tempUrl = details.url;
	if (isno3obj && (regExp1.test(tempUrl) || regExp2.test(tempUrl))){
		
		if (isNofingerprinting()){
			if (hashOfVisitedLink.hasOwnProperty(tempUrl)) {
				log("STOP NOFINGERPRINTING CONTINUE: " + details.url);
				return;
			}
			
			if (!hashOfDomain.hasOwnProperty(localDomain)) {
				var obj = new Object();
				tempUrl = tempUrl.replace(regExp1, RegExp.$1 + RegExp.$2 + "=" + getRandomScreenResolutionOld(RegExp.$3+"x"+RegExp.$4));
				regExp1.test(tempUrl);
				obj["sr"] = RegExp.$3 + "x" + RegExp.$4;
				tempUrl = tempUrl.replace(regExp2, RegExp.$1 + RegExp.$2 + "=" + getRandomColorDepthOld(RegExp.$3));
				regExp2.test(tempUrl);
				obj["cd"] = RegExp.$3;
				hashOfDomain[localDomain]=obj;
			} else {
				var obj = hashOfDomain[localDomain];
				tempUrl=tempUrl.replace(regExp1, RegExp.$1 + RegExp.$2 + "=" + obj["sr"]);
				tempUrl=tempUrl.replace(regExp2, RegExp.$1 + RegExp.$2 + "=" + obj["cd"]);
			}
			
			hashOfVisitedLink[tempUrl]=new Object();
			return tempUrl;
		}
	}

}


function getRegExp1(){
	return new RegExp("([&;])(utmsr|sr|WT\.sr|sc\_r|j|brscrsz|scr)=(\\d+)x(\\d+)");
}
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