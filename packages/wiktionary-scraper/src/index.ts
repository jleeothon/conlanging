import path from "node:path";
import fs from "node:fs";
import got from "got";
import { packageDirectorySync } from "pkg-dir";
import rx, { firstValueFrom } from "rxjs";
import { dump as yamlDump } from "js-yaml";
import pThrottle from "p-throttle";
import logEmitter from "./log-emitter";

// URL: https://en.wiktionary.org/w/api.php?action=query&format=json&cmpageid=4488666&list=categorymembers&cmlimit=10&cmcontinue=...

const baseUrl = "https://en.wiktionary.org/w/api.php";

export default async function query(
	cmtitle: string,
	{
		limit,
		filterPrefix,
	}: {
		limit?: number;
		filterPrefix?: string;
	} = {}
) {
	const throttle = pThrottle({
		limit: 3,
		interval: 1_000,
	});
	const throttleParsePage = throttle(parseWikitext);

	const observableMembers = rx
		.from(fetchCategoryMembers(cmtitle))
		.pipe(rx.tap((member) => logEmitter.emit("category-member", member)));

	const limitedMembers = limit
		? observableMembers.pipe(rx.take(limit))
		: observableMembers;

	const filteredMembers = filterPrefix
		? limitedMembers.pipe(
				rx.filter(({ title }) => title.startsWith(filterPrefix))
		  )
		: limitedMembers;

	const enrichedMembers = filteredMembers.pipe(
		rx.mergeMap(async (member) => {
			const wikitext = await throttleParsePage(member.pageid);
			return { ...member, wikitext };
		}),
		rx.tap((member) => {
			logEmitter.emit("parse-category-member", member);
		})
	);
	const results = await firstValueFrom(enrichedMembers.pipe(rx.toArray()));
	const fileName = path.join(packageDirectorySync()!, "data", "data-0.yaml");
	const content = results.map((result) => yamlDump(result)).join("\n---\n");
	fs.writeFileSync(fileName, content);
	logEmitter.emit("done");
}

type CategoryMember = { title: string; pageid: number };

type CategoryMembersQueryResponse = {
	query: {
		categorymembers: CategoryMember[];
	};
	continue?: { cmcontinue: string };
};

type ParseResponse = {
	parse: {
		title: string;
		wikitext: string;
	};
};

async function* fetchCategoryMembers(
	cmtitle: string
): AsyncIterable<CategoryMember> {
	let cmcontinue: string | undefined;
	const defaultSearchParameters = {
		action: "query",
		format: "json",
		cmtitle: cmtitle.toString(),
		list: "categorymembers",
		cmlimit: "500",
	};
	do {
		// eslint-disable-next-line no-await-in-loop
		const data: CategoryMembersQueryResponse = await got(baseUrl, {
			searchParams: { ...defaultSearchParameters, cmcontinue },
		}).json();

		const { categorymembers } = data.query;
		logEmitter.emit("list-category-members", categorymembers);
		yield* categorymembers;

		cmcontinue = data.continue?.cmcontinue;
	} while (cmcontinue);
}

async function parseWikitext(pageid: number): Promise<string> {
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
