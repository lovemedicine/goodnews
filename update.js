import "dotenv/config";
import { convert } from "html-to-text";
import { labelTextWithGemini } from "./labelTexts.js";
import { getFeeds, fetchNewArticles } from "./fetchArticles.js";
import { Article, Feed } from "./db.js";

async function findArticle({ guid, link }) {
  return await Article.findOne({
    where: { url: typeof guid === "string" ? guid : link },
  });
}

async function saveArticle({
  guid,
  link,
  title,
  description,
  creator,
  label,
  isoDate,
  feedId,
}) {
  const article = await Article.create({
    url: typeof guid === "string" ? guid : link,
    title,
    description,
    author: creator,
    label,
    published_at: isoDate,
  });
  // for some reason the feed_id isn't saved when given directly to Article.create()
  // so we use setFeed() instead
  const feed = await Feed.findOne({ where: { id: feedId } });
  article.setFeed(feed);
  return article;
}

async function updateLastPublished(feed, dateTime) {
  return await Feed.update(
    { last_published_at: dateTime },
    { where: { url: feed.url } }
  );
}

const feeds = await getFeeds();

for (let i = 0; i < feeds.length; i++) {
  const feed = feeds[i];
  console.log("*******************");
  console.log(`processing ${feed.url}`);
  const articles = await fetchNewArticles(feed);
  console.log(`found ${articles.length} new articles`);

  for (let j = 0; j < articles.length; j++) {
    let article = articles[j];
    console.log("*******************");
    console.log(`${j + 1} / ${articles.length}`);

    if (await findArticle(article)) {
      console.log(`skipping ${article.link}`);
    } else {
      const text =
        article.title +
        ". " +
        convert(article.description, { wordwrap: false });
      article.label = await labelTextWithGemini(text);
      await saveArticle(article);
      console.log(text);
      console.log(article.label);
      // gemini is free but rate-limited to 15 req/min
      await new Promise((r) => setTimeout(r, 4000));
    }
  }

  if (articles.length > 0) {
    await updateLastPublished(feed, articles[0].isoDate);
  }
}
