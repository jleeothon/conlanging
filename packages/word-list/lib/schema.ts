import { z } from "zod";

export const wordListSchema = z.array(
	z.object({
		pos: z.enum([
			"Adjective",
			"Adverb",
			"Conjunction",
			"Determiner",
			"Noun",
			"Preposition",
			"Verb",
			"Affix",
		]),
		meaning: z.string(),
		tags: z.array(z.string()),
		template: z.enum([
			"strong-1",
			"strong-2",
			"strong-3-i",
			"strong-34-e",
			"strong-5",
			"strong-5-j",
			"strong-6",
			"strong-6-j",
			"strong-7a",
			"strong-7b",
			"strong-7c-i",
			"strong-7c-e",
			"strong-7d",
			"strong-7e",
			"weak-jun",
			"weak-wun",
			"weak-lon",
			"weak-nun",
		]),
		see: z.array(z.string()),
	})
);

export type WordList = z.infer<typeof wordListSchema>;
