import { WiktionaryScraper } from "@jleeothon/wiktionary-scraper";
import path from "node:path";
import { packageDirectorySync } from "pkg-dir";

const cachePath = path.join(packageDirectorySync()!, "cache");

const scraper = new WiktionaryScraper(cachePath, {
	secondsCache: 60 * 60 * 24,
});

try {
	await scraper.query("Category:Latin_lemmas");
} catch (e) {
	console.error(e);
	process.exitCode = 1;
}
