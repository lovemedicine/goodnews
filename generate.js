import { generateFeed } from "./generateFeed.js";
import { generateHtml } from "./generateHtml.js";

await generateFeed("good", ["good"]);
await generateFeed("notbad", ["good", "neutral", "essential", "other"]);
await generateFeed("bad", ["bad"]);
await generateFeed("all", [
  "good",
  "bad",
  "neutral",
  "essential",
  "opinion",
  "other",
]);

await generateHtml("the good", ["good"], "index.html");
