import fs from "fs";
import RSS from "rss";
import { Op } from "sequelize";
import { Article, Feed } from "./db.js";

export async function loadArticles(labels, limit = 20) {
  const oneDayAgo = new Date(new Date() - 24 * 60 * 60 * 1000);
  return await Article.findAll({
    where: {
      [Op.and]: {
        published_at: { [Op.gt]: oneDayAgo },
        [Op.or]: [
          { human_label: labels },
          { label: labels, human_label: null},
        ]
      }
    },
    order: [["published_at", "DESC"]],
    limit,
    include: Feed,
  });
}

export function urlForArticle(article) {
  const paywallFeeds = [
    "New York Times",
    "Washington Post",
    "Wall Street Journal",
    "Bloomberg",
    "Financial Times",
  ];
  return paywallFeeds.includes(article.Feed?.name)
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
      author: article.creator || article.Feed?.name,
      guid: article.url,
    });
  });

  const xml = feed.xml({ indent: true });
  await fs.writeFileSync(`feeds/${name}.xml`, xml);
  return xml;
}
