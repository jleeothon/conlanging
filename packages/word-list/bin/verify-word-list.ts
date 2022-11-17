#!/usr/bin/env node

import { readFileSync } from "node:fs";
// import path from "node:path";
// import process from "node:process";

// import Ajv from "ajv";
import yaml from "js-yaml";

import { packageDirectorySync } from "pkg-dir";

import { wordListSchema } from "../lib/schema.js";
import { ZodError } from "zod";

const projectRoot = packageDirectorySync();

// const schemaPath = path.join(projectRoot, "word-list-schema.json");

// const schema = yaml.load(readFileSync(schemaPath, "utf8"));

// const ajv = new Ajv({ allErrors: true, verbose: true });

const input = yaml.load(readFileSync(0, "utf8"));

// const validate = ajv.compile(schema);
// const valid = validate(input);

try {
	wordListSchema.parse(input);
	console.log("✓ Word list OK");
} catch (e) {
	if (e instanceof ZodError) {
		console.error(e.toString());
	}
	throw e;
}

// if (valid) {
// 	console.error("✓ Word list OK");
// } else {
// 	for (const error of validate.errors.map(({ instancePath, message }) => ({
// 		path: instancePath,
// 		message,
// 	}))) {
// 		console.error(error);
// 	}

// 	process.exitCode = 1;
// }
