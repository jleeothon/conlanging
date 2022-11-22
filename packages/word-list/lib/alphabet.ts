// import * as naturalCompare from "string-natural-compare";

export const alphabet =
	"-AaÄäBbCcDdEeËëFfGgHhIiÏïJjKkLlMmNnOoÖöŐőPpQqRrSsTtÞþUuÜüŰűVvWwXxYyZz";

export function compare(a: string, b: string) {
	// return naturalCompare(a, b, { alphabet });
	return a.localeCompare(b);
}
