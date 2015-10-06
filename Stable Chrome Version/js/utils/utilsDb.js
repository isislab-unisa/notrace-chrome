function getBlockedObject(type){
  try {
    return JSON.parse(localStorage[''+type+'']);
  } catch (ex) {
    return new Array();
  }
}

function getBlockedObjectSize(type){
  try {
    var list = JSON.parse(localStorage[''+type+'']);
	var size = 0;
    for(var i=0; i<list.length; i++){
	  size += list[i][1].length;
    }
	return size;
  } catch (ex) {
    return 0;
  }
}

// Aggiunge al LocalStorage della tecnica indicata LA LISTA di oggetti passata
function addToBlockedList (type, list) {
	// Ricordiamo che ogni elemento della lista è un array di 2 elementi (dominio, oggetto)
	for (i = 0, l = list.length; i < l; i++) {
		var domain = list[i][0];
		var object = list[i][1];
		
		addToBlockedObject(type, domain, object);
	}
}

function addToBlockedObject(type, domain, object){
  var list;
  var indexOfDomain = -1;
  var wasPresent = false; // Serve per l'incremento del contatore delle tecniche
  try {
    list = JSON.parse(localStorage[''+type+'']);
      // prende l'iesimo elemento della lista che contiene il dominio
    for(var i=0; i<list.length; i++){
      if(list[i][0]==domain){
        indexOfDomain = i;
        break;
      }
    }
    
    if(indexOfDomain == -1){
      // se sono arrivato qui esiste il localStorage, ma non c'è ancora il dominio
      list.push(new Array(domain, null));
      indexOfDomain = list.length-1;
    }

  } catch (ex) {
    list = new Array();
    list.push(new Array(domain, null));
    indexOfDomain = 0;
  }

  // devo aggiungere l'object, se non già esistente
  var arrayOfObject = list[indexOfDomain][1];

  if(arrayOfObject==null){
    // non c'è nulla
    arrayOfObject = new Array(object);
  } else {
    // c'è già qualcosa, aggiungo se non è già presente
    if(arrayOfObject.indexOf(object) < 0){
        arrayOfObject.push(object);
    }
    else {
        wasPresent =  true;   
    }
  }
  
  list[indexOfDomain][1] = arrayOfObject;
  
  localStorage[''+type+''] = JSON.stringify(list);
    
  return wasPresent;
}

function clearBlockedObject(){
  var list = JSON.stringify(new Array());
  var listOfTech = new Array('noidheader','no3img','no3cookie','notop','no3hiddenobj','noadnetwcookie','no3pe','no3objnoid','noad','nofingerprinting');
  listOfTech.forEach(function(type) {
    localStorage[''+type+''] = list;
  });
}

function getWhitelist(){
  try {
    return JSON.parse(localStorage['whitelist']);
  } catch(ex){
    return new Array();
  }
}

function addToWhiteList(domain){
  addToList('whitelist', domain);
}

function isInWhiteList(domain){
    return isInList('whitelist', domain);
}

function removeFromWhiteList(domain){
  removeFromList('whitelist', domain);
}

function addToBlackList(domain){
  addToList('blacklist', domain);
}

function isInBlackList(domain){
    return isInList('blacklist', domain);
}

function removeFromBlackList(domain){
  removeFromList('blacklist', domain);
}

function addToList(listType, domain){

  var list;
  try {
    list = JSON.parse(localStorage[''+listType+'']);
  } catch (ex) {
    list = new Array();
  }
  list.push(domain);
  localStorage[''+listType+''] = JSON.stringify(list);
}

function isInList(listType, domain){
  try {
    var list = JSON.parse(localStorage[''+listType+'']);
    return list[list.indexOf(domain)];
  } catch(ex){
    return false;
  }
}

function removeFromList(listType, domain){
  var list = JSON.parse(localStorage[''+listType+'']);
  var index = list.indexOf(domain);
  if (index > -1) {
    list.splice(index, 1);
  }
  localStorage[''+listType+''] = JSON.stringify(list);
}
