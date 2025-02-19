import "dotenv/config";
import { convert } from "html-to-text";
import { labelTextWithGemini } from "./labelTexts.js";
import { getFeeds, fetchNewArticles } from "./fetchArticles.js";
import { Article, Feed } from "./db.js";

async function findArticle(article) {
  return await Article.findOne({
    where: { url: getPermalink(article) },
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
    url: getPermalink({ guid, link }),
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

async function getPermalink({ link, guid }) {
  if (typeof guid === "string" && guid.match(/^http/i)) {
    return guid;
  } else {
    return link;
  }
}

function isOpinion({ link, title }) {
  return (
    link.match(/opinion|editorial|column|commentisfree/i) ||
    title.match(/\b(opinion|editorial|column)\b/i)
  );
}

function getTextForLabeling(article) {
  if (!article.description) return article.title;

  const description = convert(article.description, {
    wordwrap: false,
    selectors: [
      { selector: "a", options: { ignoreHref: true } },
      { selector: "img", format: "skip" },
    ],
  });
  return article.title + ". " + description.split("\n")[0];
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
      if (isOpinion(article)) {
        article.label = "opinion";
        console.log(article.link);
      } else {
        const text = getTextForLabeling(article);
        console.log(text);
        article.label = await labelTextWithGemini(text);
      }
      await saveArticle(article);
      console.log(article.label);
      // gemini is free but rate-limited to 15 req/min
      await new Promise((r) => setTimeout(r, 4000));
    }
  }

  if (articles.length > 0) {
    await updateLastPublished(feed, articles[0].isoDate);
  }
}
