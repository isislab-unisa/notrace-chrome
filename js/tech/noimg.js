function noimg(details){

	log("START NOIMG: " + details.url);

	if(details.type == 'image') {
		log("STOP NOIMG TRUE: " + details.url);
		return true;
	}

	log("STOP NOIMG FALSE: " + details.url);
	return false;

}