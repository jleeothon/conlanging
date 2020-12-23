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

- [All entries](/word-list)
{{#each categories}}
- [{{this.name}}]({{this.link}})
{{/each}}
`;

const renderWordList = handlebars.compile(wordListTemplate);
const renderReadme = handlebars.compile(readmeTemplate);

const outDir = './docs';

function writeFile(fileName, content) {
	writeFileSync(path.join(outDir, fileName), content);
}

function run() {
	const allEntries = yaml.safeLoad(readFileSync(0, 'utf-8'));

	const wordListContent = renderWordList({entries: allEntries, title: 'Word list'});
	writeFile('word-list.md', wordListContent);

	// Categories
	const categorySet = new Set();
	allEntries.forEach(({categories}) => categories && categories.forEach(c => categorySet.add(c)));
	const categories = [...categorySet].map(c => {
		return {name: c, fileName: `${c}.md`, link: `/${c}`};
	});

	categories.forEach(({name, fileName}) => {
		const entries = allEntries.filter(({categories}) => categories && categories.includes(name));
		const newData = {entries, title: name};
		const content = renderWordList(newData);
		writeFile(fileName, content);
	});

	// Parts
	const partNames = ['noun', 'adjective', 'conjunction', 'preposition', 'adverb'];
	const parts = partNames.map(p => {
		return {name: p, fileName: `${p}.md`, link: `/${p}`, part: p};
	});
	parts.forEach(({name, fileName, part}) => {
		const entries = allEntries.filter(({part: p}) => p === part);
		const newData = {entries, title: name};
		const content = renderWordList(newData);
		writeFile(fileName, content);
	});

	// Index categories
	const indexCategories = parts.concat(categories);
	// Console.log(indexCategories);
	// process.exit(1);
	const indexContent = renderReadme({categories: indexCategories});
	writeFile('index.md', indexContent);
}

run();

