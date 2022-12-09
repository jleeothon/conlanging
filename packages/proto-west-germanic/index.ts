import query from '@jleeothon/wiktionary-scraper';

await query('Category:Proto-West_Germanic_lemmas', {
	filterPrefix: 'Reconstruction:Proto-West Germanic/',
}).catch((error: Error) => {
	console.error(error);
});
