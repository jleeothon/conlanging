import { z } from "zod";
import { compare } from "./alphabet.js";

const partsOfSpeech = [
	"Adjective",
	"Adverb",
	"Conjunction",
	"Determiner",
	"Noun",
	"Preposition",
	"Verb",
	"Affix",
] as const;

const sortedStringArraySchema = z
	.array(z.string())
	.transform((values) => values.sort((a, b) => a.localeCompare(b)));

const extDefinitionSchema = z.object({
	def: z.string(),
	tags: sortedStringArraySchema.optional(),
	see: sortedStringArraySchema.optional(),
	synonyms: sortedStringArraySchema.optional(),
});

export type ExtDefinition = z.infer<typeof extDefinitionSchema>;

const roleSchema = z.object({
	pos: z.enum(partsOfSpeech),
	xdefs: z.array(extDefinitionSchema),
});

export type Role = z.infer<typeof roleSchema>;

export const wordListSchema = z
	.record(
		z.object({
			roles: z
				.array(roleSchema)
				.transform((roles) =>
					roles.sort(({ pos: a }, { pos: b }) => a.localeCompare(b))
				),
			tags: sortedStringArraySchema.optional(),
			see: sortedStringArraySchema.optional(),
			synonyms: sortedStringArraySchema.optional(),
		})
	)
	.transform((val) =>
		Object.fromEntries(
			Object.entries(val).sort(([key1], [key2]) => compare(key1, key2))
		)
	);

export type WordList = z.infer<typeof wordListSchema>;

export type Entry = WordList & {
	lemma: string;
};
