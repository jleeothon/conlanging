#!/usr/bin/env node

'use strict';

const {readFileSync} = require('fs');

const yaml = require('js-yaml');
const filterObject = require('filter-obj');

const {compare} = require('./alphabet');

const rawData = yaml.safeLoad(readFileSync(0, 'utf-8'));

// Recreates an entry so that fields are in the correct order
function recreateEntry({word, part, meaning, synonyms, tags, see}) {
	return filterObject({word, part, meaning, synonyms, tags, see}, (k, v) => v);
}

const data = rawData.map(entry => recreateEntry(entry));

// Sort entries themselves
data.sort((a, b) => {
	try {
		return compare(a.word, b.word);
	} catch (error) {
		console.error('Could not compare', a, b);
		throw error;
	}
});

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
