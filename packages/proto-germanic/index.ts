import query from '@jleeothon/wiktionary-scraper';

await query('Category:Proto-Germanic_lemmas', {
	filterPrefix: 'Reconstruction:Proto-Germanic/',
});
