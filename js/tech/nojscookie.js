function nojscookie(tabUrl){

  $("script:contains('document.cookie')").each(function(){
	var codice = this.innerHTML;
	var a = codice.split('document.cookie');
	
	for (i = 1, l = a.length; i < l; i++) {
		var indexOfCookieName = 0;
		var cookieName;
		var domain;
		
		while (a[i][indexOfCookieName] == ' ' || a[i][indexOfCookieName] == '=' || a[i][indexOfCookieName] == '"') { // Scorro fino ad arrivare all'inizio del nome del cookie
			indexOfCookieName++;
		};
		
		cookieName = a[i].substring(indexOfCookieName, a[i].indexOf('=', indexOfCookieName)); // Isolo il nome del cookie
		document.cookie = cookieName + "=a; expires=Thu, 01 Jan 1970 00:00:00 UTC;"; // Elimino il cookie
		
		domain = getDomainFromCookie(a[i].substring(indexOfCookieName), tabUrl);
		
		/* Mandiamo il messaggio alla backgroundPage per inserire il cookie nella lista dei jscookie bloccati */
		chrome.runtime.sendMessage({callerScript: 'nojscookie', cookie: cookieName, cookieDomain: domain});
	}
  });
}
