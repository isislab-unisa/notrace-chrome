function nometaredirectandcookie(tabUrl) {

	var list = new Array(); // Contiene 2 liste: lista redirezionamenti e lista cookie
	
	list[0] = new Array(); // La lista con i reindirizzamenti fatti con tag meta
	list[1] = new Array(); // La lista con i cookie settati con tag meta

	// per tutti i meta http-equiv = refresh
	$("meta[http-equiv='refresh']").each(function() {
		
		// prendo l'host a cui fanno riferimento
		var url = getUrlFromContent(this.content);
		var metaHost = getDomainFromUrl(url);
		
		// se è diverso dall'host in cui mi trovo
		if(metaHost != window.location.host){
			// aggiungo l'url del refresh alla lista di quelli da bloccare
			list[0].push(new Array(metaHost, url));
		}
    });
	
	// per tutti i meta http-equiv = Set-Cookie
	$("meta[http-equiv='Set-Cookie']").each(function() {
		
		// prendo il cookie settato
		var cookie = this.content;
		var cookieNameAndValue = cookie.split(';')[0];
		var domain = getDomainFromCookie(cookie, tabUrl);
		list[1].push(new Array(domain, cookie));
		document.cookie = cookieNameAndValue + "; expires=Thu, 01 Jan 1970 00:00:00 UTC;" // Eliminiamo il cookie impostato
    });
	
	return list;
}