function notop(details){
    
	var domain = getDomainFromUrl(details.url);
	log(domain);
	
	var test = getRegExpDomain().test(domain);	
	return test;

}

function getRegExpDomain(){
  return new RegExp(
	"^(doubleclick\.net|2mdn\.net|atdmt\.com|google-analytics\.com|"+
	"2o7\.net|googlesyndication\.com|scorecardresearch\.com|"+
	"akamai\.net|advertising\.com|hitbox\.com|revsci.\net|questionmarket\.com)$");
}