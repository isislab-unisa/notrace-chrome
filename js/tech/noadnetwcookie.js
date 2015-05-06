function noadnetwcookie (headers) {
	for (i = 0, l = headers.length; i < l; i++) {
		if (headers[i].name == 'Set-Cookie') {
			headers[i].value = '';
		}
	}
	return headers;
}