function nometaredirectandcookie(){
	log("START NO-META-REDIRECT-AND-COOKIE");

	var list = new Array();

	// per tutti i meta http-equiv = refresh
	$("meta[http-equiv='refresh']").each(function() {
		
		// prendo l'host a cui fanno riferimento
		var url = getUrlFromContent(this.content);
		var metaHost = getDomainFromUrl(url);
		
		// se è diverso dall'host in cui mi trovo
		if(metaHost != window.location.host){
			// aggiungo l'url del refresh alla lista di quelli da bloccare
			list.push(url);
		}
    });

	log("STOP NO-META-REDIRECT-AND-COOKIE");
	
	return list;
}