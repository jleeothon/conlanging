import { rawCategoriesSchema } from "./validate.js";

export class Category {
	readonly subcategories: Category[];
	readonly parent?: Category;

	private constructor(readonly name: string, parent?: Category) {
		this.name = name;
		this.parent = parent;
		this.subcategories = [];
	}

	static makeRoot(name: string): Category {
		return new Category(name);
	}

	static make(name: string, parent: Category): Category {
		return new Category(name, parent);
	}
}

export function buildCategories(
	input: unknown,
	rootName = "fundamental"
): Map<string, Category> {
	const rawCategories = rawCategoriesSchema.parse(input);
	const fundamental = Category.makeRoot(rootName);
	const categories = new Map<string, Category>([[rootName, fundamental]]);

	for (const { name, subcategories } of rawCategories) {
		const parentCategory = buildOneCategory(categories, name);
		for (const name of subcategories) {
			buildOneCategory(categories, name, parentCategory);
		}
	}

	return categories;
}

function buildOneCategory(
	categories: Map<string, Category>,
	name: string,
	parent?: Category
): Category {
	let category = categories.get(name);
	if (category) {
		return category;
	}

	if (parent) {
		const category = Category.make(name, parent);
		parent.subcategories.push(category);
		return category;
	}

	parent = categories.get("fundamental")!;
	category = Category.make(name, parent);
	parent.subcategories.push(category);
	return category;
}
