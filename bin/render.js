#!/usr/bin/env node

const {readFileSync, writeFileSync} = require('fs');
const path = require('path');

const handlebars = require('handlebars');
const yaml = require('js-yaml');

const wordListTemplateSource = `## {{title}}

{{#each entries}}
### {{word}}

{{#if part}}({{part}}){{/if}} {{#each inflections}}{{#unless @first}}, {{/unless}} _{{@key}}:_ **{{this}}**{{/each}}

{{meaning}}

{{#if see}}
See: {{#each see}}{{#unless @first}}, {{/unless}}[{{this}}](#{{this}}){{/each}}
{{/if}}

{{/each}}
`;

const readmeTemplateSource = `## Conlang1

- All entries
{{#each categories}}
- [{{this.name}}]({{this.link}})
{{/each}}
`

const wordListTemplate = handlebars.compile(wordListTemplateSource);
const readmeTemplate = handlebars.compile(readmeTemplateSource);

const outDir = './pages';

function writeFile(fileName, title, data) {
	const dataWithTitle = {title, ...data};
	writeFileSync(path.join(outDir, fileName), wordListTemplate(dataWithTitle));
}

function run() {
	const data = yaml.safeLoad(readFileSync(0, 'utf-8'));

	writeFile('word-list.md', 'Word list', data);

	// Categories
	const categorySet = new Set();
	data.entries.forEach(({categories}) => categories && categories.forEach(c => categorySet.add(c)));
	const categories = [...categorySet].map(c => {
		const fileName = c + '.md';
		const link = '/' + c;
		return {name: c, fileName, link};
	});
	categories.forEach(({name: category, fileName}) => {
		const entries = data.entries.filter(({categories}) => categories && categories.includes(category));
		const newData = {entries};
		writeFile(fileName, category, newData);
	});

	// Parts
	const partNames = ['noun', 'adjective', 'conjunction', 'preposition', 'adverb'];
	const parts = partNames.map(p => {
		const fileName = p + '.md';
		const link = '/' + c;
		return {name: p, fileName, link};
	});
	parts.forEach(part => {
		const entries = data.entries.filter(({part: p}) => p === part);
		const newData = {entries};
		writeFile(part + '.md', part, newData);
	});

	// Index categories
	const indexCategories = parts + categories;
	writeFileSync(path.join(outDir, 'index.md'), readmeTemplate({categories: indexCategories}));
}

run();

