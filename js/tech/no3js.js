function no3js (details, tabUrl) {
	var localDomain   = getDomainFromUrl(tabUrl);
	var requestDomain = getDomainFromUrl(details.url);
	
	if( (details.type == 'script') && (localDomain !=requestDomain) ) {
		return true;
	}
	
	return false;
}