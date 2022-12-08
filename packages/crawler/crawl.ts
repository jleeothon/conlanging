import path from "node:path";
import got, { OptionsOfTextResponseBody } from "got";
import { packageDirectorySync } from "pkg-dir";
import { writeJsonFileSync } from "write-json-file";
import rx, { firstValueFrom } from "rxjs";

// URL: https://en.wiktionary.org/w/api.php?action=query&format=json&cmpageid=4488666&list=categorymembers&cmlimit=10&cmcontinue=...

const baseUrl = "https://en.wiktionary.org/w/api.php";

type CategoryMembersQueryResponse = {
	query: {
		categorymembers: Array<{ title: string; pageid: number }>;
	};
	continue?: { cmcontinue: string };
};

async function* fetchCategoryMembers() {
	const defaultSearchParams = {
		action: "query",
		format: "json",
		cmpageid: "4488666",
		list: "categorymembers",
		cmlimit: "500",
	};

	let options: OptionsOfTextResponseBody = {
		searchParams: defaultSearchParams,
	};
	let cmcontinue: string | undefined = undefined;

	do {
		// eslint-disable-next-line no-await-in-loop
		const data: CategoryMembersQueryResponse = await got(
			baseUrl,
			options
		).json();
		yield* data.query.categorymembers;

		cmcontinue = data?.continue?.cmcontinue;
		options = { searchParams: { ...defaultSearchParams, cmcontinue } };
	} while (cmcontinue);
}

async function run() {
	const observableMembers = rx.from(fetchCategoryMembers());
	const results = await firstValueFrom(observableMembers.pipe(rx.toArray()));
	const fileName = path.join(packageDirectorySync()!, "data", "data-0.json");
	writeJsonFileSync(fileName, results, { indent: "\t" });
}

run();
// for getting contents of a page
// action=query & prop=revisions & titles=Pet_door & rvslots=* & rvprop=content & formatversion=2
// or better
// https://en.wiktionary.org/w/api.php?action=query&prop=extracts&titles=Reconstruction:Proto-West_Germanic/makōn&explaintext=1&formatversion=2&format=json
