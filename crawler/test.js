const a = /^(?<initial>[V])[C][C][V]$/;

const b = new RegExp(a.source.replaceAll('[V]', '(?:au|[auaeiou])').replaceAll('[C]', '[bdgptk]'));

console.log(("abge").match(b));
console.log(("abti").match(b));
console.log(("aubti").match(b));
console.log(("able").match(b));
