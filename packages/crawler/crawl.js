import path from 'node:path';
import got from 'got';
import {packageDirectorySync} from 'pkg-dir';
import {writeJsonFileSync} from 'write-json-file';
import rx, {firstValueFrom} from 'rxjs';

// URL: https://en.wiktionary.org/w/api.php?action=query&format=json&cmpageid=4488666&list=categorymembers&cmlimit=10&cmcontinue=...

const searchParameters = {
	action: 'query',
	format: 'json',
	cmpageid: '4488666',
	list: 'categorymembers',
	cmlimit: '500',
};

async function * fetchPages() {
	const url = 'https://en.wiktionary.org/w/api.php';

	let options = {searchParams: searchParameters};
	let cmcontinue = null;

	do {
		// eslint-disable-next-line no-await-in-loop
		const data = await got(url, options).json();
		yield * data.query.categorymembers;

		cmcontinue = data?.continue?.cmcontinue;
		options = {searchParams: {...searchParameters, cmcontinue}};
	} while (cmcontinue);
}

const observableMembers = rx.from(fetchPages());

const results = await firstValueFrom(
	observableMembers.pipe(
		rx.toArray(),
	),
);

const fileName = path.join(packageDirectorySync(), 'data', 'data-0.json');

writeJsonFileSync(fileName, results, {indent: '\t'});
