import path from "node:path";
import fs from "node:fs";
import got from "got";
import { packageDirectorySync } from "pkg-dir";
import rx from "rxjs";
import pThrottle from "p-throttle";
import { dump as yamlDump } from "js-yaml";
import categorymembers from "./data/data-0.json" assert { type: "json" };

// URL: https://en.wiktionary.org/w/api.php?action=query&format=json&cmpageid=4488666&list=categorymembers&cmlimit=10&cmcontinue=...

const baseUrl = "https://en.wiktionary.org/w/api.php";

run().catch((e) => {
	console.error(e);
});

async function run() {
	const throttle = pThrottle({
		limit: 2,
		interval: 1000,
	});
	const throttleParsePage = throttle(parsePage);

	const observableMembers = rx.from(
		categorymembers.sort(() => Math.random() - 0.5)
	);
	observableMembers
		.pipe(
			rx.mergeMap(async (categoryMember) => {
				const wikitext = await throttleParsePage(categoryMember.pageid);
				writeFile(categoryMember, wikitext);
				return categoryMember;
			})
		)
		.subscribe((a) => {
			console.log("Done", a.title);
		});
}

interface CategoryMember {
	title: string;
	pageid: number;
}

interface ParseResponse {
	parse: {
		title: string;
		wikitext: string;
	};
}

async function parsePage(pageid: number): Promise<string> {
	// https://www.mediawiki.org/wiki/API:Parsing_wikitext
	const response: ParseResponse = await got(baseUrl, {
		searchParams: {
			action: "parse",
			format: "json",
			pageid,
			prop: "wikitext",
			formatversion: 2,
		},
	}).json();

	return response.parse.wikitext;
}

function writeFile(categorymember: CategoryMember, wikitext: string): void {
	const directory = path.join(packageDirectorySync()!, "data", "pages");
	fs.mkdirSync(directory, { recursive: true });

	const fileName =
		categorymember.title.replace(/^Reconstruction.Proto-Germanic./, "") +
		".yaml";
	const filePath = path.join(directory, fileName);

	const content = { ...categorymember, wikitext };
	fs.writeFileSync(filePath, yamlDump(content));
}

// for getting contents of a page
// action=query & prop=revisions & titles=Pet_door & rvslots=* & rvprop=content & formatversion=2
// or better
// https://en.wiktionary.org/w/api.php?action=query&prop=extracts&titles=Reconstruction:Proto-West_Germanic/makōn&explaintext=1&formatversion=2&format=json
