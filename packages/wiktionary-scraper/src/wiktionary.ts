// URL: https://en.wiktionary.org/w/api.php?action=query&format=json&cmpageid=4488666&list=categorymembers&cmlimit=10&cmcontinue=...
export const baseUrl = "https://en.wiktionary.org/w/api.php";

export type CategoryMember = { title: string; pageid: number };

export type CategoryMembersQueryResponse = {
	query: {
		categorymembers: CategoryMember[];
	};
	continue?: { cmcontinue: string };
};

export type ParseResponse = {
	parse: {
		title: string;
		wikitext: string;
	};
};
