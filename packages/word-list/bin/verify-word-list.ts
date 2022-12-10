import { readFileSync } from "node:fs";
import { ZodError } from "zod";

import { load as yamlLoad } from "js-yaml";
import { wordListSchema } from "../lib/schema.js";
// Console.error(asTable.default);
// Future structure
// aigonleik:
//   parts:
//   - pos: Adjective
//     meanings:
//       - something that does something
//   - : Adverb
//     meanings:
// 		 - something that does something

const input = yamlLoad(readFileSync(0, "utf8"));

try {
	wordListSchema.parse(input);
	console.log("✓ Word list OK");
} catch (error) {
	if (error instanceof ZodError) {
		const table = error.errors.map((e) => ({
			path: e.path.join("/"),
			message: e.message,
		}));
		for (const { path, message } of table) {
			console.log(path, "-", message);
		}
		// Console.error(asTable(table));
		// for (const issue of error.errors) {
		// 	// error.errors.map((e) => ({path: e.path, message: e.message}));
		// 	const path = issue.path.join('/');

		// 	console.error(issue);
		// 	// console.error(e.toString(), {message: e.message, path: e.});
		// }
		console.error();
		process.exitCode = 1;
	} else {
		throw error;
	}
}
