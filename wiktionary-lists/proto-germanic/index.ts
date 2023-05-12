import { WiktionaryScraper } from "@jleeothon/wiktionary-scraper";

import { packageDirectorySync } from "pkg-dir";
import path from "node:path";

const cacheDir = path.join(packageDirectorySync()!, "cache");

const scraper = new WiktionaryScraper(cacheDir, { secondsCache: 60 * 60 * 24 });

await scraper.query("Category:Proto-Germanic_lemmas", {
	filterPrefix: "Reconstruction:Proto-Germanic/",
});
