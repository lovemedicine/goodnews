import { generateFeed } from "./generateFeed.js";
import { generateHtml } from "./generateHtml.js";

await generateFeed("good", ["good"]);
await generateFeed("notbad", ["good", "neutral", "essential", "other"]);
await generateFeed("bad", ["bad"]);
await generateFeed("neutral", ["neutral"]);
await generateFeed("all", [
  "good",
  "bad",
  "neutral",
  "essential",
  "opinion",
  "other",
]);

await generateHtml("welcome news", ["good"], "index.html");
await generateHtml("unwelcome news", ["bad"], "bad.html");
await generateHtml("neutral news", ["neutral"], "neutral.html");