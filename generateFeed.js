import fs from "fs";
import RSS from "rss";
import { Article, Feed } from "./db.js";

export async function generateFeed(name, labels) {
  const articles = await Article.findAll({
    where: { label: labels },
    order: [["published_at", "DESC"]],
    limit: 20,
    include: Feed,
  });
  const lastPublishedAt = articles.reduce(
    (last, article) =>
      article.published_at > last ? article.published_at : last,
    null
  );

  const feed = new RSS({
    title: `The New Dark Times - ${name}`,
    description: "All the news that's fit to print, minus the sad stuff",
    feed_url: `https://lovemedicine.github.io/goodnews/${name}.xml`,
    site_url: "https://lovemedicine.github.io/goodnews",
    language: "en",
    pubDate: lastPublishedAt,
    ttl: "60",
  });

  articles.forEach((article) => {
    feed.item({
      title: article.title,
      description: article.description,
      url: `https://archive.is/2025/${article.url}`,
      date: article.published_at,
      author: article.creator || article.Feed.name,
      guid: article.url,
    });
  });

  const xml = feed.xml({ indent: true });
  await fs.writeFileSync(`feeds/${name}.xml`, xml);
  return xml;
}
