import { z } from "zod";
import sortKeys from "sort-keys";

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

const templates = [
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
] as const;

const sortedStringArraySchema = z
	.array(z.string())
	.transform((values) => values.sort((a, b) => a.localeCompare(b)));

const extDefinitionSchema = z.object({
	def: z.string(),
	tags: sortedStringArraySchema.optional(),
	see: sortedStringArraySchema.optional(),
	synonyms: sortedStringArraySchema.optional(),
	template: z.enum(templates).optional(),
});

export type ExtDefinition = z.infer<typeof extDefinitionSchema>;

const roleSchema = z.object({
	pos: z.enum(partsOfSpeech),
	xdefs: z.array(extDefinitionSchema),
	template: z.enum(templates).optional(),
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
			template: z.enum(templates).optional(),
		})
	)
	.transform((val) => sortKeys(val));

export type WordList = z.infer<typeof wordListSchema>;

export type Entry = WordList & {
	lemma: string;
};
