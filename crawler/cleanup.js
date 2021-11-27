import path from 'node:path';
import {loadJsonFileSync} from 'load-json-file';
import {packageDirectorySync} from 'pkg-dir';
import rx, {firstValueFrom} from 'rxjs';
import {writeJsonFileSync} from 'write-json-file';

const pkgDir = packageDirectorySync();

const content = loadJsonFileSync(path.join(pkgDir, 'crawler', 'data-0.json'));

const observableContent = rx.from(content);

const reconstructionProtoGermanic = 'Reconstruction:Proto-Germanic/';

const cleanedUp = await firstValueFrom(observableContent.pipe(
	rx.filter(page => page.title.includes(reconstructionProtoGermanic)),
	rx.map(({title, ...rest}) => ({
		lemma: title.slice(reconstructionProtoGermanic.length), ...rest,
	})),
	rx.toArray(),
));

console.log(cleanedUp);

const targetFileName = path.join(pkgDir, 'crawler', 'data-1.json');

writeJsonFileSync(targetFileName, cleanedUp, {indent: '\t'});
