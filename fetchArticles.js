import Parser from "rss-parser";
import { Feed } from "./db.js";

const parser = new Parser({ customFields: { item: ["description"] } });
const feedUrls = [
  [
    "New York Times",
    "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
  ],
  [
    "Wall Street Journal",
    "https://feeds.content.dowjones.io/public/rss/RSSUSnews",
  ],
  ["Los Angeles Times", "https://www.latimes.com/world-nation/rss2.0.xml"],
  ["New York Times", "https://rss.nytimes.com/services/xml/rss/nyt/World.xml"],
  ["Washington Post", "https://feeds.washingtonpost.com/rss/world"],
  ["Washington Post", "https://feeds.washingtonpost.com/rss/national"],
  ["The Guardian", "https://www.theguardian.com/us-news/rss"],
  ["The Intercept", "https://theintercept.com/feed/?lang=en"],
  ["Democracy Now", "https://www.democracynow.org/democracynow.rss"],
  ["The American Prospect", "https://prospect.org/api/rss/content.rss"],
  ["Common Dreams", "https://www.commondreams.org/feeds/feed.rss"],
  ["The Lever", "https://www.levernews.com/tag/you-love-to-see-it/rss/"],
  // ["Chicago Tribune", "https://www.chicagotribune.com/feed/"],
  // ["San Jose Mercury News", "https://www.mercurynews.com/news/feed/"],
  // ["NBC News", "https://feeds.nbcnews.com/nbcnews/public/news"],
  // ["People's Dispatch", "https://peoplesdispatch.org/feed/"],
];

async function findFeedByUrl(url) {
  return await Feed.findOne({ where: { url } });
}

async function ensureFeeds() {
  for (let i = 0; i < feedUrls.length; i++) {
    const [name, url] = feedUrls[i];
    const feed = await findFeedByUrl(url);

    if (!feed) {
      await Feed.create({ name, url });
    }
  }
}

export async function getFeeds() {
  await ensureFeeds();
  const urls = feedUrls.map(([_, url]) => url);
  return await Feed.findAll({ where: { url: urls } });
}

export async function fetchNewArticles(feed) {
  const { id, url, last_published_at } = feed;
  const parsedFeed = await parser.parseURL(url);
  return parsedFeed.items
    .filter((item) => item.isoDate > (last_published_at || ""))
    .map((article) => ({ ...article, feedId: id }));
}
