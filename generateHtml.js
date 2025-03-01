import dot from "dot";
import fs from "fs";
import { loadArticles } from "./generateFeed.js";

function getUpdatedAt() {
  const dateParts = new Date().toString().split(" ");
  const date = dateParts.slice(1, 4).join(" ");
  const time = dateParts[4].split(":").slice(0, 2).join(":") + " Eastern";
  return date + " " + time;
}

export async function generateHtml(title, labels, filename) {
  const template = fs.readFileSync("html-template.txt");
  const articles = await loadArticles(labels);
  const updated = getUpdatedAt();

  const tempFn = dot.template(template);
  const html = tempFn({ title, articles, updated });
  fs.writeFileSync(`feeds/${filename}`, html);
}
