import {readFileSync, writeFileSync} from 'node:fs';

const dataStr = readFileSync('./data/data-1.json', 'utf-8');
const entries = JSON
  .parse(dataStr)
  .filter(({lemma}) => !lemma.startsWith('-'))
  .map(e => ({...e, history: [e.lemma]}));

function apply(entries, transformation) {
	console.log('-'.repeat(80));
	console.log(transformation.description);
	console.log('-'.repeat(80));
	entries.forEach(entry => {
		const lastLemma = entry.history.at(-1);
		const nextLemma = transformation.do(lastLemma);
		if (nextLemma && nextLemma !== lastLemma) {
			console.log(lastLemma, '>', nextLemma);
			entry.history.push(nextLemma);
		}
	});
}

function applyUmlaut(vowel) {
	const umlautMapping = {
		a: 'ä',
		ai: 'äi',
		au: 'äu',
		o: 'ö',
		u: 'ü',
		ū: 'ű',
		ō: 'ő',
	};
	const result = umlautMapping[vowel];
	return result ? result : vowel;
}

function applyLengthening(vowel) {
	const lengtheningMap = {
		a: 'ā',
		e: 'ē',
	i: 'ī',
		o: 'ō',
		u: 'ū',
	};
	const result = lengtheningMap[vowel];
	return result ? result : vowel;
}

function superRe(regexp) {
	return new RegExp(
		regexp.source
			.replaceAll('[V]', '(?:ai|au|eu|iu|[aeiouāēīōūąǭį̄êôűő])')
			.replaceAll('[C]', '[bpdtgkmnfþszhjwlr]'),
		regexp.flags
	);
}

const transformations = [
	{
		description: '-az, -ą, -uz, -ō, -ǭ  > ∅',
		do: (lemma) => lemma.match(/^(.*)(az|ą|uz|ō|ǭ)$/)?.[1],
	},
	{
		description: 'ô > lengthening + ∅',
		do: (lemma) => {
			if (!lemma.endsWith('ô')) {
				return null;
			}
			const re = superRe(/([V]+)([C]+)ô$/);
			return lemma.replace(re, (match, vowel, consonant) => {
				// Only short vowels followed by a single consonant
				const vowelIsShort = ['a', 'e', 'i', 'o', 'u'].includes(vowel);
				const consonantIsSingle = consonant.length === 1;
				if (!(vowelIsShort && consonantIsSingle)) {
					return vowel + consonant;
				}
				return applyLengthening(vowel) + consonant;
			});
		}
	},
	{
		description: '-į̄ > (no umlaut) ∅',
		do: (lemma) => {
			return lemma.match(/^(.*)(į̄)$/)?.[1];
		}
	},
	{
		description: '-iz > (no umlaut) ∅',
		do: (lemma) => {
			return lemma.match(/^(.*)(iz)$/)?.[1];
		}
	},
	{
		description: '-z- > -r-',
		do: (lemma) => lemma.replaceAll(/(.)z(.)/g, '$1r$2'),
	},
	{
		description: 'ur > or',
		do(lemma) {
			return lemma.replaceAll(superRe(/([V])[zr]/g), (match, vowel) => {
				if (vowel === 'u') {
					return 'or'
				}
				return match;
			})
		},
	},
	{
		description: 'ul > ol',
		do: (lemma) => lemma.replaceAll(/ul/g, 'ol'),
	},
	{
		description: '-an > -on',
		do: (lemma) => lemma.replace(/an$/, 'on'),
	},
	{
		description: '-ij causes umlaut',
		do: (lemma) => {
			const re = superRe(/([V])([C]+)ij/g);
			const replaced = lemma.replaceAll(re, (_, vowel, consonants) => {
				return applyUmlaut(vowel) + consonants + 'ij';
			});
			return replaced;
		}
	},
	{
		description: '-j > causes umlaut',
		do: (lemma) => {
			const re = superRe(/([V]+)([C])j/g);
			const result = lemma.replaceAll(re, (_, vowel, consonants) => {
				return applyUmlaut(vowel) + consonants + 'j';
			})
			return result;
		}
	},
	{
		description: '-j- > umlaut + ∅',
		do: (lemma) => {
			const matches = lemma.match(superRe(/(?<vowel>[V]+)(?<consonants>[C]{1,2})j(?<ending>.{1,2})?$/));
			if (matches) {
				const start = lemma.substring(0, matches.index);
				const vowel = applyUmlaut(matches.groups.vowel);
				const ending = matches.groups.consonants + 'j' + (matches.groups.ending || '');
				return start + vowel + ending;
			}
			return null;
		}
	},
	{
		description: '-iþ > umlaut + ∅',
		do: (lemma) => {
			const re = superRe(/(?<vowel>[V])(?<consonants>[C]{1,2})iþ$/);
			const matches = lemma.match(re);
			if (matches) {
				const start = lemma.substring(0, matches.index);
				const vowel = applyUmlaut(matches.groups.vowel);
				const ending = matches.groups.consonants + 'iþ';
				return start + vowel + ending;
			}
			return null;
		}
	},
	{
		description: '-gw- > -g-',
		do: (lemma) => {
			if (!lemma.match(/.+gw..?$/)) {
				return null;
			}
			const matches = lemma.match(/^(.+)gw(.{1,3})$/);
			if (matches && matches[1] && matches[2]) {
				const start = matches[1];
				const coda = matches[2];
				return start + 'g' + coda;
			}
			return null;
		}
	},
	{
		description: '-wj- > -w-',
		do: (lemma) => lemma.replace(/wj/, 'w'),
	},
	{
		description: '-kj > -č',
		do: (lemma) => lemma.replace(/kj$/, 'č'),
	},
	{
		description: '-gj > -ǧ',
		do: (lemma) => lemma.replace(/gj$/, 'ǧ'),
	},
	{
		description: '-kij > -ci',
		do: (lemma) => lemma.replace(/kij/, 'ci'),
	},
	{
		description: '-gij > -gi',
		do: (lemma) => lemma.replace(/gij/, 'gi'),
	},
	{
		description: 'Respell k > c',
		do: (lemma) => lemma.replace(/c/, 'c'),
	},
	{
		description: 'Rewrite vowels',
		do: (lemma) => {
			const replacements = {
				iu: 'eu',
				ā: 'aa',
				ē: 'ee',
				ī: 'ei',
				ō: 'oo',
				ū: 'uu',
				ő: 'öö',
				ű: 'üü',
			};
			return [...Object.entries(replacements)].reduce(
				(accum, [key, val]) => accum.replaceAll(key, val),
				lemma
			);
		}
	},
];

function run() {
	let finalEntries = entries;
	transformations.forEach(transformation => {
		apply(finalEntries, transformation);
	});
	writeFileSync('./transform.json', JSON.stringify(finalEntries, null, 2));
}

run();
