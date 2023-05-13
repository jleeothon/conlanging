#!/usr/bin/env node

import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';

import handlebars from 'handlebars';
import yaml from 'js-yaml';

import projectRoot from './project-root.js';

const schemaPath = path.join(projectRoot, './word-list-schema.json');
const schemaText = readFileSync(schemaPath, 'utf8');
const schema = JSON.parse(schemaText);

const wordListPath = path.join(projectRoot, 'templates', 'word-list.md.hjs');
const readmePath = path.join(projectRoot, 'templates', 'readme.md.hjs');

const wordListTemplate = readFileSync(wordListPath, 'utf8');
const readmeTemplate = readFileSync(readmePath, 'utf8');

const renderWordList = handlebars.compile(wordListTemplate);
const renderReadme = handlebars.compile(readmeTemplate);

const wordListDir = fileName => path.join('word-list', fileName);

function run() {
	const allEntries = yaml.load(readFileSync(0, 'utf8'));

	// All
	const wordListContent = renderWordList({
		entries: allEntries,
		title: 'Word list',
	});
	writeFileSync(wordListDir('All.md'), wordListContent);

	const parts = schema.definitions.pos.enum;
	const templates = schema.definitions.template.enum;
	const tags = schema.definitions.tag.enum;

	// Parts
	const partMapping = parts.map(p => ({
		name: p,
		fileName: `${p}.md`,
		link: `${p}.md`,
	}));
	const isPartOrIncludes = (sought, current) =>
		current === sought || current.includes(sought);
	for (const {name, fileName} of partMapping) {
		const entries = allEntries.filter(({pos}) => isPartOrIncludes(name, pos));
		const newData = {entries, title: name};
		const content = renderWordList(newData);
		writeFileSync(wordListDir(fileName), content);
	}

	// Templates
	const templateMapping = templates.map(t => ({
		name: t,
		fileName: `${t}.md`,
		link: `${t}.md`,
	}));
	for (const {name, fileName} of templateMapping) {
		const entries = allEntries.filter(({template}) => template === name);
		const newData = {entries, title: name};
		const content = renderWordList(newData);
		writeFileSync(wordListDir(fileName), content);
	}

	// Tags
	const tagMapping = tags.map(c => ({
		name: c,
		fileName: `${c}.md`,
		link: `${c}.md`,
	}));
	for (const {name, fileName} of tagMapping) {
		const entries = allEntries.filter(
			({tags}) => tags && tags.includes(name),
		);
		const newData = {entries, title: name};
		const content = renderWordList(newData);
		writeFileSync(wordListDir(fileName), content);
	}

	// Index
	const indexContent = renderReadme({
		partsOfSpeech: partMapping,
		templates: templateMapping,
		tags: tagMapping,
	});
	writeFileSync(wordListDir('index.md'), indexContent);
}

run();
