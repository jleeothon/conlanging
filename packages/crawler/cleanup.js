import path from 'node:path';

import {loadJsonFile} from 'load-json-file';
import {packageDirectory} from 'pkg-dir';
import rx from 'rxjs';
import {writeJsonFileSync} from 'write-json-file';

const pkgDir = await packageDirectory();

const content = await loadJsonFile(path.join(pkgDir, 'crawler', 'data', 'data-0.json'));

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

const targetFileName = path.join(pkgDir, 'crawler', 'data', 'data-1.json');

writeJsonFileSync(targetFileName, cleanedUp, {indent: '\t'});
