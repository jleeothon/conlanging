#!/usr/bin/env node

const {readFileSync, writeFileSync} = require('fs');
const path = require('path');

const handlebars = require('handlebars');
const yaml = require('js-yaml');

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

[All entries](/word-list)

By part of speech:

{{#each parts}}
- [{{this.name}}]({{this.link}})
{{/each}}

By category:

{{#each categories}}
- [{{this.name}}]({{this.link}})
{{/each}}
`;

const renderWordList = handlebars.compile(wordListTemplate);
const renderReadme = handlebars.compile(readmeTemplate);

const wordListDir = fileName => path.join('word-list', fileName);

function run() {
	const allEntries = yaml.safeLoad(readFileSync(0, 'utf-8'));

	const wordListContent = renderWordList({entries: allEntries, title: 'Word list'});
	writeFileSync(wordListDir('all.md'), wordListContent);

	// Categories
	const categorySet = new Set();
	allEntries.forEach(({categories}) => categories && categories.forEach(c => categorySet.add(c)));
	const categories = [...categorySet].map(c => {
		return {name: c, fileName: `${c}.md`, link: `${c}.md`};
	});

	categories.forEach(({name, fileName}) => {
		const entries = allEntries.filter(({categories}) => categories && categories.includes(name));
		const newData = {entries, title: name};
		const content = renderWordList(newData);
		writeFileSync(wordListDir(fileName), content);
	});

	// Parts
	const partNames = ['noun', 'adjective', 'conjunction', 'preposition', 'adverb'];
	const parts = partNames.map(p => {
		return {name: p, fileName: `${p}.md`, link: `${p}.md`, part: p};
	});
	parts.forEach(({name, fileName, part}) => {
		const entries = allEntries.filter(({part: p}) => p === part);
		const newData = {entries, title: name};
		const content = renderWordList(newData);
		writeFileSync(wordListDir(fileName), content);
	});

	// Index
	const indexContent = renderReadme({parts, categories});
	writeFileSync(wordListDir('index.md'), indexContent);
}

run();

