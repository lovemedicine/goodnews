import Parser from "rss-parser";
import { Feed } from "./db.js";

const parser = new Parser({ customFields: { item: ["description"] } });
const feedUrls = [
  [
    "nytimes-homepage",
    "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
  ],
  ["wsj-us", "https://feeds.content.dowjones.io/public/rss/RSSUSnews"],
  ["latimes-world-nation", "https://www.latimes.com/world-nation/rss2.0.xml"],
  ["nyt-world", "https://rss.nytimes.com/services/xml/rss/nyt/World.xml"],
  ["wapo-world", "https://feeds.washingtonpost.com/rss/world"],
  ["wapo-us", "https://feeds.washingtonpost.com/rss/national"],
  ["guardian-us", "https://www.theguardian.com/us/rss"],
  ["intercept", "https://theintercept.com/feed/?lang=en"],
  ["democracynow", "https://www.democracynow.org/democracynow.rss"],
  ["propublica", "https://www.propublica.org/feeds/propublica/main"],
  ["prospect", "https://prospect.org/api/rss/content.rss"],
  ["commondreams", "https://www.commondreams.org/feeds/feed.rss"],
  ["jacobin", "https://jacobin.com/feed/"],
];

async function findFeedByName(name) {
  return await Feed.findOne({ where: { name } });
}

async function ensureFeeds() {
  for (let i = 0; i < feedUrls.length; i++) {
    const [name, url] = feedUrls[i];
    const feed = await findFeedByName(name);

    if (!feed) {
      await Feed.create({ name, url });
    }
  }
}

export async function getAllFeeds() {
  await ensureFeeds();
  return await Feed.findAll();
}

export async function fetchNewArticles(feed) {
  const { id, url, last_published_at } = feed;
  const parsedFeed = await parser.parseURL(url);
  return parsedFeed.items
    .filter((item) => item.isoDate > (last_published_at || ""))
    .map((article) => ({ ...article, feedId: id }));
}
