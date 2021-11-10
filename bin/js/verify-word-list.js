#!/usr/bin/env node

import {readFileSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import Ajv from 'ajv';
import yaml from 'js-yaml';

import projectRoot from './project-root.js';

const schemaPath = path.join(projectRoot, 'word-list-schema.json');

const schema = yaml.load(readFileSync(schemaPath, 'utf-8'));

const ajv = new Ajv({allErrors: true, verbose: true});

const input = yaml.load(readFileSync(0, 'utf-8'));

const validate = ajv.compile(schema);
const valid = validate(input);

if (valid) {
	console.log('✓ Word list OK');
} else {
	const errorEntries = validate.errors.map(
		({instancePath, schemaPath, keyword, message, data}) => {
			const entryIndex = Number.parseInt(instancePath.split('/')[1], 10);
			const {entry} = input[entryIndex];
			return [entry, {schemaPath, keyword, message, data}];
		},
	);
	const errors = new Map(errorEntries);
	process.exitCode = 1;
	console.error(errors);
}
