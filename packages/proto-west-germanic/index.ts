import query from "@jleeothon/wiktionary-scraper";

try {
	await query("Category:Proto-West_Germanic_lemmas", {
		filterPrefix: "Reconstruction:Proto-West Germanic/",
	});
	console.log("Done");
} catch (error) {
	console.error(error);
}
