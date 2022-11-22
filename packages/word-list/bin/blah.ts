import { readFileSync } from "node:fs";

import { load as yamlLoad, dump as yamlDump } from "js-yaml";

// Future structure
// aigonleik:
//   parts:
//   - pos: Adjective
//     meanings:
//       - something that does something
//   - pos: Adverb
//     defs:
// 		 - def: something that does something
//		   synonyms: bla
//         see: a, b, c
//         tags: x, y, z

const input = yamlLoad(readFileSync(0, "utf8")) as Record<string, any>;

const entries = Object.entries(input).map(
	([
		lemma,
		{
			roles: [{ xdefs, ...other }],
		},
	]) => {
		return [lemma, { roles: [{ ...other, xdefs: [xdefs] }] }];
	}
);

console.log(yamlDump(Object.fromEntries(entries)));
