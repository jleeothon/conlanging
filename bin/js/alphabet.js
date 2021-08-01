import naturalCompare from 'string-natural-compare';

export const alphabet = '-AaÄäBbCcDdEeËëFfGgHhIiÏïJjKkLlMmNnOoÖöŐőPpQqRrSsTtÞþUuÜüŰűVvWwXxYyZz';

export function compare(a, b) {
	return naturalCompare(a, b, alphabet);
}
