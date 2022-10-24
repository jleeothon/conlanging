#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

import Ajv from "ajv";
import yaml from "js-yaml";

import projectRoot from "../lib/project-root.js";

const schemaPath = path.join(projectRoot, "word-list-schema.json");

const schema = yaml.load(readFileSync(schemaPath, "utf8"));

const ajv = new Ajv({ allErrors: true, verbose: true });

const input = yaml.load(readFileSync(0, "utf8"));

const validate = ajv.compile(schema);
const valid = validate(input);

if (valid) {
	console.error("✓ Word list OK");
} else {
	for (const error of validate.errors.map(({ instancePath, message }) => ({
		path: instancePath,
		message,
	}))) {
		console.error(error);
	}

	process.exitCode = 1;
}
