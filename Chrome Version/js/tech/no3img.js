function no3img(details, tabUrl){
	
	log("DIFF: " + tabUrl + "!=" + details.url);

	var localDomain   = getDomainFromUrl(tabUrl);
	var requestDomain = getDomainFromUrl(details.url);
	
	if( (details.type == 'image') && (localDomain !=requestDomain) ) {
		log("STOP NO3IMG TRUE:" + details.url);
		return true;
	}

	log("STOP NO3IMG FALSE:" + details.url);
	return false;
}