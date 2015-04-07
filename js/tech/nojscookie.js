function nojscookie(){
  log("START NOCOOKIE");

  $("script:contains('document.cookie=')").each(function(){
	console.log(this);
  });

  log("STOP NOCOOKIE");
}
