import { query } from "./query-list.js";

await query("Category:Proto-Germanic_lemmas", {
	limit: 10,
	filterPrefix: "Reconstruction:Proto-Germanic",
});
