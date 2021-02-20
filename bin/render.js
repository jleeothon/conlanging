#!/usr/bin/env node

const {readFileSync, writeFileSync} = require('fs');
const path = require('path');

const handlebars = require('handlebars');
const yaml = require('js-yaml');

const schema = require('./word-list-schema');

const wordListTemplate = `## {{title}}

{{#each entries}}
### {{word}}

{{#if part}}({{part}}){{/if}} {{#each inflections}}{{#unless @first}}, {{/unless}} _{{@key}}:_ **{{this}}**{{/each}}

{{meaning}}

{{#if see}}
See: {{#each see}}{{#unless @first}}, {{/unless}}[{{this}}](#{{this}}){{/each}}
{{/if}}

{{/each}}
`;

const readmeTemplate = `## Conlang1

[All entries](all.md)

By part of speech:

{{#each parts}}
- [{{this.name}}]({{this.link}})
{{/each}}

By tags:

{{#each tags}}
- [{{this.name}}]({{this.link}})
{{/each}}
`;

const renderWordList = handlebars.compile(wordListTemplate);
const renderReadme = handlebars.compile(readmeTemplate);

const wordListDir = fileName => path.join('word-list', fileName);

function run() {
	const allEntries = yaml.safeLoad(readFileSync(0, 'utf-8'));

	const wordListContent = renderWordList({entries: allEntries, title: 'Word list'});
	writeFileSync(wordListDir('All.md'), wordListContent);

	const tags = schema.definitions.tag.enum;
	// Const templates = schema.definitions.template.enum;
	const parts = schema.definitions.part.enum;

	const tagMapping = tags.map(c => {
		return {name: c, fileName: `${c}.md`, link: `${c}.md`};
	});

	tagMapping.forEach(({name, fileName}) => {
		const entries = allEntries
			.filter(({tags}) => tags && tags.includes(name));
		const newData = {entries, title: name};
		const content = renderWordList(newData);
		writeFileSync(wordListDir(fileName), content);
	});

	// Parts
	const partMapping = parts.map(p => {
		return {name: p, fileName: `${p}.md`, link: `${p}.md`};
	});
	partMapping.forEach(({name: filePart, fileName}) => {
		// Maps in order to recreate the order of fields
		const entries = allEntries
			.filter(({part: entryPart}) => entryPart === filePart || entryPart.includes(filePart));
		const newData = {entries, title: filePart};
		const content = renderWordList(newData);
		writeFileSync(wordListDir(fileName), content);
	});

	// Index
	const indexContent = renderReadme({
		parts: partMapping,
		tags: tagMapping
	});
	writeFileSync(wordListDir('index.md'), indexContent);
}

run();
