import { generateFeed } from "./generateFeed.js";
import { generateHtml } from "./generateHtml.js";

await generateFeed("good", ["good"], ["good", null]);
await generateFeed("notbad", ["good", "neutral", "essential", "other"], ["good", "neutral", "essential", "other", null]);
await generateFeed("bad", ["bad"], ["bad", null]);
await generateFeed("neutral", ["neutral"], ["neutral", null]);
await generateFeed("all", [
  "good",
  "bad",
  "neutral",
  "essential",
  "opinion",
  "other",
]);

await generateHtml("welcome news", ["good"], ["good", null],"index.html");
await generateHtml("unwelcome news", ["bad"], ["bad", null], "bad.html");
await generateHtml("neutral news", ["neutral"], ["neutral", null], "neutral.html");