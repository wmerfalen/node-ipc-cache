'use strict';

const lib = require('../src/index.js');

async function test_timeout_based_caching(){
	lib.set_timeout_seconds(10);
	let response = await lib.fetch('https://github.com/');
	console.log({response});

	console.log('**** Please wait ****');
	console.log(' Attempting to get cached version in 5 seconds... ');
	console.log(' When you see the phrase "Fetching..." you should IMMEDIATELY ');
	console.log(' see the response that was returned above. ^');
	setTimeout(async function(){
		console.log('Fetching...');
		let cached_response = await lib.fetch('https://github.com/');
		console.log({cached_response});
	},5000);
}

test_timeout_based_caching();
