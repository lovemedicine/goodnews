import fs from "fs";
import RSS from "rss";
import { Article, Feed } from "./db.js";

export async function generateFeed() {
  const articles = await Article.findAll({
    where: { label: "good news" },
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
    title: "The New Dark Times",
    description: "All the news that's fit to print, minus the sad stuff",
    feed_url: "https://thegoodnews.tiiny.site/goodnews.xml",
    site_url: "https://thegoodnews.tiiny.site",
    language: "en",
    pubDate: lastPublishedAt,
    ttl: "60",
  });

  articles.forEach((article) => {
    feed.item({
      title: article.title,
      description: article.description,
      url: article.url,
      date: article.published_at,
      author: article.Feed.name,
      guid: article.url,
    });
  });

  const xml = feed.xml({ indent: true });
  await fs.writeFileSync("docs/goodnews.xml", xml);
  return xml;
}
