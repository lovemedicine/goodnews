import { generateFeed } from "./generateFeed.js";

await generateFeed("good", ["good news"]);
await generateFeed("notbad", ["good news", "neutral news"]);
