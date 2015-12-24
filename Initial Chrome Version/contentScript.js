log("START CONTENTSCRIPT");

chrome.extension.sendRequest({method: "getLocalStorage"}, function(response) {
  var storage = response.data;
  if(isNowebbug(storage)){
    var list = nowebbug();
    chrome.extension.sendRequest({method: "addToBlockedList", type: "nowebbug", list: list});
  }
  
  if(isNometaredirectandcookie(storage)){
    var list = nometaredirectandcookie();
	chrome.extension.sendRequest({method: "addToBlackList", list: list});
	chrome.extension.sendRequest({method: "addToBlockedList", type: "nometaredirectandcookie", list: list});
  }
  
  if(isNojscookie(storage)){
    nojscookie();
  }

  if(isNonoscript(storage)){
    nonoscript();
  }

});

log("STOP CONTENTSCRIPT");