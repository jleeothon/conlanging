import { z } from "zod";

export const rawCategorySchema = z.object({
	name: z.string(),
	subcategories: z.array(z.string()),
});

export const rawCategoriesSchema = z.array(rawCategorySchema);

export type RawCategory = z.infer<typeof rawCategorySchema>;

export type RawCategories = z.infer<typeof rawCategoriesSchema>;
