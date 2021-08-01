#!/usr/bin/env node

import {readFileSync} from 'node:fs';

import yaml from 'js-yaml';

import filterObject from 'filter-obj';

import {compare} from './alphabet.js';

const rawData = yaml.load(readFileSync(0, 'utf-8'));

// Recreates an entry so that fields are in the correct order
function recreateEntry({entry, pos, meaning, synonyms, tags, template, see, ...rest}) {
	const object = {entry, pos, meaning, synonyms, tags, template, see, ...rest};
	return filterObject(object, (k, v) => v);
}

const data = rawData.map(entry => recreateEntry(entry));

// Sort entries themselves
data.sort((a, b) => {
	try {
		return compare(a.entry, b.entry);
	} catch (error) {
		console.error('Could not compare', a, b);
		throw error;
	}
});

for (const entry of data) {
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
		console.error(`Error processing: ${entry.entry} (${key})`);
		throw error;
	}
}

console.log(yaml.dump(data));
