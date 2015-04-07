function notop(details){
	log("START NOTOP: " + details.url);
	
	var domain = getDomainFromUrl(details.url);
	log(domain);
	
	var test = getRegExpDomain().test(domain);	
	
	if(test){
		log("STOP NOTOP TRUE: " + details.url);
	} else {
		log("STOP NOTOP FALSE: " + details.url);
	}
	return test;
}

function getRegExpDomain(){
  return new RegExp(
	"^(doubleclick\.net)|(2mdn\.net)|(atdmt\.com)|(google-analytics\.com)|"+
	"(2o7\.net)|(googlesyndication\.com)|(scorecardresearch\.com)|"+
	"(akamai\.net)|(advertising\.com)|(hitbox\.com)|(revsci.\net)|(questionmarket\.com)$",
	"i");
}