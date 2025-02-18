import { generateFeed } from "./generateFeed.js";

await generateFeed("good", ["good"]);
await generateFeed("notbad", ["good", "neutral", "essential", "other"]);
await generateFeed("bad", ["bad"]);
