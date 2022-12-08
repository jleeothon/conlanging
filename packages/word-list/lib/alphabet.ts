import naturalCompare from "string-natural-compare";

export const alphabet =
	"AaÄäBbCcDdEeËëFfGgHhIiÏïJjKkLlMmNnOoÖöŐőPpQqRrSsTtÞþUuÜüŰűVvWwXxYyZz-";

export function compare(a: string, b: string) {
	return naturalCompare(a, b, { alphabet });
}
