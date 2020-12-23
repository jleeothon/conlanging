const naturalCompare = require('string-natural-compare');

const alphabet = 'AaÄäBbCcDdEeËëFfGgHhIiÏïJjKkLlMmNnOoÖöPpQqRrSsTtÞþUuÜüVvWwXxYyZz';

function compare(a, b) {
	return naturalCompare(a, b, alphabet);
}

module.exports = {alphabet, compare};
