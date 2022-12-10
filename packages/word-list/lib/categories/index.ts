import * as path from "node:path";
import { readFileSync } from "node:fs";
import { packageDirectorySync } from "pkg-dir";
import { load as yamlLoad } from "js-yaml";
import { buildCategories } from "./build.js";

const packageDirectory = packageDirectorySync()!;
const categoriesPath = path.join(packageDirectory, "data", "topics.yaml");

export const fundamental = buildCategories(
	yamlLoad(readFileSync(categoriesPath, "utf-8"))
);
