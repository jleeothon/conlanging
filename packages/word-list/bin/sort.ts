#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { load as yamlLoad, dump as yamlDump } from "js-yaml";

import { compare } from "../lib/alphabet";
import { wordListSchema } from "../lib/schema.js";
import type { WordList } from "../lib/schema.js";

(async () => {
	const rawData = yamlLoad(await readFileSync(0, "utf8"));
	const parsedData = wordListSchema.parse(rawData);

	const entries = Object.entries(parsedData);

	for (const [lemma, entry] of Object.values(entries)) {
		if (typeof entry === "string") {
			throw new Error("this shouldnt happen");
		}
	}

	console.log(yamlDump(data));
})();
