#!/usr/bin/env node

const {readFileSync} = require('fs');
const yaml = require('js-yaml');

const {compare} = require('./alphabet');

const data = yaml.safeLoad(readFileSync(0, 'utf-8'));

// Sort entries themselves
data.sort((a, b) => compare(a.word, b.word));

data.forEach(entry => {
	let key = 'other';
	try {
		if (entry.see) {
			key = 'see';
			entry.see.sort((a, b) => compare(a, b));
		}

		if (entry.synonyms) {
			key = 'synonyms';
			entry.synonyms.sort((a, b) => compare(a, b));
		}
	} catch (error) {
		console.error(`Error processing: ${entry.word} (${key})`);
		throw error;
	}
});

console.log(yaml.safeDump(data));
