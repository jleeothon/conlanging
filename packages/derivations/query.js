import process from 'node:process';

import rx from 'rxjs';
// import {packageDirectory} from 'pkg-dir';
import {program} from 'commander';

import data from "crawler";

// const pkgDir = await packageDirectory();

// const data = await loadJsonFile(path.join(pkgDir, '..', 'crawler', 'data', 'data-1.json'));

async function action(regexp) {
	const dataObservable = rx.from(data);
	const re = new RegExp(regexp);
	dataObservable
		.pipe(
			rx.filter(({lemma}) => re.test(lemma)),
			rx.map(({lemma}) => lemma),
		)
		.subscribe(lemma => {
			console.log(lemma);
		});
}

program.argument('<regexp>', 'regex to search').action(action);

program.parse(process.argv);
