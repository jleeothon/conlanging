import path from 'node:path';

import {packageDirectory} from 'pkg-dir';
import rx from 'rxjs';
import {writeJsonFileSync} from 'write-json-file';

import content from './data/data-0.json' assert { type: 'json' };

const observableContent = rx.of(...content);

const reconstructionProtoGermanic = 'Reconstruction:Proto-Germanic/';

const cleanedUp = await rx.firstValueFrom(
	observableContent.pipe(
		rx.filter(page => console.log(page) || page.title.includes(reconstructionProtoGermanic)),
		rx.map(({title, ...rest}) => ({
			lemma: title.slice(reconstructionProtoGermanic.length),
			...rest,
		})),
		rx.toArray(),
	),
);

const pkgDir = await packageDirectory();
const targetFileName = path.join(pkgDir, 'data', 'data-1.json');

writeJsonFileSync(targetFileName, cleanedUp, {indent: '\t'});
