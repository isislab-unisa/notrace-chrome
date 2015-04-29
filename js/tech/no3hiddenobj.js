function no3hiddenobj(details){

	log("START NO3HIDDENOBJ: " + details.url);
	if(details.type != 'script') {
		log("STOP NO3HIDDENOBJ FALSE: " + details.url);
		return false;
	}
	
	var isScriptVer = getArrayOfBlockedScript();
	var scriptName = getScriptNameFromUrl(details.url);

	for( var i = 0; i < isScriptVer.length; i++ ) {
		if(new RegExp(isScriptVer[i]).test(scriptName)){
			log("STOP NO3HIDDENOBJ TRUE: " + details.url);
			return true;
		}
		
	}
	log("STOP NO3HIDDENOBJ FALSE: " + details.url);
	return false;
}

function getArrayOfBlockedScript(){
  return new Array(
    "show_ads.js", "counter.js", "AC_RunActiveContent.js", "swfobject.js", "rollover.js", "common.js", 
    "animate.js", "init.js", "script.js", "scripts.js", "getcod.cgi", "hb.js", "global.js", "functions.js", 
    "code-end.js", "code-start.js", "code-middle.js", "lycosRating.js.php", "basic.js", "CSScriptLib.js", 
    "scriptaculous.js", "geov2_001.js", "popup.js", "flashobject.js", "navbar", "WebResource.axd",
    "adx.js", "lightbox.js", "code.php", "javascript.js", "__utm.js", "hbx.js", "ieupdate.js", "s_code.js", 
    "menu_com.js", "stm31.js", "overlib.js", "brand", "flash.js", "milonic_src.js", "m.js", "s.js", 
    "counter_xhtml.js", "javascript_757c080409.js", "ajax.js", "trafic.js", "default.js", "quant.js", 
    "ExternalRedirect.dll", "general.js", "s_code_remote.js", "sifr.js", "nav.js", "pphlogger.js", 
    "stmenu.js", "date.js", "styleswitcher.js", "header.js", "utils.js", "calendar.js", "fw_menu.js", 
    "template.js", "js.js", "phpmyvisites.js", "x.js", "dnncore.js", "mmenu.js", "navigation.js", 
    "effects.js", "copyright.js", "ufo.js", "frames.js", "counter.php", "coolmenus4.js", "templates.js", 
    "slf.js", "xaramenu.js", "spmenu.js", "lib.js", "mootools.js", "url.js", "javascripts.js", "index.php",
    "slideshow.js", "sitetree.js", "scroll.js", "AC_ActiveX.js", "ScriptResource.axd", "style.js", 
    "vbulletin_md5.js", "cookies.js", "getseal", "menu_data.js", "user.js", "xoops.js", "mouseover.js", 
    "HM_Loader.js", "footer.js", "ads.js", "get.media", "vbulletin_global.js", "vbulletin_menu.js", 
    "scroller.js", "overlib_mini.js", "custom.js", "search.js", "front.asp", "exmplmenu_var.js", 
    "thickbox.js", "util.js", "script.php", "drupal.js", "awstats_misc_tracker.js", "embed.js", 
    "sniffer.js", "window.js", "weborama.js", "validation.js", "gw.js", "stat.php", "v52.js", "stat.js", 
    "php-stats.js.php", "geov2_000.js", "menu_array.js", "mm.js", "geov2.js", "tools.js", "yahoo-min.js", 
    "site.js", "afstrack.cgi", "core.js", "browser.js", "conversion.js", "base.js", "event-min.js", 
    "skypeCheck.js", "preload.js", "dom-min.js", "moo.fx.js", "java.js", "wz_tooltip.js", 
    "gemius.js", "prototype.lite.js", "AC_OETags.js", "data.js", "cookie.js", "menus.js", "tooltip.js", 
    "mm_css_menu.js", "tiny_mce.js", "dropdown.js", "v53.js", "p7popmenu.js", "1533466593-widgets.js", 
    "si.js", "wsv2.cgi", "jscript.js", "KonaLibInline.js", "wikibits.js", "stats.js", "p_code.js", 
    "rollovers.js", "urchin.js", "ga.js", "beacon.js"
  );
}

function escape(text) {
	return text.replace(/[-\\{}()*+?.,\\^$|#\s]/g, "\\$&");
}