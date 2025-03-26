import fs from "fs";
import crypto from "crypto";
import { Op } from "sequelize";
import { Article } from "./db.js";
import { generateImage } from "./images.js";
import { getTextForLabeling } from "./util.js";

export async function loadArticles(recent = true, limit = 10) {
  const oneDayAgo = new Date(new Date() - 24 * 60 * 60 * 1000);
  const where = { label: "good" };

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

export async function generateImages(recent = true) {
  const articles = await loadArticles(recent);
  console.log("**************");
  console.log(`generating images for ${articles.length} articles`);

  for (let i = 0; i < articles.length; i++) {
    console.log("**************");
    console.log(`${i + 1}/${articles.length}`);
    const article = articles[i];
    console.log(article.title);
    await ensureArticleHash(article);
    const filename = `feeds/images/image-${article.hash}.jpg`;

    if (fs.existsSync(filename)) {
      console.log("already illustrated this image, skipping...");
      continue;
    }

    const text = getTextForLabeling(article);
    await generateImage(article.title, filename);
  }
}

const recent = (process.argv[2] || "true") === "true";
console.log(recent);
console.time();
await generateImages(recent);
console.timeEnd();
