function nojs(details) {
	if (details.type == "script") {
		return true;
	}
	// Else
	return false;
}