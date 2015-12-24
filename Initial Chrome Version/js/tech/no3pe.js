function no3pe(details, tabUrl){
	
	log("START NO3PE: " + details.url);
	log("TABURL: " + tabUrl);

	var regexp_malicious = getRegExp();
	
	var loc_domain = getDomainFromUrl(details.url);
	var reqOrig_domain;
	try {
		reqOrig_domain = getDomainFromUrl(tabUrl);
	} catch(ex) {
		reqOrig_domain = loc_domain;
	}   
	
	log("Local domain: " + loc_domain);
	log("TAB domain: " + reqOrig_domain);

	var isno3obj = (loc_domain != reqOrig_domain);
	
	if (isno3obj && regexp_malicious.test(details.url) && (!cssRegexp().test(details.url))){
		log("STOP NO3PE TRUE: " + details.url);
		return true;
	}
	log("STOP NO3PE FALSE: " + details.url);
	return false;

}

function getRegExp(){
	var regexp_malicious = new RegExp("126\.net|2hua\.com|2mdn\.net|2o7\.net|360buyimg\.com|360yield\.com|56imgs\.com|abmr\.net|acs86\.com|acxiom-online\.com|adadvisor\.net|adap\.tv|adbrite\.com|addthis\.com|addthisedge\.com|adimg\.net|adjug\.com|adlantis\.jp|admeld\.com|adnxs\.com|ad-plus\.cn|adresult\.jp|adriver\.ru|adsafeprotected\.com|adscale\.de|adsfac\.eu|adshost1\.com|adsonar\.com|adsrvr\.org|adtech\.de|adtechus\.com|advertising\.com|adzerk\.net|afy11\.net|agkn\.com|alimama\.cn|alimama\.com|aliunicorn\.com|allyes\.com|amazon-adsystem\.com|aol\.com|apmebf\.com|atdmt\.com|atwola\.com|audienceiq\.com|betrad\.com|bit\.ly|bizographics\.com|bkrtx\.com|bluekai\.com|bluelithium\.com|ca-mpr\.jp|casalemedia\.com|cbsistatic\.com|chango\.com|chartbeat\.com|chartbeat\.net|clicktale\.net|cnnic\.cn|cnzz\.com|cnzz\.net|collective-media\.net|com\.cn|com\.com|connexity\.net|contextweb\.com|crowdscience\.com|crwdcntrl\.net|da-ads\.com|demandbase\.com|demdex\.net|digieq\.com|dl-rms\.com|dmtracker\.com|dotomi\.com|doubleclick\.net|doubleverify\.com|dqna\.net|dsply\.com|ebayrtm\.com|edgesuite\.net|endless\.com|everesttech\.net|exelator\.com|facebook\.com|facebook\.net|fbcdn\.net|flashtalking\.com|fmpub\.net|fwmrm\.net|godaddy\.com|google\.com|googleadservices\.com|google-analytics\.com|googlesyndication\.com|googletagservices\.com|gstatic\.com|gwallet\.com|icast\.cn|impact-ad\.jp|imrworldwide\.com|invitemedia\.com|iogous\.com|ipinyou\.com|irs01\.com|irs01\.net|ivwbox\.de|jscount\.com|kissmetrics\.com|knet\.cn|kontera\.com|lijit\.com|livezilla\.net|lucidmedia\.com|mail\.ru|mathtag\.com|media6degrees\.com|mediaplex\.com|mediav\.com|miaozhen\.com|microad\.jp|mlt01\.com|mookie1\.com|moonbasa\.com|mouseflow\.com|msn\.com|mxptint\.net|netseer\.com|newrelic\.com|nexac\.com|oadz\.com|odnoklassniki\.ru|omtrdc\.net|ooyala\.com|openx\.net|openxmarket\.jp|optimizely\.com|orbengine\.com|owneriq\.net|pinterest\.com|plus\.google\.com|p-td\.com|pubmatic\.com|qservz\.com|quality-channel\.de|quantserve\.com|reduxmediagroup\.com|refinedads\.com|revsci\.net|rfihub\.com|rlcdn\.com|rtbidder\.net|ru4\.com|rubiconproject\.com|scorecardresearch\.com|serving-sys\.com|simpli\.fi|sitestat\.com|skinected\.com|softonicads\.com|sogou\.com|spotxchange\.com|statcounter\.com|tanx\.com|technoratimedia\.com|tinyurl\.com|tns-counter\.ru|triggit\.com|truste\.com|tubemogul\.com|turn\.com|twimg\.com|twitter\.com|tynt\.com|typekit\.net|ugdturner\.com|v-56\.com|valuedopinions\.co\.uk|veruta\.com|visualrevenue\.com|visualwebsiteoptimizer\.com|voicefive\.com|w55c\.net|warriorpro\.com|websitealive7\.com|webtrends\.com|webtrendslive\.com|wrating\.com|wtp101\.com|yabuka\.com|yadro\.ru|yandex\.net|yandex\.st|ydstatic\.com|yieldmanager\.com|youdao\.com|youku\.com|plusone\.google\.com/u/0|facebook\.com/dialog/oauth\?client_id|static\.ak\.facebook\.com/connect/|facebook\.com/plugins/likebox\.php|statse\.webtrendslive\.com|home\.disney\.go\.com/search/babyzoneSearch\?q=|in\.getclicky\.com|brightcove.com/js/[^A][^P][^I]|brightcove.com/js/[^B][^r][^i][^g][^h][^t][^c][^o][^v][^e]");
	return regexp_malicious;
}
	