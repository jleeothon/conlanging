#!/usr/bin/env node

const {readFileSync, writeFileSync} = require('fs');
const path = require('path');

const handlebars = require('handlebars');
const yaml = require('js-yaml');

const templateSource = `## {{title}}

{{#each entries}}
### {{word}}

{{#if part}}({{part}}){{/if}} {{#each inflections}}{{#unless @first}}, {{/unless}} _{{@key}}:_ **{{this}}**{{/each}}

{{meaning}}

{{#if see}}
See: {{#each see}}{{#unless @first}}, {{/unless}}[{{this}}](#{{this}}){{/each}}
{{/if}}

{{/each}}
`;

const template = handlebars.compile(templateSource);

const outDir = './out';

function writeFile(fileName, title, data) {
	const dataWithTitle = {title, ...data};
	writeFileSync(path.join(outDir, fileName), template(dataWithTitle));
}

function run() {
	const data = yaml.safeLoad(readFileSync(0, 'utf-8'));

	writeFile('word-list.md', 'Word list', data);

	const categoriesSet = new Set();
	data.entries.forEach(({categories}) => categories && categories.forEach(c => categoriesSet.add(c)));

	categoriesSet.forEach(category => {
		const entries = data.entries.filter(({categories}) => categories && categories.includes(category));
		const newData = {entries};
		writeFile(category + '.md', category, newData);
	});

	const parts = ['noun', 'adjective', 'conjunction', 'preposition', 'adverb'];
	parts.forEach(part => {
		const entries = data.entries.filter(({part: p}) => p && p === part);
		const newData = {entries};
		writeFile(part + '.md', part, newData);
	});
}

run();

