#!/usr/bin/env node

import {readFile} from 'node:fs/promises';
import filterObject from 'filter-obj';
import yaml from 'js-yaml';

import {compare} from '../lib/alphabet.js';

const rawData = yaml.load(await readFile(0, 'utf-8'));

// Recreates an entry so that fields are in the correct order
function recreateEntry({pos, meaning, synonyms, tags, template, see, ...rest}) {
	const object = {pos, meaning, synonyms, tags, template, see, ...rest};
	return filterObject(object, (_k, v) => v);
}

const entries = Object.entries(rawData);

const data = entries.map(
	([lemma, entry]) => [lemma, recreateEntry(entry)]
);

// Sort entries themselves
data.sort(([lemmaA], [lemmaB]) => {
	try {
		return compare(lemmaA, lemmaB);
	} catch (error) {
		console.error('Could not compare', a, b);
		throw error;
	}
});

for (const entry of Object.values(data)) {
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
