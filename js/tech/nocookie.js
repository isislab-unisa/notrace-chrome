function nocookie(headers){
 
  log("START NOCOOKIE");
  
  var setCookie = null;
  
  for( var i = 0, l = headers.length; i < l; ++i ) {
	if(headers[i].name == 'Set-Cookie' || headers[i].name == 'Cookie') {
	  
	  // prendo il cookie per gestire in futuro il local storage della pagina web
	  setCookie = headers[i].value;
	  headers[i].value = "";
	  break;
	}
  }
  
  log("STOP NOCOOKIE");
  return headers;
}
