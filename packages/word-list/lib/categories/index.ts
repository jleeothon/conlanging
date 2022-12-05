import { packageDirectorySync } from "pkg-dir";
import * as path from "node:path";
import { readFileSync } from "node:fs";
import { buildCategories } from "./build.js";
import { load as yamlLoad } from "js-yaml";

const packageDirectory = packageDirectorySync()!;
const categoriesPath = path.join(packageDirectory, "data", "topics.yaml");

export const fundamental = buildCategories(
	yamlLoad(readFileSync(categoriesPath, "utf-8"))
);
