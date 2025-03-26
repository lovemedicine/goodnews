import dot from "dot";
import fs from "fs";
import { loadArticles, urlForArticle } from "./generateFeed.js";
import { shortDescription, getArticleImagePath } from "./util.js";

function getUpdatedAt() {
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
  const timeParts = time.split(", ");
  return `${timeParts[0]}, ${timeParts[1]} at ${timeParts[2]} Eastern`;
}

export async function generateHtml(title, labels, filename) {
  const template = fs.readFileSync("html-template.txt");
  const articles = (await loadArticles(labels, null))
    .map((article) => ({
      ...article.dataValues,
      url: urlForArticle(article),
      description: shortDescription(article.description),
      feedName: article.dataValues.Feed?.name,
    }))
    .filter((article) => {
      const filename = getArticleImagePath(article);
      return fs.existsSync(filename);
    });
  const updated = getUpdatedAt();

  const tempFn = dot.template(template);
  const html = tempFn({ title, articles, updated });
  fs.writeFileSync(`feeds/${filename}`, html);
}
