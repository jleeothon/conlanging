import pMap from 'p-map';
import {Graph} from 'redisgraph.js';
import delay from 'delay';
import VError from 'verror';

import data from './word-list.js';

const graph = new Graph('wordbook', 'localhost', 6379);

async function entryExists(entry) {
	console.log('Checking', entry.entry);
	const response = await graph.query('MATCH (a) WHERE a.id = $id RETURN a', {id: entry.entry});
	const firstRow = response.hasNext();
	if (firstRow) {
		console.log('Exists already', entry.entry);
		return true;
	}

	return false;
}

async function createEntry(entry) {
	const {entry: id, meaning, pos: pos0} = entry;
	const pos = Array.isArray(pos0) ? pos0 : [pos0];
	const data = {id, meaning, pos};
	console.log('Creating', data);
	await graph.query('CREATE ({id: $id, meaning: $meaning, pos: $pos})', data);
}

async function run() {
	await pMap(data, async entry => {
		const delayPromise = delay(10);
		try {
			if (!(await entryExists(entry))) {
				await createEntry(entry);
				console.log('Created entry', entry.entry);
			}

			await delayPromise;
		} catch (error) {
			throw new VError(error, 'Error with %s', JSON.stringify(entry));
		}
	}, {concurrency: 10});
}

run()
	.catch(error => {
		console.error(error);
	}).then(() => {
		console.log('Finished');
	}).finally(() => {
		graph.close();
	});
