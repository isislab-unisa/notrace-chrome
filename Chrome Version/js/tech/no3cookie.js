function no3cookie(details, requestHeaders){

	var host = httpChannel.getRequestHeader("Host");
	var cookie = httpChannel.getResponseHeader("Set-Cookie");
	var ref = httpChannel.getRequestHeader("Referer");

	if(cookie!=null && ref!=null){
		var hostsplit = host.split(".");
		var hsl = hostsplit.length;
		var objDomain = hostsplit[hsl-2]+"."+hostsplit[hsl-1];
		var refDomain = this.getDomain(ref);

		if(refDomain!=objDomain){
			var cResValue=new Array();
			cResValue=this.getCookieValue(cookie,"Set-Cookie",objDomain,refDomain);	
			this.checkDBLocalStorage_Cookies(objDomain,refDomain,cResValue);
			httpChannel.setResponseHeader("Set-Cookie", "", false);
		}
	}
}

function getCookieValue (cookieValue,tipologia,host,referer){
	
	var cookies=new Array();
	var arrayCook=new Array();
	if(tipologia=="Cookie"){
		cookies=this.dividiCookie(cookieValue);
		var clen = cookies.length;
		var curcookie;
		var cookiename;
		for(var i=0;i<clen;i++){
			curcookie = cookies[i];
			cookiename = this.getCookieName(curcookie);
			if(/path|domain|expires|httponly/gi.test(cookiename)!=true){
				arrayCook.push(cookiename);
			}
		}
		curcookie=null;
		cookiename=null;
		clen=null;
	} else
		if(tipologia=="Set-Cookie"){
			cookies=this.dividiSetCookie(cookieValue);
			var clen = cookies.length;
			var curcookie;
			var cookiename;
			for(var i=0;i<clen;i++){
				curcookie = cookies[i];
				cookiename = this.getCookieName(curcookie);
				if(/path|domain|expires|httponly/gi.test(cookiename)!=true){
					arrayCook.push(cookiename);
				}
			}
			curcookie=null;
			cookiename=null;
			clen=null;
		}
	cookies=null;
	return arrayCook;
}