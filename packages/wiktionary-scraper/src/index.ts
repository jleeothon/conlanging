import path from "node:path";
import fs from "node:fs";
import got from "got";
import { packageDirectorySync } from "pkg-dir";
import rx, { firstValueFrom } from "rxjs";
import { dump as yamlDump } from "js-yaml";
import pThrottle from "p-throttle";
import logEmitter from "./log-emitter.js";
import pRetry from "p-retry";
import { Temporal } from "@js-temporal/polyfill";

import { baseUrl } from "./wiktionary.js";

import type {
	CategoryMember,
	CategoryMembersQueryResponse,
	ParseResponse,
} from "./wiktionary";

import { createHash } from "node:crypto";

const { Duration, Now, Instant } = Temporal;

type Duration = Temporal.Duration;

export class WiktionaryScraper {
	readonly #threshold: Duration;
	readonly #parseWithThrottling: (pageid: number) => Promise<ParseResponse>;

	constructor(
		private readonly cacheFolderPath: string,
		{ secondsCache }: { secondsCache: number }
	) {
		this.#threshold = Duration.from({ seconds: secondsCache });
		const throttle = pThrottle({
			limit: 3,
			interval: 1500,
		});

		this.#parseWithThrottling = throttle((pageid) =>
			this.parseWikitextByPageId(pageid)
		);
	}

	async query(
		cmtitle: string,
		{
			limit,
			filterPrefix,
		}: {
			limit?: number;
			filterPrefix?: string;
		} = {}
	) {
		const observableMembers = rx.from(this.#fetchCategoryMembers(cmtitle)).pipe(
			rx.tap((member) => {
				logEmitter.emit("category-member", member);
			})
		);

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
				const wikitext = await this.#parseWikitextWithCache(member.pageid);
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

	async *#fetchCategoryMembers(cmtitle: string): AsyncIterable<CategoryMember> {
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

	/**
	 * Checks if there is a cache for this page. And if not, requests the parsed wikitext and caches it.
	 *
	 * @param pageid
	 * @returns
	 */
	async #parseWikitextWithCache(pageid: number): Promise<string> {
		const filePath = this.#getFilePathForPageid(pageid);
		const isCacheValid = this.#isCacheValid(filePath);
		if (!isCacheValid) {
			const response = await this.#parseWikitextWithThrottlingAndRetries(
				pageid
			);
			fs.writeFileSync(filePath, response.parse.wikitext, "utf-8");
		}

		return fs.readFileSync(filePath, "utf8");
	}

	async #parseWikitextWithThrottlingAndRetries(
		pageid: number
	): Promise<ParseResponse> {
		return pRetry(() => this.#parseWithThrottling(pageid), {
			retries: 3,
			onFailedAttempt: (error) => {
				logEmitter.emit("error", error);
			},
		});
	}

	async parseWikitextByPageId(pageid: number): Promise<ParseResponse> {
		// https://www.mediawiki.org/wiki/API:Parsing_wikitext
		return got(baseUrl, {
			searchParams: {
				action: "parse",
				format: "json",
				pageid,
				prop: "wikitext",
				formatversion: 2,
			},
		}).json();
	}

	#getFilePathForPageid(pageid: number): string {
		const hash = createHash("sha1").update(pageid.toString()).digest("hex");
		const filePath = path.join(this.cacheFolderPath, hash);
		return filePath;
	}

	#isCacheValid(filePath: string): boolean {
		if (!fs.existsSync(filePath)) {
			return false;
		}

		const timestamp = Math.floor(fs.statSync(filePath).mtimeMs);
		const modificationInstant = Instant.fromEpochMilliseconds(timestamp);
		const now = Now.instant();
		const durationSinceModification = now.since(modificationInstant);
		return Duration.compare(durationSinceModification, this.#threshold) < 0;
	}
}
