// Salva le impostazioni sul localStorage
function save_options() {
  
  // salvo le impostazioni sul privacy_level scelto
  localStorage["privacy_level"] = $("input[type=radio][name=privacy_level]:checked").val();
  
  // salvo le impostazioni della sezione Privacy - 1
  $("input[type=checkbox][name='prefpersonal[]']").each(function(){
	localStorage['prefpersonal['+$(this).val()+']'] = $(this).is(':checked');
  });
  
  // salvo le impostazioni della sezione Privacy - 2
  $("input[type=checkbox][name='preftracking[]']").each(function(){
	localStorage['preftracking['+$(this).val()+']'] = $(this).is(':checked');
  });
  
  // salvo le impostazioni della sezione Privacy - 3
  $("input[type=checkbox][name='prefannoying[]']").each(function(){
	localStorage['prefannoying['+$(this).val()+']'] = $(this).is(':checked');
  });
  
  // salvo le impostazioni del log
  localStorage["log"] = $("input[type=checkbox][name='log']").is(':checked');
  
  if (document.getElementById('checkNoCookie').checked) { // L'utente vuole disabilitare i cookie
		chrome.runtime.sendMessage({setting: 'block'});
  }
  else {
		chrome.runtime.sendMessage({setting: 'allow'});
  }
  
  // Aggiorno lo stato di salvataggio
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {status.innerHTML = "";}, 2000);
}

// Legge le impostazioni dal localStorage
function restore_options() {
  
  // restore del privacy_level scelto
  // se è la prima volta che carico l'estensione, allora metto di default il primo
  if(localStorage["privacy_level"]==null){
	localStorage["privacy_level"] = 1;
  }
  
  $("input[type=radio][name=privacy_level]").val([localStorage["privacy_level"]]);
  // innesco il "change" sul privacy_level scelto per impostare i checkbox sulla sezione Privacy
  $("input[type=radio][name=privacy_level]").trigger('change');
  
  // restore dei campi impostati sulla sezione Privacy - 1
  $("input[type=checkbox][name='prefpersonal[]']").each(function(){
	//console.log($(this).val() +":"+ localStorage['prefpersonal['+$(this).val()+']']);
	$(this).attr('checked', localStorage['prefpersonal['+$(this).val()+']']==='true');
	$("#prefpersonal-"+$(this).val()).empty().append(getBlockedObjectSize($(this).val()));
  });
  
  // restore dei campi impostati sulla sezione Privacy - 2
  $("input[type=checkbox][name='preftracking[]']").each(function(){
	//console.log($(this).val() +":"+localStorage['preftracking['+$(this).val()+']']);
	$(this).attr('checked', localStorage['preftracking['+$(this).val()+']']==='true');
	$("#preftracking-"+$(this).val()).empty().append(getBlockedObjectSize($(this).val()));
  });
  
  // restore dei campi impostati sulla sezione Privacy - 3
  $("input[type=checkbox][name='prefannoying[]']").each(function(){
	//console.log($(this).val() +":"+localStorage['prefannoying['+$(this).val()+']']);
	$(this).attr('checked', localStorage['prefannoying['+$(this).val()+']']==='true');
	$("#prefannoying-"+$(this).val()).empty().append(getBlockedObjectSize($(this).val()));
  });
  
  restoreWhitelistOptions();

  // restore delle impostazioni del log
  $("input[type=checkbox][name='log']").attr('checked', localStorage["log"]==='true');
}

// Reimposta i campi di una checkbox
function resetFunzionalita(elemento, params){
  // prendo tutti i parametri di prefpersonal e li imposto con l'iesimo parametro dell'array passato in input
  //   0 = disabilitato con valore false
  //   1 = disabilitato con valore true
  //   2 = abilitato    con valore false  
  //   3 = abilitato    con valore true  
  var i=0;
  elemento.each(function (){
    switch (params[i]){
      case 0:
		$(this).attr("disabled", true);
		$(this).attr("checked", false);
		//alert('Check: ' + $(this).val() + " - Val: DISFAL");
      break;
	  
      case 1:
		$(this).attr("disabled", true);
		$(this).attr("checked", true);
		//alert('Check: ' + $(this).val() + " - Val: DISTRU");
      break;
	  
      case 2:
	  	$(this).attr("disabled", false);
		$(this).attr("checked", false);
		//alert('Check: ' + $(this).val() + " - Val: ABIFAL");
      break;

      case 2:
	  	$(this).attr("disabled", false);
		$(this).attr("checked", true);
		//alert('Check: ' + $(this).val() + " - Val: ABITRU");
      break;

	  default: 
	    alert('Something wrong here... :(');
	}
	
	i++;
  })

}

// Sull'inizializzazione della pagina chiamo il restore dei dati dal localStore
document.addEventListener('DOMContentLoaded', restore_options);

// Alla pressione del pulsante save invoco il salvataggio dei dati
document.querySelector('#save').addEventListener('click', save_options);

// Alla pressione del pulsante "Consenti" aggiungo l'elemento in whitelist
document.querySelector('#OptionsLabel48_label').addEventListener('click', function(){
  addToWhiteList($('#whiteListWebSite').val());
  restoreWhitelistOptions();
});

// Alla pressione del pulsante "Cancella il sito selezionato" rimuovo l'elemento in whitelist
document.querySelector('#OptionsLabel50_label').addEventListener('click', function(){
  $('#siti option:selected').each(function(){
    removeFromWhiteList(this.value);
  });
  restoreWhitelistOptions();
});

// dialog per cancellare gli elementi bloccati
$( "#dialog" ).dialog({
  autoOpen: false,
  resizable: true,
  height:150,
  modal: true,
  buttons: {
    Ok: function() {
	  clearBlockedObject();
	  restore_options();
      $( this ).dialog( "close" );
    },
    Cancel: function() {
      $( this ).dialog( "close" );
    }
  }
});

$( "#dialogLista" ).dialog({
  autoOpen: false,
  resizable: true,
  height:350,
  width:650,
  modal: true,
  buttons: {
    Ok: function() {
      $( this ).dialog( "close" );
    }
  }
});

// apre il dialog della cancellazione
$( "#opener" ).click(function() {
  $( "#dialog" ).dialog( "open" );
});

// apre il dialog della lista degli oggetti bloccati
$( "a[id^='prefpersonal-']" ).click(openDialogLista);
$( "a[id^='preftracking-']" ).click(openDialogLista);
$( "a[id^='prefannoying-']" ).click(openDialogLista);

function openDialogLista(sender) {
  
  $("#oggettiTable tbody").empty();

  var type = sender.target.id.split('-')[1];
  var lista = getBlockedObject(type);
  var id = 1;
  lista.forEach(function(elem) {
    var rowParent = $('<tr data-tt-id="'+id+'" class="branch collapsed"><td><span class="indenter" style="padding-left: 0px;"></span>'+elem[0]+'</td><td></td></tr>');
	$("#oggettiTable").treetable("loadBranch", null, rowParent);
	var node = $("#oggettiTable").treetable("node", id);
	var idChild = 1;
	elem[1].forEach(function(child) {
	  var rowChild = $('<tr data-tt-id="'+id+'.'+idChild+'" data-tt-parent-id="'+id+'" class="leaf" style="display: none;"><td><span class="indenter">'+elem[0]+'</span></td><td>'+child+'</td></tr>');
	  $("#oggettiTable").treetable("loadBranch", node, rowChild);
	  idChild++;
	});
	id++;
  });

  $("#oggettiTable").treetable("collapseAll");
  $( "#dialogLista" ).dialog( "open" );
}

// restore della whitelist
function restoreWhitelistOptions(){
  $('#siti').empty();
  
  $.each(getWhitelist(), function (i, item) {
    $('#siti').append($('<option>', { 
        value: item,
        text : item 
    }));
  });
}


// Inizializzazione dei tab
$(function() {
$( "#tabs" ).tabs();
$( "#tabs-1" ).tabs();
$( "#tabs-2" ).tabs();
$( "#tabs-3" ).tabs();
$( "#tabs-4" ).tabs();
$( "#tabs-5" ).tabs();
});

// Inizializzazione della tabella condividi
$("#condividiTable").treetable({ expandable: true });
$("#oggettiTable").treetable({ expandable: true });


// Highlight selected row
$("#condividiTable tbody").on("mousedown", "tr", function() {
  $(".selected").not(this).removeClass("selected");
  $(this).toggleClass("selected");
});

// Hook sul cambio del radio button
$( "input[type=radio][name=privacy_level]" ).change(function() {
  // controllo il privacy level
  // ed imposto il livello di Privacy -> Informazioni personali
  // chiamando la funzione resetFunzionalita() con un array di parametri
  // composto dai valori:
  //   0 = disabilitato con valore false
  //   1 = disabilitato con valore true
  //   2 = abilitato    con valore false  
  switch($("input[type=radio][name=privacy_level]:checked").val()){
	  //se è BASSO
	  case '1':
		resetFunzionalita($("input[type=checkbox][name='prefpersonal[]']"), [2, 1, 0, 0, 2, 0, 0]);
		resetFunzionalita($("input[type=checkbox][name='preftracking[]']"), [0, 0, 0, 1, 0, 0, 0, 0, 0]);
		resetFunzionalita($("input[type=checkbox][name='prefannoying[]']"), [0, 0, 0, 0]);
		// nascondo il div con gli shortcut
		$('#personalizedProtection').toggle(false);
	  break;

	  //se è MEDIO
	  case '2':
		resetFunzionalita($("input[type=checkbox][name='prefpersonal[]']"), [2, 0, 1, 1, 0, 0, 0]);
		resetFunzionalita($("input[type=checkbox][name='preftracking[]']"), [2, 0, 1, 1, 1, 1, 1, 0, 0]);
		resetFunzionalita($("input[type=checkbox][name='prefannoying[]']"), [0, 0, 1, 0]);
		// nascondo il div con gli shortcut
		$('#personalizedProtection').toggle(false);
	  break;

	  //se è ALTO
	  case '3': 
		resetFunzionalita($("input[type=checkbox][name='prefpersonal[]']"), [2, 0, 0, 0, 2, 2, 1]);
		resetFunzionalita($("input[type=checkbox][name='preftracking[]']"), [2, 2, 0, 1, 0, 1, 1, 1, 0]);
		resetFunzionalita($("input[type=checkbox][name='prefannoying[]']"), [2, 0, 1, 0]);
		// nascondo il div con gli shortcut
		$('#personalizedProtection').toggle(false);
	  break;
	  
	  //se è CUSTOM
	  case '4': 
		resetFunzionalita($("input[type=checkbox][name='prefpersonal[]']"), [2, 2, 2, 2, 2, 2, 2]);
		resetFunzionalita($("input[type=checkbox][name='preftracking[]']"), [2, 2, 2, 2, 2, 2, 2, 2, 2]);
		resetFunzionalita($("input[type=checkbox][name='prefannoying[]']"), [2, 2, 2, 2]);
		// mosto il div con gli shortcut
		$('#personalizedProtection').toggle(true);
	  break;
	  
	  default: 
	    alert('Something wrong here... :(');
  }
});

// Hook sulla selezione di una checkbox, non so se serve ancora..
$( "input[type=checkbox][name='prefpersonal[]']" ).change(function() {
  $("input[type=checkbox][name='prefpersonal[]']:checked").each(function (){
	//alert($(this).val());
	// Ci dovrò fare qualcosa...
  })
});

//
$('#switchto1').click(function() {
	$("#tabs").tabs("option", "active", 1);
	$("#tabs-2").tabs("option", "active", 0);
});
$('#switchto2').click(function() {
	$("#tabs").tabs("option", "active", 1);
	$("#tabs-2").tabs("option", "active", 1);
});
$('#switchto3').click(function() {
	$("#tabs").tabs("option", "active", 1);
	$("#tabs-2").tabs("option", "active", 2);
});



// Da qui in poi tutte le label

document.getElementById("OptionsGeneralSettings_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsGeneralSettings_label")));
document.getElementById("OptionsLabel14_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel14_label")));
document.getElementById("OptionsLabel44_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel44_label")));
document.getElementById("OptionsLabel60_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel60_label")));
document.getElementById("OptionsLabel51_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel51_label")));

document.getElementById("OptionsLabel4_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel4_label")));
document.getElementById("OptionsLabel5_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel5_label")));

document.getElementById("Options_Customized").appendChild(document.createTextNode(chrome.i18n.getMessage("Options_Customized")));
document.getElementById("Options_Low").appendChild(document.createTextNode(chrome.i18n.getMessage("Options_Low")));
document.getElementById("Options_Medium").appendChild(document.createTextNode(chrome.i18n.getMessage("Options_Medium")));
document.getElementById("Options_High").appendChild(document.createTextNode(chrome.i18n.getMessage("Options_High")));

document.getElementById("OptionsLabel7_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel7_label")));
document.getElementById("OptionsLabel8_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel8_label")));

document.getElementById("OptionsLabel9_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel9_label")));
document.getElementById("OptionsLabel10_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel10_label")));
document.getElementById("OptionsLabel11_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel11_label")));

document.getElementById("switchto1").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel9_label")));
document.getElementById("switchto2").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel10_label")));
document.getElementById("switchto3").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel11_label")));

document.getElementById("Options_Low_desc").appendChild(document.createTextNode(chrome.i18n.getMessage("Options_Low_desc")));
document.getElementById("Options_Medium_desc").appendChild(document.createTextNode(chrome.i18n.getMessage("Options_Medium_desc")));
document.getElementById("Options_High_desc").appendChild(document.createTextNode(chrome.i18n.getMessage("Options_High_desc")));
document.getElementById("Options_Customized_desc").appendChild(document.createTextNode(chrome.i18n.getMessage("Options_Customized_desc")));

// tab 2.1
document.getElementById("OptionsLabel15_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel15_label")));
document.getElementById("OptionsLabel16_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel16_label")));
document.getElementById("OptionsLabel17_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel17_label")));
document.getElementById("OptionsLabel18_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel18_label")));
document.getElementById("OptionsLabel19_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel19_label")));
document.getElementById("OptionsLabel20_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel20_label")));
document.getElementById("OptionsLabel21_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel21_label")));
document.getElementById("OptionsLabel22_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel22_label")));
document.getElementById("OptionsLabel24_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel24_label")));
document.getElementById("OptionsLabel25_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel25_label")));
document.getElementById("OptionsLabel27_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel27_label")));

// tab 2.2
document.getElementById("OptionsLabel28_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel28_label")));
document.getElementById("OptionsLabel29_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel29_label")));
document.getElementById("OptionsLabel17bis_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel17_label")));
document.getElementById("OptionsLabel18bis_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel18_label")));
document.getElementById("OptionsLabel30_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel30_label")));
document.getElementById("OptionsLabel31_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel31_label")));
document.getElementById("OptionsLabel32_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel32_label")));
document.getElementById("OptionsLabel33_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel33_label")));
document.getElementById("OptionsLabel34_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel34_label")));
document.getElementById("OptionsLabel35_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel35_label")));
document.getElementById("OptionsLabel36_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel36_label")));
document.getElementById("OptionsLabel38_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel38_label")));
document.getElementById("OptionsLabel58_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel58_label")));


// tab 2.3
document.getElementById("OptionsLabel39_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel39_label")));
document.getElementById("OptionsLabel40_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel40_label")));
document.getElementById("OptionsLabel17ter_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel17_label")));
document.getElementById("OptionsLabel18ter_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel18_label")));
document.getElementById("OptionsLabel41_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel41_label")));
document.getElementById("OptionsLabel42_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel42_label")));
document.getElementById("OptionsLabel43_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel43_label")));
document.getElementById("OptionsLabel73_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel73_label")));

// tab 3.1
document.getElementById("OptionsLabel45_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel45_label")));
document.getElementById("OptionsLabel46_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel46_label")));
document.getElementById("OptionsLabel47_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel47_label")));
document.getElementById("OptionsLabel48_label").value = chrome.i18n.getMessage("OptionsLabel48_label");
document.getElementById("OptionsLabel50_label").value = chrome.i18n.getMessage("OptionsLabel50_label");


document.getElementById("OptionsLabel61_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel61_label")));
document.getElementById("OptionsLabel61bis_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel61_label")));
document.getElementById("OptionsLabel66_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel66_label")));
document.getElementById("OptionsLabel62_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel62_label")));
document.getElementById("OptionsLabel63_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel63_label")));
document.getElementById("OptionsLabel64_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel64_label")));
document.getElementById("OptionsLabel65_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel65_label")));
document.getElementById("OptionsLabel67_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel67_label")));
document.getElementById("OptionsLabel68_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel68_label")));
document.getElementById("OptionsLabel69_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel69_label")));
document.getElementById("OptionsLabel70_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel70_label")));


// tab 5.1
document.getElementById("OptionsLabel52_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel52_label")));
document.getElementById("OptionsLabel53_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel53_label")));
document.getElementById("OptionsLabel54_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel54_label")));
document.getElementById("OptionsLabel55_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel55_label")));
document.getElementById("OptionsLabel56_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel56_label")));
document.getElementById("OptionsLabel57_label").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel57_label")));

document.getElementById("version_label").appendChild(document.createTextNode(chrome.runtime.getManifest().version));
document.getElementById("author_label").appendChild(document.createTextNode(chrome.runtime.getManifest().author));
document.getElementById("appDesc").appendChild(document.createTextNode(chrome.i18n.getMessage("appDesc")));
document.getElementById("developer1").appendChild(document.createTextNode(chrome.i18n.getMessage("developer1")));
document.getElementById("developer2").appendChild(document.createTextNode(chrome.i18n.getMessage("developer2")));
document.getElementById("developer3").appendChild(document.createTextNode(chrome.i18n.getMessage("developer3")));
document.getElementById("developer4").appendChild(document.createTextNode(chrome.i18n.getMessage("developer4")));
document.getElementById("contributor1").appendChild(document.createTextNode(chrome.i18n.getMessage("contributor1")));
document.getElementById("contributor2").appendChild(document.createTextNode(chrome.i18n.getMessage("contributor2")));
document.getElementById("webSite").appendChild(document.createTextNode(chrome.i18n.getMessage("webSite")));