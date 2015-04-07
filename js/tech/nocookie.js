function nocookie(inMemoryRequestHeaders, responseHeaders){
 
  log("START NOCOOKIE");
  
  var setCookie = null;
  
  for( var i = 0, l = responseHeaders.length; i < l; ++i ) {
	if(responseHeaders[i].name == 'Set-Cookie') {
	  
	  // prendo il cookie per gestire in futuro il local storage della pagina web
	  setCookie = responseHeaders[i].value;
	  responseHeaders[i].value = "";
	  break;
	}
  }
  
  log("STOP NOCOOKIE");
  return responseHeaders;
}
