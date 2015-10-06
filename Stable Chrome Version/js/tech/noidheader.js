function noidheader(header){
    var headerModified = false;
 
    for( var i = 0, l = header.length; i < l; i++ ) {
        if(header[i].name == 'Referer') {
            header[i].value = "";
            headerModified = true;
            continue;
        }
        if (header[i].name == 'User-Agent') {
            header[i].value = getRandomUserAgentOld(header[i].value);
        }
        if(header[i].name == 'From') {
            header[i].value = "";
            headerModified = true;
            continue;
        }
    }
    
    return headerModified;
}