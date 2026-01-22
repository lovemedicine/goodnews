import { Op } from "sequelize";
import { labelTextWithGemini } from "./gemini.js";
import { labelTextWithVertexAi, matchTextWithVertexAi } from "./vertexai.js";
import { getFeeds, fetchNewArticles } from "./fetchArticles.js";
import { Article, Feed } from "./db.js";
import { labelingModel } from "./config.js";
import { standardizeLabel } from "./labels.js";
import { getTextForLabeling } from "./util.js";
import { buildMatchingPrompt } from "./prompts.js";

async function findArticle(article) {
  return await Article.findOne({
    where: { url: getPermalink(article) },
  });
}

async function getRecentSoloGoodArticles() {
  const oneDayAgo = new Date(new Date() - 24 * 60 * 60 * 1000);
  return await Article.findAll({
    where: {
      label: "good",
      parent_id: null,
      published_at: { [Op.gt]: oneDayAgo },
    },
    order: [["id", "DESC"]],
  });
}

async function findParentId({ title, description }) {
  const articles = [
    { title, description },
    ...(await getRecentSoloGoodArticles()),
  ];

  console.log("recent good articles: ", articles.length - 1);

  if (articles.length < 2) {
    return null;
  }

  const headlines = articles.map((article) => getTextForLabeling(article));
  const prompt = buildMatchingPrompt(headlines);
  console.log(title);
  console.log(prompt);
  const match = await matchTextWithVertexAi(prompt);
  console.log(match);

  return match === 0 ? null : articles[match - 1].id;
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
  const parent_id =
    label === "good" ? await findParentId({ title, description }) : null;

  const article = await Article.create({
    url: getPermalink({ guid, link }),
    title,
    description: description?.trim(),
    author: creator,
    label,
    published_at: isoDate,
    parent_id,
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
  if (
    typeof guid === "string" &&
    guid.match(/^http/i) &&
    !link.match(/aljazeera\.com/) // al jazeera guids don't work as links
  ) {
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

const feeds = await getFeeds();
const labelingFn = {
  gemini: labelTextWithGemini,
  vertex: labelTextWithVertexAi,
}[labelingModel];

console.log("labeling with", labelingModel);

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
        const label = await labelingFn(text);
        article.label = label ? standardizeLabel(label) : null;
      }

      if (article.label) await saveArticle(article);
      console.log(article.label);
    }
  }

  if (articles.length > 0) {
    await updateLastPublished(feed, articles[0].isoDate);
  }
}
