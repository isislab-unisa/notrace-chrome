var background = chrome.extension.getBackgroundPage();

function mostra_finestra_help () {
	$("#titolo_barra_superiore").html(chrome.i18n.getMessage("OptionsLabel16_label"));
	$("#titolo_barra_inferiore").html(chrome.i18n.getMessage("OptionsLabel17_label"));
	$("#contenuto_parte_superiore_main").css("display", "none");
	$("#contenuto_parte_superiore_help").css("display", "block");
	$("#contenuto_parte_inferiore_main").css("display", "none");
	$("#contenuto_parte_inferiore_help").css("display", "block");
	$("#pulsante_destro_main").css("display", "none");
	$("#pulsante_destro_help").css("display", "inline");
}

function mostra_finestra_main () {
	$("#parte_inferiore").css("display", "block");
	$("#titolo_barra_superiore").html(chrome.i18n.getMessage("OptionsLabel1_label"));
	$("#titolo_barra_inferiore").html(chrome.i18n.getMessage("OptionsLabel12_label"));
	$("#contenuto_tecnica_1").css("display", "none");
	$("#contenuto_tecnica_2").css("display", "none");
	$("#parte_superiore").height("68mm");
	$("#contenuto_parte_superiore_main").css("display", "block");
	$("#contenuto_parte_superiore_help").css("display", "none");
	$("#contenuto_parte_inferiore_main").css("display", "block");
	$("#contenuto_parte_inferiore_help").css("display", "none");
	$("#pulsante_destro_main").css("display", "inline");
	$("#pulsante_destro_help").css("display", "none");
    carica_scelta_whitelist();
}

function mostra_dettagli (e) {
	$("#titolo_barra_superiore").html(($("#titolo_" + $(this).attr("id")).html()));
	$("#contenuto_parte_superiore_main").css("display", "none");
	$("#parte_inferiore").css("display", "none");
	$("#pulsante_destro_main").css("display", "none");
	$("#pulsante_destro_help").css("display", "inline");
	$("#parte_superiore").height("88mm");
	$("#contenuto_" + $(this).attr("id")).css("display", "block");
}

function aggiungi_a_whitelist (e) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var domain = getDomainFromUrl(tabs[0].url);
        
        if (isInWhiteList(domain)) { // Se era in whitelist...
            removeFromWhiteList(domain); // ...allora lo devo rimuovere
            $("#titolo_barra_inferiore").text(chrome.i18n.getMessage("OptionsLabel12_label"));
            $("#aggiunta_whitelist").text(chrome.i18n.getMessage("OptionsLabel13_label"));
        }
        else { // Altrimenti lo devo aggiungere nella whitelist
            addToWhiteList(domain);
            $("#titolo_barra_inferiore").text(chrome.i18n.getMessage("OptionsLabel35_label"));
            $("#aggiunta_whitelist").text(chrome.i18n.getMessage("OptionsLabel36_label"));
        }
    });
}

function carica_scelta_whitelist (e) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var domain = getDomainFromUrl(tabs[0].url);
        
        if (isInWhiteList(domain)) { // Il dominio è nella whitelist
            $("#titolo_barra_inferiore").text(chrome.i18n.getMessage("OptionsLabel35_label"));
            $("#aggiunta_whitelist").text(chrome.i18n.getMessage("OptionsLabel36_label"));
        }
        else { // Il dominio non è nella whitelist
            $("#titolo_barra_inferiore").text(chrome.i18n.getMessage("OptionsLabel12_label"));
            $("#aggiunta_whitelist").text(chrome.i18n.getMessage("OptionsLabel13_label"));
        }
    });
}

function sospendi_notrace (e) {
    if (localStorage['noTraceSospeso'] === 'true') { // Era già sospeso => Dobbiamo riattivarlo!
        localStorage['noTraceSospeso'] = false; // Riattivato!
        $("#testo_pulsante_sospendi").text(chrome.i18n.getMessage("OptionsLabel15_label"));
        $("#corpo").css("visibility", "visible");
        $("#sospensione").css("display", "none");
        mostra_finestra_main();
    }
    else { // Bisogna sospendere NoTrace
        localStorage['noTraceSospeso'] = true;
        $("#testo_pulsante_sospendi").text(chrome.i18n.getMessage("OptionsLabel34_label"));
        $("#corpo").css("visibility", "hidden");
        $("#sospensione").css("display", "block");
        $("#pulsante_destro_main").css("display", "none");
        $("#pulsante_destro_help").css("display", "none");
    }
}

function salva_preferenza (e) {
	var nome_preferenza = e.target.name;
	nome_preferenza = nome_preferenza.substring(0, nome_preferenza.indexOf('[]'));
	
	localStorage[nome_preferenza + "[" + e.target.value + "]"] = $(this).is(':checked');
}

function carica_preferenze () {
	$(".onoffswitch-checkbox").each(function() { // Qui carichiamo i selettori delle tecniche...
		$(this).attr('checked', localStorage[$(this).attr("name").split("[]")[0] + "[" + $(this).val() + "]"] === 'true');
	});
	$("#checkbox_dati_anonimi").attr('checked', localStorage["datianonimi"] === 'true'); // ...qui il selettore per l'invio di dati anonimi

    if (localStorage['noTraceSospeso'] === 'true') {
        document.getElementById("testo_pulsante_sospendi").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel34_label")));
        $("#corpo").css("visibility", "hidden");
        $("#sospensione").css("display", "block");
        $("#pulsante_destro_main").css("display", "none");
    }
    else {
        document.getElementById("testo_pulsante_sospendi").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel15_label")));
    }
}

function apri_lista_dettagli (evento) {
  var tipo = evento.target.parentNode.id.split('_')[1]; // Recuperiamo il nome della tecnica
  var lista = getBlockedObject(tipo); // Recuperiamo dal database la lista degli elementi bloccati per quella tecnica
  
  if (!evento.target.parentNode.attributes.getNamedItem("open")) { // Solo se la lista è aperta dobbiamo inserire gli elementi
	document.getElementById("dettagli_" + evento.target.id).innerHTML = ""; // Innanzitutto resetto la lista
	lista.forEach(function(elemento) { // Inserisco gli elementi nella lista, uno alla volta
		var listaDettagli = document.createElement("details");
		var titolo = document.createElement("summary");
		titolo.innerHTML = elemento[0]; // Il titolo della lista sarebbe il dominio
		listaDettagli.appendChild(titolo); // Inseriamo il titolo alla lista
	
		listaDettagli.appendChild(document.createElement("br"));
	
		elemento[1].forEach(function(oggetto) { // Il secondo oggetto di elemento è un array con tutti gli oggetti bloccati per il dominio considerato
			var daAggiungere = document.createElement("p");
			daAggiungere.innerHTML = oggetto;
			listaDettagli.appendChild(daAggiungere);
		});
	
		listaDettagli.appendChild(document.createElement("br"));
		document.getElementById("dettagli_" + evento.target.id).appendChild(listaDettagli); // Inseriamo la lista di oggetti al pannello
	});
  }
}

// Ad ogni checkbox associamo il listener che salva la preferenza associata nel Local Storage
$(document).ready(function () {
	$("input[class=onoffswitch-checkbox]").each(function(){
		$(this).click(salva_preferenza);
	});
	// Quando dobbiamo mostrare la lista degli elementi bloccati di una particolare tecnica
	$( "details[id^='dettagli_']" ).click(apri_lista_dettagli); // Il ^ sta per: tutti gli elementi details con id che inizia per dettagli_
	$("#checkbox_dati_anonimi").click(function () { // Impostiamo il listener per la casella dei dati anonimi nella pagina di help
		localStorage["datianonimi"] = $(this).is(':checked');
	});
	carica_preferenze();
    carica_scelta_whitelist();
});

document.getElementById("pulsante_sinistro").addEventListener("click", sospendi_notrace);
document.getElementById("pulsante_destro_main").addEventListener("click", mostra_finestra_help);
document.getElementById("pulsante_destro_help").addEventListener("click", mostra_finestra_main);
document.getElementById("tecnica_1").addEventListener("click", mostra_dettagli);
document.getElementById("tecnica_2").addEventListener("click", mostra_dettagli);
document.getElementById("aggiunta_whitelist").addEventListener("click", aggiungi_a_whitelist);


// Prendiamo dallo storage il numero totale di elementi bloccati dall'estensione
document.getElementById("elementi_totali_bloccati").innerHTML = localStorage['numeroElementi'];

// Qui impostiamo tutte le label, in modo dinamico, in base alla lingua dell'utente
document.getElementById("versione").appendChild(document.createTextNode(chrome.i18n.getMessage("version")));
document.getElementById("sito").appendChild(document.createTextNode(chrome.i18n.getMessage("webSite")));
document.getElementById("autore").appendChild(document.createTextNode(chrome.i18n.getMessage("appAuthor")));
document.getElementById("sviluppatori").appendChild(document.createTextNode(chrome.i18n.getMessage("developers")));
document.getElementById("titolo_barra_superiore").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel1_label")));
document.getElementById("titolo_tecnica_1").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel3_label")));
document.getElementById("titolo_tecnica_2").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel4_label")));
document.getElementById("messaggio_home").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel5_label")));
document.getElementById("messaggio_home_elementi").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel6_label")));
document.getElementById("descrizione_app").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel7_label")));
document.getElementById("titolo_versione").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel8_label")));
document.getElementById("titolo_sito").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel9_label")));
document.getElementById("titolo_autore").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel10_label")));
document.getElementById("titolo_sviluppatori").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel11_label")));
document.getElementById("titolo_barra_inferiore").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel12_label")));
document.getElementById("aggiunta_whitelist").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel13_label")));
document.getElementById("invia_dati_anonimi").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel14_label")));
document.getElementById("track_1").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel19_label")));
document.getElementById("track_2").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel25_label")));
document.getElementById("track_3").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel26_label")));
document.getElementById("track_4").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel27_label")));
document.getElementById("track_5").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel31_label")));
document.getElementById("track_6").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel33_label")));
document.getElementById("ads_1").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel30_label")));
document.getElementById("ads_2").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel29_label")));
document.getElementById("ads_3").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel32_label")));
document.getElementById("ads_4").appendChild(document.createTextNode(chrome.i18n.getMessage("OptionsLabel28_label")));

var contatori = background.getContatori();

// Aggiorno il numero di elementi bloccati nella pagina selezionata
$("#tecnica_1").text(contatori[0]);
$("#tecnica_2").text(contatori[1]);