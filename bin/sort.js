#!/usr/bin/env node

const {readFileSync} = require('fs');
const yaml = require('js-yaml');

const data = yaml.safeLoad(readFileSync(0, 'utf-8'));

const naturalCompare = require('string-natural-compare');

const alphabet = 'AaÄäBbCcDdEeËëFfGgHhIiÏïJjKkLlMmNnOoÖöPpQqRrSsTtÞþUuÜüVvWwXxYyZz';

// Sort entries themselves
data.entries.sort((a, b) => naturalCompare(a.word, b.word, alphabet));

data.entries.forEach(entry => {
	let key = 'other';
	try {
		if (entry.see) {
			key = 'see';
			entry.see.sort((a, b) => naturalCompare(a, b, alphabet));
		}
		if (entry.synonyms) {
			key = 'synonyms';
			entry.synonyms.sort((a, b) => naturalCompare(a, b, alphabet));
		}
	} catch (error) {
		console.error(`Error processing: ${entry.word} (${key})`);
		throw error;
	}
});

console.log(yaml.safeDump(data));
