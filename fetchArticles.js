import Parser from "rss-parser";
import { Feed } from "./db.js";
import { convertRedditArticle } from "./reddit.js";

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
  [
    "Wall Street Journal",
    "https://feeds.content.dowjones.io/public/rss/RSSWorldNews",
  ],
  [
    "Wall Street Journal",
    "https://feeds.content.dowjones.io/public/rss/WSJcomUSBusiness",
  ],

  ["Los Angeles Times", "https://www.latimes.com/world-nation/rss2.0.xml"],
  ["New York Times", "https://rss.nytimes.com/services/xml/rss/nyt/World.xml"],
  ["New York Times", "https://rss.nytimes.com/services/xml/rss/nyt/US.xml"],
  [
    "New York Times",
    "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
  ],
  [
    "New York Times",
    "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
  ],
  ["Washington Post", "https://feeds.washingtonpost.com/rss/world"],
  ["Washington Post", "https://feeds.washingtonpost.com/rss/national"],
  ["The Guardian", "https://www.theguardian.com/us-news/rss"],
  ["Bloomberg", "https://feeds.bloomberg.com/markets/news.rss"],
  ["Bloomberg", "https://feeds.bloomberg.com/politics/news.rss"],
  ["NPR", "https://feeds.npr.org/1002/rss.xml"],
  ["CNN", "http://rss.cnn.com/rss/edition_us.rss"],
  ["Al Jazeera", "https://www.aljazeera.com/xml/rss/all.xml"],
  ["The Intercept", "https://theintercept.com/feed/?lang=en"],
  ["Democracy Now", "https://www.democracynow.org/democracynow.rss"],
  ["The American Prospect", "https://prospect.org/api/rss/content.rss"],
  ["Wired", "https://www.wired.com/feed/rss"],
  ["Common Dreams", "https://www.commondreams.org/feeds/news.rss"],
  ["The Lever", "https://www.levernews.com/tag/you-love-to-see-it/rss/"],
  ["/r/news", "https://www.reddit.com/r/news/new/.rss"],
  // ["/r/goodnews", "https://www.reddit.com/r/goodnews/new/.rss"],
  ["Labor Notes", "https://labornotes.org/feed"],
  ["AlterNet", "https://www.alternet.org/feeds/feed.rss"],
  ["Mother Jones", "https://www.motherjones.com/feed/"],
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
  let items = parsedFeed.items;

  if (url.match(/reddit.com/i)) {
    items = items.map(convertRedditArticle).filter((item) => !!item);
  }

  return items
    .filter((item) => item.isoDate > (last_published_at || ""))
    .map((article) => ({ ...article, feedId: id }));
}
