#!/usr/bin/env node

const handlebars = require('handlebars');
const {readFileSync} = require('fs');
const yaml = require('js-yaml');

const templateSource = readFileSync('word-list.handlebars', 'utf-8');

const data = yaml.safeLoad(readFileSync('word-lists/word-list.yaml'));

const template = handlebars.compile(templateSource);

console.log(template(data));
