function noidheader(headers){

  log("START NOIDHEADER");
 
  for( var i = 0, l = headers.length; i < l; i++ ) {
    if(headers[i].name == 'Referer') {
		headers[i].value = "";
		continue;
	}
    if(headers[i].name == 'User-Agent') {
		headers[i].value = "";
		continue;
	}
    if(headers[i].name == 'From') {
		headers[i].value = "";
		continue;
	}
    if(headers[i].name == 'Cookie') {
		headers[i].value = "";
		continue;
	}
  }
  
  log("STOP NOIDHEADER");
  return headers;
}