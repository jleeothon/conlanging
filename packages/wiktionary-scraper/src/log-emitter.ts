import { EventEmitter } from "node:events";

/**
 * An emitter with events "list-category-members"
 */
const logEmitter = new EventEmitter();

logEmitter.on("list-category-members", (results: unknown[]) => {
	console.log("List category members; count:", results.length);
});

// logEmitter.on("category-member", () => {});

logEmitter.on("parse-category-member", (member: { title: string }) => {
	console.log("✔️", member.title);
});

logEmitter.on("done", () => {
	console.log("✨ Done");
});

logEmitter.on("error", (error) => {
	console.error(error);
});

export default logEmitter;
