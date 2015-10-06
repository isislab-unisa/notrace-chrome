function no3hiddenobj(details){

	if(details.type != 'script') {
		return false;
	}
	
	var scriptExp = getBlockedScriptExpression();
	var scriptName = getScriptNameFromUrl(details.url);
    
    if (scriptExp.test(scriptName)) {
        return true;
    }
    
	return false;
}