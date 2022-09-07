import path from 'node:path';

import {loadJsonFile} from 'load-json-file';
import {packageDirectory} from 'pkg-dir';

const pkgDir = await packageDirectory();
const content = await loadJsonFile(path.join(pkgDir, 'data', 'data-0.json'));

export default content;
