log("START CONTENTSCRIPT");

chrome.extension.sendRequest({method: "getLocalStorage"}, function(response) {
  var storage = response.data;
  
  if(isNowebbug(storage)){
    var list = nowebbug();
    chrome.extension.sendRequest({method: "addToBlockedList", type: "nowebbug", list: list});
  }
  
  if(isNometaredirectandcookie(storage)) {
    var list = nometaredirectandcookie(location.href); // L'URL della pagina serve per indicare poi il dominio nella lista dei cookie bloccati
	var metaList = list[0].concat(list[1]);
	
	chrome.runtime.sendMessage({callerScript: 'contentScript', method: 'metaredirectandcookie', list: metaList});
  }
  
  if(isNojscookie(storage)){
    nojscookie(location.href); // L'URL della pagina serve per indicare poi il dominio nella lista dei cookie bloccati
  }

  if(isNonoscript(storage)){
    nonoscript();
  }

});

log("STOP CONTENTSCRIPT");