import dot from "dot";
import fs from "fs";
import { loadArticles, urlForArticle } from "./generateFeed.js";
import { shortDescription } from "./util.js";

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

export async function generateHtml(title, labels, humanLabels, filename) {
  const template = fs.readFileSync("html-template.txt");
  const allArticles = await loadArticles(labels, humanLabels, null);
  const childArticles = allArticles.filter((article) =>
    Boolean(article.parent_id)
  );
  const parentArticles = allArticles.filter((article) => !article.parent_id);
  const childGroups = childArticles.reduce((map, article) => {
    map[article.parent_id] = [...(map[article.parent_id] || []), article];
    return map;
  }, {});
  const articles = parentArticles.map((article) => {
    const cleanDescription = shortDescription(article.description).trim();
    const cleanTitle = article.title.trim();

    return {
      ...article.dataValues,
      url: urlForArticle(article),
      description: cleanDescription === cleanTitle ? '' : cleanDescription,
      feedName: article.dataValues.Feed?.name,
      children: childGroups[article.id]?.map((child) => ({
        ...child.dataValues,
        url: urlForArticle(child),
        feedName: child.dataValues.Feed?.name,
      }))
    };
  });
  // ONLY FOR WHEN GENERATING IMAGES
  // .filter((article) => {
  //   const filename = getArticleImagePath(article);
  //   return fs.existsSync(filename);
  // });
  const updated = getUpdatedAt();

  const tempFn = dot.template(template);
  const html = tempFn({ title, articles, updated });
  fs.writeFileSync(`feeds/${filename}`, html);
}
