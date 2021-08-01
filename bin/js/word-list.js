import {readFileSync} from 'node:fs';
import path from 'node:path';

import yaml from 'js-yaml';

import projectRoot from './project-root.js';

const wordListPath = path.join(projectRoot, './data/word-list.yaml');

export const raw = yaml.safeLoad(readFileSync(wordListPath, 'utf-8'));

function castArray(x) {
	return Array.isArray(x) ? x : [x];
}

// With parts of speech as array
export const normalized = data.map(({pos, ...rest}) => ({
	pos: castArray(pos),
	...rest,
}));

