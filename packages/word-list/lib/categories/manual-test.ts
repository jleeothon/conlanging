import type { Category } from "./build.js";
import { fundamental } from "./index.js";

function print(category: Category, tabs = 0): void {
	console.log("\t".repeat(tabs), category.name);
	for (const subcategory of category.subcategories) {
		print(subcategory, tabs + 1);
	}
}

print(fundamental.get("fundamental")!);
