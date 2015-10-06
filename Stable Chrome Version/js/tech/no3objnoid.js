function no3objnoid(details){
    
	var regexp_no3objnoid = new RegExp("[\?=&]");
	
	if(regexp_no3objnoid.test(details.url)){
		if(!getBlacklistedSites().test(getDomainFromUrl(details.url).split('.')[0])) {
			return false;
		}
		
		if(!cssRegexp().test(details.url)){
			return true;
		}
	}
    
	return false;

}