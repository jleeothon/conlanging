import {readFileSync} from 'node:fs';
import path from 'node:path';

import yaml from 'js-yaml';

import projectRoot from './project-root.js';

const wordListPath = path.join(projectRoot, './data/word-list.yaml');

function castArray(x) {
	return Array.isArray(x) ? x : [x];
}

export const raw = yaml.load(readFileSync(wordListPath, 'utf-8'));

// With parts of speech as array
export const normalized = raw.map(({pos, ...rest}) => ({
	pos: castArray(pos),
	...rest,
}));

