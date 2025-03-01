import dot from "dot";
import fs from "fs";
import { loadArticles } from "./generateFeed.js";
import { shortDescription } from "./util.js";

function getUpdatedAt() {
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  const timeParts = time.split(", ");
  return `${timeParts[0]}, ${timeParts[1]} at ${timeParts[2]} Eastern`;
}

export async function generateHtml(title, labels, filename) {
  const template = fs.readFileSync("html-template.txt");
  const articles = (await loadArticles(labels)).map((article) => ({
    ...article.dataValues,
    description: shortDescription(article.description),
  }));
  const updated = getUpdatedAt();

  const tempFn = dot.template(template);
  const html = tempFn({ title, articles, updated });
  fs.writeFileSync(`feeds/${filename}`, html);
}
