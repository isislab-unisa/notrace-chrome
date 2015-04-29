function nowebbug(){
	log("START NOWEBBUG");
	
	var list = new Array();
	
	$("img").each(function() {
		try{
			log(this.src);
			log(this.width + 'x' + this.height);
			if((this.width==this.height) && (this.width < 3)){ // Stiamo presupponendo che siano quadrate le immagini
				log("STOP NOWEBBUG TRUE: " + this.src);
				list.push(this.src);
				this.remove();
			} else {
				log("STOP NOWEBBUG FALSE");
			}
		} catch(ex){
		}
	});
	
	return list;
}