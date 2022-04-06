'use strict';
let lib = module.exports;


lib.constants = {
	STORAGE_MECHANISMS: {
		FILE: 'file',
		RAM: 'ram',
		//MEMCACHE: 'memcache',
		//REDIS: 'redis',
		//FUNCTION: 'function',
	},
	DEFAULTS: {
		storage_mechanism: 'file',
		timeout_seconds: 60,
	},
};

/**
 * "private" members
 */
lib._storage_mechanism = lib.constants.DEFAULTS.storage_mechanism;
lib._cache_control = {};
lib._cache_control.timeout_seconds = lib.constants.DEFAULTS.timeout_seconds;
lib._transport = async function(url){
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
 * Set cache mechanism
 *
 * TODO: this is for phase 2
 */
/*
lib.set_storage_mechanism = function(mechanism) {
	if(!Object.keys(lib.constants.STORAGE_MECHANISMS).includes(mechanism)){
		throw 'Invalid storage mechanism';
	}
	lib._storage_mechanism = mechanism;
}
lib.get_storage_mechanism = () => lib._storage_mechanism;
*/


/**
 * Control how caches get invalidated
 */
lib.set_timeout_seconds = function(timeout){
	lib._cache_control.timeout_seconds = parseInt(timeout,10);
	if(isNaN(lib._cache_control.timeout_seconds)){
		throw new Error('Invalid timeout specified. Please use a valid integer');
	}
};

lib._instance_caches = {};
lib._invalidate_at = {};
lib.is_cached = async function({request, options = {}}){
	/** TODO: check filesystem */
	if(typeof lib._invalidate_at[request] !== 'undefined') {
		if(Date.now() >= lib._invalidate_at[request]){
			lib.invalidate({request,options});
			return false;
		}
		return true;
	}
	return typeof lib._instance_caches[request] !== 'undefined';
}
lib.get_cached = async function({request, options = {}}){
	return lib._instance_caches[request];
}
lib.cache = async function({request, response, options = {}}){
	//console.debug('cache called', {request,response,options});
	/** TODO: log to file */
	lib._instance_caches[request] = await response;
}

lib.set_failed = function({request, error = null, options = {}}){
	/** FIXME: need a better mechanism for flagging a failed workflow */
	delete lib._instance_caches[request];// = new Error(`error: ${error}`);
}
lib.invalidate = function({request, options = {}}){
	if(lib._instance_caches.hasOwnProperty(request)){
		delete lib._instance_caches[request];
		return true;
	}
	return false;
}

lib.set_transport = function(transport) {
	lib._transport = transport;
}

/**
 * Use case for URL's:
 * - If file exists on filesystem, fetch that
 * - else run URL fetch
 */

lib.fetch = async function(request, options = {}) {
	/**
	 * TODO: honor cache control headers
	 */
	if(await lib.is_cached({request, options})) {
		return lib.get_cached({request, options});
	}
	let response = await lib._transport(request,options).catch(function(error){
		lib.set_failed({request,options, error});
		lib.invalidate({request,options});
	});
	//console.log({request,options,response});
	console.log('Caching...');
	await lib.cache({request,response,options});
	return response;
}
