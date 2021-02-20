#!/usr/bin/env node

'use strict';

const {readFileSync} = require('fs');

const Ajv = require('ajv').default;
const yaml = require('js-yaml');

const schema = require('./word-list-schema');

const ajv = new Ajv({allErrors: true, allowUnionTypes: true, verbose: true});

const validate = ajv.compile(schema);

const data = yaml.safeLoad(readFileSync(0, 'utf-8'));

const valid = validate(data);
if (!valid) {
	console.error(validate.errors);
	process.exitCode = 1;
}

console.log('✓ Word list OK');
