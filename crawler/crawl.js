import path from 'node:path';
import got from 'got';
import {packageDirectorySync} from 'pkg-dir';
import {writeJsonFileSync} from 'write-json-file';
import rx, {firstValueFrom} from 'rxjs';

// URL: https://en.wiktionary.org/w/api.php?action=query&format=json&cmpageid=4488666&list=categorymembers&cmlimit=10&cmcontinue=...

const defaultSearchParameters = {
	action: 'query',
	format: 'json',
	cmpageid: '4488666',
	list: 'categorymembers',
	cmlimit: '500',
};

async function * fetchPages() {
	let cmcontinue = null;
	do {
		const searchParameters = cmcontinue ? {...defaultSearchParameters, cmcontinue} : defaultSearchParameters;
		const options = {searchParams: searchParameters};
		// eslint-disable-next-line no-await-in-loop
		const data = await got('https://en.wiktionary.org/w/api.php', options).json();
		yield data;
		cmcontinue = data.continue?.cmcontinue;
	} while (cmcontinue);
}

const results = await firstValueFrom(rx.from(fetchPages()).pipe(
	rx.map(data => data.query.categorymembers),
	rx.toArray(),
));

const fileName = path.join(packageDirectorySync(), 'crawler', 'data-0.json');
writeJsonFileSync(fileName, results, {indent: '\t'});
