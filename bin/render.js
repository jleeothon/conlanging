#!/usr/bin/env node

const handlebars = require('handlebars');
const {readFileSync} = require('fs');
const yaml = require('js-yaml');

const templateSource = `# Theudisk

## {{title}}

{{#each entries}}
### {{word}}
{{#if part}}

({{part}})

{{/if}}
{{#each inflections}}
- _{{@key}}:_ **{{this}}**
{{/each}}

{{meaning}}

{{#if see}}

See:

{{#each see}}
- {{this}}
{{/each}}
{{/if}}

{{/each}}
`;

const data = yaml.safeLoad(readFileSync(0, 'utf-8'));

const template = handlebars.compile(templateSource);

console.log(template(data));
