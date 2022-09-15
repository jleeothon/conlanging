import {writeFileSync} from 'node:fs';

import inputData from 'crawler';

const entries = inputData
	.filter(({lemma}) => !lemma.startsWith('-'))
	.map(entry => ({...entry, history: [entry.lemma]}));

function apply(entries, transformation) {
	console.log('-'.repeat(80));
	console.log(transformation.id, '---', transformation.description);
	console.log('-'.repeat(80));
	for (const entry of entries) {
		const lastLemma = entry.history.at(-1);
		const nextLemma = transformation.do(lastLemma);
		if (nextLemma && nextLemma !== lastLemma) {
			console.log(lastLemma, '>', nextLemma);
			entry.history.push(nextLemma);
		}
	}
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
		regexp.flags,
	);
}

const transformations = [
	{
		description: '-az, -ą, -uz, -ō, -ǭ  > ∅',
		id: 'tr-drop-suffix',
		do: lemma => lemma.match(/^(.*)(az|ą|uz|ō|ǭ)$/)?.[1],
	},
	{
		description: 'ô > lengthening + ∅',
		id: 'tr-drop-overlong-o',
		do(lemma) {
			if (!lemma.endsWith('ô')) {
				return null;
			}

			const re = superRe(/(V+)(C+)ô$/);
			return lemma.replace(re, (match, vowel, consonant) => {
				// Only short vowels followed by a single consonant
				const vowelIsShort = ['a', 'e', 'i', 'o', 'u'].includes(vowel);
				const consonantIsSingle = consonant.length === 1;
				if (!(vowelIsShort && consonantIsSingle)) {
					return vowel + consonant;
				}

				return applyLengthening(vowel) + consonant;
			});
		},
	},
	{
		description: '-į̄ > (no umlaut) ∅',
		id: 'tr-drop-nasal-iin',
		do(lemma) {
			return lemma.match(/^(.*)(į̄)$/)?.[1];
		},
	},
	{
		description: '-iz > (no umlaut) ∅',
		id: 'tr-drop-iz',
		do(lemma) {
			return lemma.match(/^(.*)(iz)$/)?.[1];
		},
	},
	{
		description: '-z- > -r-',
		id: 'tr-z-r',
		do: lemma => lemma.replaceAll(/(.)z(.)/g, '$1r$2'),
	},
	{
		description: 'ur > or',
		id: 'tr-ur',
		do(lemma) {
			return lemma.replaceAll(superRe(/(V)[zr]/g), (match, vowel) => {
				if (vowel === 'u') {
					return 'or';
				}

				return match;
			});
		},
	},
	{
		description: 'ul > ol',
		id: 'tr-ul',
		do: lemma => lemma.replaceAll(/ul/g, 'ol'),
	},
	{
		description: '-an > -on',
		id: 'tr-an-on',
		do: lemma => lemma.replace(/an$/, 'on'),
	},
	{
		description: '-ij causes umlaut',
		id: 'tr-umlaut-ij',
		do(lemma) {
			const re = superRe(/(V)(C+)ij/g);
			const replaced = lemma.replaceAll(
				re,
				(_, vowel, consonants) => applyUmlaut(vowel) + consonants + 'ij',
			);
			return replaced;
		},
	},
	{
		description: '-j > causes umlaut',
		id: 'tr-umlaut-j1',
		do(lemma) {
			const re = superRe(/(V+)(C)j/g);
			const result = lemma.replaceAll(
				re,
				(_, vowel, consonants) => applyUmlaut(vowel) + consonants + 'j',
			);
			return result;
		},
	},
	{
		description: '-j- > umlaut + ∅',
		id: 'tr-umlaut-j2',
		do(lemma) {
			const matches = lemma.match(
				superRe(/(?<vowel>V+)(?<consonants>C{1,2})j(?<ending>.{1,2})?$/),
			);
			if (matches) {
				const start = lemma.slice(0, Math.max(0, matches.index));
				const vowel = applyUmlaut(matches.groups.vowel);
				const ending
					= matches.groups.consonants + 'j' + (matches.groups.ending || '');
				return start + vowel + ending;
			}

			return null;
		},
	},
	{
		description: '-iþ > umlaut + ∅',
		id: 'tr-ith',
		do(lemma) {
			const re = superRe(/(?<vowel>V)(?<consonants>C{1,2})iþ$/);
			const matches = lemma.match(re);
			if (matches) {
				const start = lemma.slice(0, Math.max(0, matches.index));
				const vowel = applyUmlaut(matches.groups.vowel);
				const ending = matches.groups.consonants + 'iþ';
				return start + vowel + ending;
			}

			return null;
		},
	},
	{
		description: '-gw- > -g-',
		id: 'tr-gw-g',
		do(lemma) {
			if (!/.+gw..?$/.test(lemma)) {
				return null;
			}

			const matches = lemma.match(/^(.+)gw(.{1,3})$/);
			if (matches && matches[1] && matches[2]) {
				const start = matches[1];
				const coda = matches[2];
				return start + 'g' + coda;
			}

			return null;
		},
	},
	{
		description: '-kw- > -g-',
		id: 'tr-kw-g',
		do(lemma) {
			if (!/.+kw..?$/.test(lemma)) {
				return null;
			}

			const matches = lemma.match(/^(.+)kw(.{1,3})$/);
			if (matches && matches[1] && matches[2]) {
				const start = matches[1];
				const coda = matches[2];
				return start + 'k' + coda;
			}

			return null;
		},
	},
	{
		description: '-hw- > -g-',
		id: 'tr-hw-g',
		do(lemma) {
			if (!/.+hw..?$/.test(lemma)) {
				return null;
			}

			const matches = lemma.match(/^(.+)hw(.{1,3})$/);
			if (matches && matches[1] && matches[2]) {
				const start = matches[1];
				const coda = matches[2];
				return start + 'h' + coda;
			}

			return null;
		},
	},
	{
		description: '-wij- > -wi-',
		id: 'tr-wij',
		do: lemma => lemma.replace(/wij/, 'wi'),
	},
	{
		description: '-wj- > -w-',
		id: 'tr-wj',
		do: lemma => lemma.replace(/wj/, 'w'),
	},
	{
		description: '-kj > -č',
		id: 'tr-kj',
		do: lemma => lemma.replace(/kj$/, 'č'),
	},
	{
		description: '-gj > -ǧ',
		id: 'tr-gj',
		do: lemma => lemma.replace(/gj$/, 'ǧ'),
	},
	{
		description: '-kij > -ci',
		id: 'tr-kij',
		do: lemma => lemma.replace(/kij/, 'ci'),
	},
	{
		description: '-gij > -gi',
		id: 'tr-gij',
		do: lemma => lemma.replace(/gij/, 'gi'),
	},
	{
		description: 'Respell k > c',
		id: 'tr-kc',
		do: lemma => lemma.replace(/c/, 'c'),
	},
	{
		description: 'Rewrite vowels',
		id: 'rewrite-vowels',
		do(lemma) {
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
			let result = lemma;
			for (const [orig, replacement] of Object.entries(replacements)) {
				result = result.replaceAll(orig, replacement);
			}

			return result;
		},
	},
];

function run() {
	const finalEntries = entries;
	for (const transformation of transformations) {
		apply(finalEntries, transformation);
	}

	writeFileSync('./data/transform.json', JSON.stringify(finalEntries, null, 2));
}

run();
