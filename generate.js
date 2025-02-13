import { labelTexts } from "./labelTexts.js";
import { fetchArticles } from "./fetchArticles.js";
import { Article, Feed } from "./db.js";
import { generateFeed } from "./generateFeed.js";

async function labelArticles(articles, method) {
  const texts = articles.map(
    (article) => article.title + ". " + article.description
  );
  const labels = await labelTexts(texts, method);

  return articles.map((article, i) => {
    article.label = labels[i];
    return article;
  });
}

async function findArticle({ guid }) {
  return await Article.findOne({ where: { url: guid } });
}

async function saveArticle({
  guid,
  title,
  description,
  label,
  isoDate,
  feedId,
}) {
  const article = await Article.create({
    url: guid,
    title,
    description,
    label,
    published_at: isoDate,
  });
  // for some reason the feed_id isn't saved when given directly to Article.create()
  // so we use setFeed() instead
  const feed = await Feed.findOne({ where: { id: feedId } });
  article.setFeed(feed);
  return article;
}

async function saveArticles(articles) {
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];

    if (!(await findArticle(article))) {
      await saveArticle(article);
    }
  }
}

const method = process.argv[2] || undefined;
const articles = await fetchArticles();
const newArticles = [];

for (let i = 0; i < articles.length; i++) {
  const article = articles[i];

  if (!(await findArticle(article))) {
    newArticles.push(article);
  }
}

console.log(`found ${newArticles.length} new articles`);
const labeledArticles = await labelArticles(newArticles, method);

// labeledArticles.forEach((article) => {
//   console.log("---------------");
//   console.log(article.title);
//   console.log(article.description);
//   console.log(article.link);
//   console.log(article.isoDate);
//   console.log(article.label);
// });

await saveArticles(labeledArticles);

await generateFeed();
