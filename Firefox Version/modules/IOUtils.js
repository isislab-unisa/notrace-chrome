var EXPORTED_SYMBOLS = ["IOUtils"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/NetUtil.jsm");
Cu.import("resource://notrace/isisLogWrapper.js");

/**
 * This module simplify the I/O for the extension
 * */

let IOUtils = 
{
	_TXT_SUFFIX: ".txt",
	foStream: null,
	/**
	 * This logger should help to create a log file for NoTrace. But it is not used anymore. To be removed in the next version.
	 * */
	initLogger : function() {
		if(this.foStream == null){
			this.foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
               createInstance(Components.interfaces.nsIFileOutputStream);
		   	var file = Components.classes["@mozilla.org/file/directory_service;1"]
				.getService(Components.interfaces.nsIProperties)
				.get("ProfD", Components.interfaces.nsIFile);
			var path = Prefs.logfilepath;
		    file.initWithPath(path);
		    this.foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
			this.foStream.QueryInterface(Components.interfaces.nsIOutputStream);
			this.foStream.QueryInterface(Components.interfaces.nsISeekableStream);
			this.foStream.init(file, 0x02 | 0x10 | 0x40, 0777, 0);
			path=null;
			file=null;  
	   }
	},
	/**
	 * Utility to read from a file and execute a callback once the file has been readed
	 * The read is asyncronous
	 * */
	readFromFile: function(file, decode, callback){
	    try
	    {
			let uri = file instanceof Ci.nsIFile ? Services.io.newFileURI(file) : file;
			let channel = Services.io.newChannelFromURI(uri);
			channel.contentType = "text/plain";
			let converter = null;
				if (decode)
				{
					converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
					converter.charset = "utf-8";
				}
			channel.asyncOpen({
				buffer: "",
				lines: "" ,
				QueryInterface: XPCOMUtils.generateQI([Ci.nsIRequestObserver, Ci.nsIStreamListener]),
				onStartRequest: function(request, context) { },
				onDataAvailable: function(request, context, stream, offset, count)
					{
						
						let inputStream = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci.nsIScriptableInputStream);
						inputStream.init(stream);

						let data = this.buffer + inputStream.readBytes(count);
						let index = Math.max(data.lastIndexOf("\n"), data.lastIndexOf("\r"));
						if (index >= 0) //if file isn't empty
						{
							this.buffer = data.substr(index + 1);
							data = data.substr(0, index + 1);
							if (converter)
								data = converter.ConvertToUnicode(data);
							//dividiamo il pezzo in linee
							this.lines = data.split(/[\r\n]+/); //lines è un array che contiene le linee lette
							this.lines.pop();
							/*
							  for (let i = 0; i < lines.length; i++)
								isisLogWrapper.logToConsole(i+1 + "row: " + lines[i]);
						    */
						}
						else {
							this.lines = data;
							this.buffer = data;
						}

					},
					onStopRequest: function(request, context, result)
					{
						
						if (!Components.isSuccessCode(result)) //se non riesco a leggere genero un errore 
						{
							let e = Cc["@mozilla.org/js/xpc/Exception;1"].createInstance(Ci.nsIXPCException);
							e.initialize("File read operation failed", result, null, Components.stack, file, null);
							callback(e);
						}
						else //altrimenti chiamo la callback passando lines
							callback(this.lines);
					}
			
			},null);
		}
		catch (e)
		{
			callback(e);
		}
	},
	
	/**
    *   Save an array of strings in a file outside the XPI, in the Firefox Profile Directory
    */
	saveToFile: function(array,filename) {
		file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
		file.append("notracedb");
		file.append(filename);
		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);

		foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0); 
		var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
		converter.init(foStream, "UTF-8", 0, 0);
		for (var i=0;i<array.length;i++) {
			converter.writeString(array[i]+"\n");
			}
		converter.close();
		converter=null;
		foStream=null;
	},
	/**
	 * Simply save a file as a stream by copying it from another stream in the XPI to a stream associated to a file outside the XPI, in the Firefox Profile Direcotory
	 * */
	simplySaveToFile: function(array,filename) {
		try {
			var file = Components.classes["@mozilla.org/file/directory_service;1"]
				.getService(Components.interfaces.nsIProperties)
				.get("ProfD", Components.interfaces.nsIFile);
			file.append("notracedb");
			file.append(filename);
			var ostream = FileUtils.openSafeFileOutputStream(file, FileUtils.MODE_WRONLY | FileUtils.MODE_CREATE)
			var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
					createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
			converter.charset = "UTF-8";
			var istream = converter.convertToInputStream((typeof array == "string")?array:(array.join("\n")));

			// The last argument (the callback) is optional.
			NetUtil.asyncCopy(istream, ostream, function(status) {
			  if (!Components.isSuccessCode(status)) {
			    // Handle error!
			    return;
			  }
			  // Data has been written to the file.
			});

		} catch (e) {
			isisLogWrapper.logToConsole("Unable to update file "+filename+"\n" + e);
		}
	},
	/**
	 * Read the content of a file inside the XPI, refering to it with a Chrome URL. 
	 * It returns a String
	 * */
	getContentFromChromeURL: function(aURL) {
        var ioService=Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
        var scriptableStream=Components.classes["@mozilla.org/scriptableinputstream;1"].getService(Components.interfaces.nsIScriptableInputStream);
        var channel=ioService.newChannel(aURL,null,null);
        var input=channel.open();
        scriptableStream.init(input);
        var str=scriptableStream.read(input.available());
        scriptableStream.close();
        input.close();
        return str;
    },
    /**
     * Read the content of a file inside the XPI by addressing it with a Chrome URL
     * It returns an array
     * */
	getContentFromChromeURLasArray: function(aURL) {
		var ioService=Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
		var scriptableStream=Components.classes["@mozilla.org/scriptableinputstream;1"].getService(Components.interfaces.nsIScriptableInputStream);

		var channel=ioService.newChannel(aURL,null,null);
		var input=channel.open();
		scriptableStream.init(input);
		var str=scriptableStream.read(input.available());
		scriptableStream.close();
		input.close();
		var array=str.split("\n");
		return array;
	},
	
	/**
    *   This function read a stream from a file inside the XPI and write it to a file outside the XPI, in the Firefox Profile Directory
    */
	copyFileFromXPI: function(filename) {
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsIFile);
		file.append("notracedb");
		if( !file.exists() || !file.isDirectory() ) {   // if it doesn't exist, create
			file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
		}
		file = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsIFile);
		file.append("notracedb");
		file.append(filename);
		/*if( file.exists() && file.isFile() ) { 
			file.remove(false);
		}*/
		if( !file.exists() || !file.isFile() ) { 
			file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);
			var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
						   createInstance(Components.interfaces.nsIFileOutputStream);

			foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);
			var list=this.getContentFromChromeURL("chrome://notrace/content/lists/" + filename);
			var array=list.split("\n");
			var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].
							createInstance(Components.interfaces.nsIConverterOutputStream);
			converter.init(foStream, "UTF-8", 0, 0);
			for (var i=0;i<array.length-1;i++) {
                converter.writeString(array[i]+"\n");
            }
            converter.writeString(array[array.length-1]);
			converter.close();
			converter=null;
			foStream=null;
			//isisLogWrapper.logToConsole("Copied file "+filename);
		}
	}
}