import fs from "fs";
import crypto from "crypto";
import { Op } from "sequelize";
import { Article, Feed } from "./db.js";
import { generateStockImage } from "./images.js";
import { getTextForLabeling, getArticleImagePath } from "./util.js";

export async function loadArticles(recent = true, limit) {
  const oneDayAgo = new Date(new Date() - 24 * 60 * 60 * 1000);
  const where = { label: "good", parent_id: null };

  if (recent) {
    where.published_at = { [Op.gt]: oneDayAgo };
  }

  return await Article.findAll({
    where,
    order: [["published_at", "DESC"]],
    limit,
  });
}

function generateShortHash(length = 16) {
  const hash = crypto.randomBytes(16).toString("hex");
  return hash.slice(0, length);
}

export async function ensureArticleHash(article) {
  if (!article.hash) {
    await article.update({ hash: generateShortHash() });
  }
}

export async function generateImages(recent = true, limit = 10) {
  const articles = await loadArticles(recent, limit);
  console.log("**************");
  console.log(`generating images for ${articles.length} articles`);

  for (let i = 0; i < articles.length; i++) {
    console.log("**************");
    console.log(`${i + 1}/${articles.length}`);
    const article = articles[i];
    console.log(article.title);
    await ensureArticleHash(article);
    const filename = getArticleImagePath(article);

    if (fs.existsSync(filename)) {
      console.log("already illustrated this image, skipping...");
      continue;
    }

    const text = getTextForLabeling(article);
    await generateStockImage(article.title, filename);
  }
}

const recent = (process.argv[2] || "true") === "true";
const limit = parseInt(process.argv[3] || "10");
console.log(recent);
console.time();
await generateImages(recent, limit);
console.timeEnd();
