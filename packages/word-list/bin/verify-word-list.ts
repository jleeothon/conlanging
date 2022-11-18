import { wordListSchema } from "../lib/schema.js";
import { ZodError } from "zod";
import { readFileSync } from "node:fs";

import { load as yamlLoad } from "js-yaml";

// Future structure
// aigonleik:
//   parts:
//   - pos: Adjective
//     meanings:
//       - something that does something
//   - pos: Adverb
//     meanings:
// 		 - something that does something

const input = yamlLoad(readFileSync(0, "utf8"));

try {
	wordListSchema.parse(input);
	console.log("✓ Word list OK");
} catch (e) {
	if (e instanceof ZodError) {
		console.error(e.toString());
		process.exitCode = 1;
	} else {
		throw e;
	}
}
