import process from 'node:process';

import rx from 'rxjs';
import {program} from 'commander';

import data from 'crawler';

async function search(regexp) {
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

program.argument('<regexp>', 'regex to search').action(search);

program.parse(process.argv);
