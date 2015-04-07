function no3objnoid(details){
	
	log("START NO3OBJNOID: " + details.url);
	
	var regexp_no3objnoid = new RegExp("[\?=&]");
	var regexp_secure = new RegExp(getRegExpSecure());

	log("PRIMO TEST: " +regexp_no3objnoid.test(details.url));
	log("SECON TEST: " +regexp_secure.test(details.url));
	
	if(regexp_no3objnoid.test(details.url)){
		if(regexp_secure.test(details.url)) {
			log("STOP NO3OBJNOID FALSE: " + details.url);
			return false;
		}
		
		if(!cssRegexp().test(details.url)){
			log("STOP NO3OBJNOID TRUE: " + details.url);
			return true;
		}
	}
	log("STOP NO3OBJNOID FALSE: " + details.url);
	return false;

}

function getRegExpSecure(){
	return "akamaihd.net|fbcdn.net|ytimg.com|yimg.com|wikimedia.org|blogger.com|wlxrs.com|msn.com|hotmail.com|twimg.com|gtimg.com|s-msn.com|yimg.jp|tbcdn.cn|taobaocdn.com|mmcdn.cn|sinaimg.cn|wp.com|ebaystatic.com|ebayimg.com|yandex.st|yandex.net|netease.com|sinajs.cn|sinaimg.cn|imgsmail.ru|media-imdb.com|bbcimg.co.uk|static.bbc.co.uk|vimeo.com|turner.com|google.com|getpersonas.com|mozilla.net";
}