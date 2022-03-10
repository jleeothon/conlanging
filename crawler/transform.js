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
		o: 'ö',
		u: 'ü',
		ū: 'üü',
		ō: 'öö',
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
			.replaceAll('[V]', '(?:ai|au|eu|iu|[aeiouāēīōūąǭį̄êô])')
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
			const matches = lemma.match(superRe(/(?<vowel>[V]+)(?<consonants>[C]{1,2})ô$/));
			if (matches) {
				const prefix = lemma.substring(0, matches.index);
				const coda = matches.groups.consonants;
				const originalVowel = matches.groups.vowel;
				const vowel = coda.length === 1 ? applyLengthening(originalVowel) : originalVowel;
				return prefix + vowel + coda;
			}
			return null;
		}
	},
	{
		description: '-į̄ > (no umlaut) ∅',
		do: (lemma) => {
			return lemma.match(/^(.*)(į̄)$/)?.[1];
			if (!lemma.endsWith('į̄')) {
				return null;
			}
			const matches = lemma.match(/([aeiouāēīōūǭį̄êô]+)(.{1,2})į̄$/);
			if (matches && matches[1] && matches[2]) {
				const prefix = lemma.substring(0, matches.index);
				const vowel = applyUmlaut(matches[1]);
				const coda = matches[2];
				return prefix + vowel + coda;
			}
			return null;
		}
	},
	{
		description: '-iz > (no umlaut) ∅',
		do: (lemma) => {
			return lemma.match(/^(.*)(iz)$/)?.[1];
			if (!lemma.endsWith('iz')) {
				return null;
			}
			const matches = lemma.match(/([aeiouāēīōūǭį̄êô]+)(.{1,2})iz$/);
			if (matches) {
				const prefix = lemma.substring(0, matches.index);
				const vowel = applyUmlaut(matches[1]);
				const coda = matches[2];
				return prefix + vowel + coda;
			}
			return null;
		}
	},
	{
		description: '-z- > -r-',
		do: (lemma) => lemma.replaceAll(/(.)z(.)/g, '$1r$2'),
	},
	{
		description: 'ur > or',
		do(lemma) {
			return lemma.replaceAll(superRe(/([V])[zr]/g), (match, vowel, ...args) => {
				if (vowel === 'u') {
					return 'or'
				}
				return match;
			})
		},
	},
	{
		description: 'ul > ol',
		do: (lemma) => lemma.replace(/ul/, 'ol'),
	},
	{
		description: '-j > umlaut + ∅',
		do: (lemma) => {
			const matches = lemma.match(superRe(/(?<vowel>[V]+)(?<consonants>[C]{1,2})j$/));
			if (matches) {
				const start = lemma.substring(0, matches.index);
				const vowel = applyUmlaut(matches.groups.vowel);
				const ending = matches.groups.consonants + 'j';
				return start + vowel + ending;
			}
			return null;
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
				console.log(matches);
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
		description: '-kj > -ḱ',
		do: (lemma) => lemma.replace(/kj$/, 'ḱ'),
	},
	{
		description: '-gj > -ǵ',
		do: (lemma) => lemma.replace(/gj$/, 'ǵ'),
	},
	{
		description: '-kij > -ḱi',
		do: (lemma) => lemma.replace(/kij$/, 'ḱi'),
	},
	{
		description: '-gij > -ǵi',
		do: (lemma) => lemma.replace(/gij$/, 'ǵi'),
	},
	{
		description: '-an > -on',
		do: (lemma) => lemma.replace(/an$/, 'on'),
	},
	{
		description: 'Rewrite orthography',
		do: (lemma) => {
			const replacements = {
				ī: 'ei',
				iu: 'eu',
				ā: 'æ',
				ō: 'oo',
				ū: 'uu',
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
