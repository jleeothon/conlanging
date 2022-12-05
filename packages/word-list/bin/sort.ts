#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { load as yamlLoad, dump as yamlDump } from "js-yaml";

import { wordListSchema } from "../lib/schema.js";

(async () => {
	const rawData = yamlLoad(await readFileSync(0, "utf8"));
	const parsedData = wordListSchema.parse(rawData);
	console.log(yamlDump(parsedData));
})();
