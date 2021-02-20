const naturalCompare = require('string-natural-compare');

const alphabet = 'AaÄäBbCcDdEeËëFfGgHhIiÏïJjKkLlMmNnOoÖöŐőPpQqRrSsTtÞþUuÜüŰűVvWwXxYyZz';

function compare(a, b) {
	return naturalCompare(a, b, alphabet);
}

module.exports = {alphabet, compare};
