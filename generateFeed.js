import fs from "fs";
import RSS from "rss";
import { Article, Feed } from "./db.js";

export async function loadArticles(labels) {
  return await Article.findAll({
    where: { label: labels },
    order: [["published_at", "DESC"]],
    limit: 20,
    include: Feed,
  });
}

export function urlForArticle(article) {
  const paywallFeeds = [
    "New York Times",
    "Washington Post",
    "Wall Street Journal",
  ];
  return paywallFeeds.includes(article.Feed.name)
    ? `https://archive.is/2025/${article.url}`
    : article.url;
}

export async function generateFeed(name, labels) {
  const articles = await loadArticles(labels);
  const lastPublishedAt = articles.reduce(
    (last, article) =>
      article.published_at > last ? article.published_at : last,
    null
  );
  const feed = new RSS({
    title: `welcome.news - ${name}`,
    description: `all the ${name} news that's fit to print`,
    feed_url: `http://welcome.news/${name}.xml`,
    site_url: "http://welcome.news/",
    language: "en",
    pubDate: lastPublishedAt,
    ttl: "60",
  });

  articles.forEach((article) => {
    feed.item({
      title: article.title,
      description: article.description,
      url: urlForArticle(article),
      date: article.published_at,
      author: article.creator || article.Feed.name,
      guid: article.url,
    });
  });

  const xml = feed.xml({ indent: true });
  await fs.writeFileSync(`feeds/${name}.xml`, xml);
  return xml;
}
