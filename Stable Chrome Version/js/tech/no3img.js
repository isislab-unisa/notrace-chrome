function no3img(details, tabUrl){

	var localDomain   = getDomainFromUrl(tabUrl);
	var requestDomain = getDomainFromUrl(details.url);
    
	if ((details.type == 'image') && (localDomain !=requestDomain) && getBlacklistedSites().test(requestDomain.split(".")[0])) {
		return true;
	}

	return false;
}