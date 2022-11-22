import sortKeys from "sort-keys";

let a = sortKeys({x: 3, a: 999, '-bar': "hey"});

console.log(a);
