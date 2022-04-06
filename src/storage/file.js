'use strict';
let File = module.exports;

/** 
 * TODO: Define cache pattern tokens
 */
let Pattern = {};
Pattern.tokens = {
	DOMAIN: 'domain',
	URI: 'uri',
	TIME: 'time',
	DATE: 'date',
	DATETIME: 'datetime',
	EXT: 'extension',
	M_CUSTOM_FUNCTION: 'm-custom-function',
};



/**
 * TODO: Three ways to cache URL's with a file storage backend
 * 1) As long as the file exists, there will never be cache invalidation
 * 2) Timeout based.
 * 3) Cache control response headers
*/

File._cache_control = {};
File.cache_method = {
	FILE_EXISTS: 'file-exists',
	TIMEOUT: 'timeout',
};
/**
 * Set default values for the Filerary 
 * These can be changed by calling the `File.init()` function
 */
File._cache_control.method = File.cache_method.FILE_EXISTS;
File._cache_location = '/tmp/';
File._cache_pattern = 'cache-{DOMAIN}-{URI}-{TIME}.{EXT}';

File.init = function({options}){
	if(typeof options.method !== 'undefined'){
		if(!File.cache_method.includes(options.method)){
			throw new Error('Invalid method. Please use one of File.cache_method');
		}
		File._cache_control.method = options.method;
	}
	if(typeof options.location !== 'undefined'){
		File._cache_location = options.location;
		/** TODO: validate that this is a folder that exists and is writeable */
	}
	if(typeof options.pattern !== 'undefined') {
		File._cache_pattern = options.pattern;
	}
}

/**
 * "private" members
 */
File._cache_control.timeout_seconds = File.constants.DEFAULTS.timeout_seconds;
File._transport = async function(url){
	return new Promise(function(accept, reject) {
		setTimeout(function(){
			/** TODO: make this a default axios or curl function */
			accept([
				`<html>`,
				`<body>${url} was fetched. This is the default`,
				`transport used for node-ipc-cache. How about`,
				`changing me? :)`,
				`For more info, please see the README.md`,
				`</body></html>`,
			].join("\n<br/>"));
		}, 1500);
	});
}


/**
 * Control how caches get invalidated
 */
File.set_timeout_seconds = function(timeout){
	File._cache_control.timeout_seconds = parseInt(timeout,10);
	if(isNaN(File._cache_control.timeout_seconds)){
		throw new Error('Invalid timeout specified. Please use a valid integer');
	}
};

File._instance_caches = {};
File._invalidate_at = {};
File.is_cached = async function({request, options = {}}){
	/** TODO: check filesystem */
	if(typeof File._invalidate_at[request] !== 'undefined') {
		if(Date.now() >= File._invalidate_at[request]){
			File.invalidate({request,options});
			return false;
		}
		return true;
	}
	return typeof File._instance_caches[request] !== 'undefined';
}
File.get_cached = async function({request, options = {}}){
	return File._instance_caches[request];
}
File.cache = async function({request, response, options = {}}){
	//console.debug('cache called', {request,response,options});
	/** TODO: log to file */
	File._instance_caches[request] = await response;
}

File.set_failed = function({request, error = null, options = {}}){
	/** FIXME: need a better mechanism for flagging a failed workflow */
	delete File._instance_caches[request];// = new Error(`error: ${error}`);
}
File.invalidate = function({request, options = {}}){
	if(File._instance_caches.hasOwnProperty(request)){
		delete File._instance_caches[request];
		return true;
	}
	return false;
}
