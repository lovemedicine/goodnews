import { labelTextWithGemini } from "./gemini.js";
import { labelTextWithVertexAi } from "./vertexai.js";
import { getFeeds, fetchNewArticles } from "./fetchArticles.js";
import { Article, Feed } from "./db.js";
import { labelingModel } from "./config.js";
import { standardizeLabel } from "./labels.js";
import { shortDescription } from "./util.js";

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

function getPermalink({ link, guid }) {
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

function isGood({ title }) {
  return title.match(/YOU LOVE TO SEE IT/i);
}

function getTextForLabeling(article) {
  if (!article.description) return article.title;
  const description = shortDescription(article.description);
  return article.title + ". " + description.split("\n")[0];
}

const feeds = await getFeeds();
const labelingFn = {
  gemini: labelTextWithGemini,
  vertex: labelTextWithVertexAi,
}[labelingModel];

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
      } else if (isGood(article)) {
        article.label = "good";
        console.log(article.link);
      } else {
        const text = getTextForLabeling(article);
        console.log(text);
        article.label = standardizeLabel(await labelingFn(text));
      }
      await saveArticle(article);
      console.log(article.label);
    }
  }

  if (articles.length > 0) {
    await updateLastPublished(feed, articles[0].isoDate);
  }
}
