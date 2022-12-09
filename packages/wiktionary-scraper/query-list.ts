import path from "node:path";
import got from "got";
import { packageDirectorySync } from "pkg-dir";
import { writeJsonFileSync } from "write-json-file";
import rx, { firstValueFrom } from "rxjs";

// URL: https://en.wiktionary.org/w/api.php?action=query&format=json&cmpageid=4488666&list=categorymembers&cmlimit=10&cmcontinue=...

const baseUrl = "https://en.wiktionary.org/w/api.php";

type CategoryMember = { title: string; pageid: number };

type CategoryMembersQueryResponse = {
	query: {
		categorymembers: CategoryMember[];
	};
	continue?: { cmcontinue: string };
};

async function* fetchCategoryMembers(): AsyncIterable<CategoryMember> {
	const defaultSearchParams = {
		action: "query",
		format: "json",
		cmpageid: "4488666",
		list: "categorymembers",
		cmlimit: "500",
	};

	let cmcontinue: string | undefined;
	do {
		// eslint-disable-next-line no-await-in-loop
		const data: CategoryMembersQueryResponse = await got(baseUrl, {
			searchParams: { ...defaultSearchParams, cmcontinue },
		}).json();
		const { categorymembers } = data.query;
		const reconstructions = categorymembers.filter(({ title }) =>
			title.startsWith("Reconstruction:Proto-Germanic")
		);
		yield* reconstructions;
		cmcontinue = data.continue?.cmcontinue;
	} while (cmcontinue);
}

async function run() {
	const observableMembers = rx.from(fetchCategoryMembers());
	const results = await firstValueFrom(observableMembers.pipe(rx.toArray()));
	const fileName = path.join(packageDirectorySync()!, "data", "data-0.json");
	writeJsonFileSync(fileName, results, { indent: "\t" });
}

run();
