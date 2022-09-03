## Derivation rules

Short endings -az, -ą, -uz, -ō, -ǭ, -į̄, -iz disappear. E.g. _\*mikilaz > mikil_ (big).

Before -ô, a heavy stem simply loses the ending. E.g. _\*neurô > neur_ kidney.

Before -ô, a light stem's vowel may be prolonged but often this is blocked by analogy with verbs in a related paradigm. E.g. _\*berô > bér_ (bear), but _drupô > drup_ "drop" (by analogy with _dreupon - draupon - drupon_).

Rhotacism of -z- to -r-. E.g. _\*lēziz > lér_.

Lowering of _ur > or_ and _ul > ol_ but blocked by conjugation paradigms. E.g. _murginaz > morgin_ (morning), _nebul > nebol_.

In the last syllable, -an becomes -on. E.g. _*drinkaną > drinkan > drinkon_.

-ij- causes umlaut.

-j and -j- cause umlaut.

-i- causes umlaut e.g. _*langiþō > langiþ > längiþ_.

-kw, -gw, -hw become -k, -g, and -h. E.g. _*hwehwlą > hwewhl > hwehol_, _*singwaną > singwan > singwon > singon_.

-wj- > -w-. E.g. _*niwjaz > niwj > niw (neu)_ "new".

description: '-wj- > -w-',
		do: lemma => lemma.replace(/wj/, 'w'),
	},
	{
		description: '-kj > -č',
		do: lemma => lemma.replace(/kj$/, 'č'),
	},
	{
		description: '-gj > -ǧ',
		do: lemma => lemma.replace(/gj$/, 'ǧ'),
	},
	{
		description: '-kij > -ci',
		do: lemma => lemma.replace(/kij/, 'ci'),
	},
	{
		description: '-gij > -gi',
		do: lemma => lemma.replace(/gij/, 'gi'),
	},
	{
		description: 'Respell k > c',
		do: lemma => lemma.replace(/c/, 'c'),
	},
	{
		description: 'Rewrite vowels',
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
