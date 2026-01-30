import express from "express";
import { Op } from "sequelize";
import { Article, Feed } from "./db.js";

const HUMAN_LABELS = ["good", "bad", "neutral", "opinion", "essential", "other"];

function isValidHumanLabel(value) {
  return value === null || value === "" || HUMAN_LABELS.includes(value);
}

const AUTH_USER = process.env.AUTH_USER;
const AUTH_PASS = process.env.AUTH_PASS;

function basicAuth(req, res, next) {
  if (!AUTH_USER || !AUTH_PASS) {
    return next();
  }
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Labeling"');
    return res.status(401).send("Authentication required");
  }
  const encoded = auth.slice(6);
  let decoded;
  try {
    decoded = Buffer.from(encoded, "base64").toString("utf-8");
  } catch {
    res.setHeader("WWW-Authenticate", 'Basic realm="Labeling"');
    return res.status(401).send("Authentication required");
  }
  const i = decoded.indexOf(":");
  const user = i === -1 ? decoded : decoded.slice(0, i);
  const pass = i === -1 ? "" : decoded.slice(i + 1);
  if (user !== AUTH_USER || pass !== AUTH_PASS) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Labeling"');
    return res.status(401).send("Authentication required");
  }
  next();
}

const app = express();
const admin = express.Router();

admin.use(express.json());
admin.use(basicAuth);
admin.use(express.static("public"));

const PAGE_SIZE = 100;

admin.get("/api/articles", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || PAGE_SIZE));
    const offset = (page - 1) * limit;

    const { label, human_label, feed_name, published_after, published_before } =
      req.query;

    const where = {};

    if (label !== undefined && label !== null) {
      where.label = label === "" ? null : label;
    }
    if (human_label !== undefined && human_label !== null) {
      where.human_label = human_label === "" ? null : human_label;
    }
    if (published_after != null && published_after !== "") {
      const t = new Date(published_after);
      if (!Number.isNaN(t.getTime())) {
        where.published_at = { ...where.published_at, [Op.gte]: t };
      }
    }
    if (published_before != null && published_before !== "") {
      const t = new Date(published_before);
      if (!Number.isNaN(t.getTime())) {
        where.published_at = { ...where.published_at, [Op.lte]: t };
      }
    }

    const include = [
      {
        model: Feed,
        attributes: ["name"],
        ...(feed_name != null && feed_name !== ""
          ? { where: { name: feed_name }, required: true }
          : {}),
      },
    ];

    const { count, rows: articles } = await Article.findAndCountAll({
      where,
      order: [["published_at", "DESC"]],
      limit,
      offset,
      attributes: [
        "id",
        "url",
        "title",
        "description",
        "author",
        "label",
        "human_label",
        "published_at",
        "parent_id",
      ],
      include,
    });

    const payload = articles.map((a) => {
      const { Feed: feed, ...rest } = a.toJSON();
      return { ...rest, feed_name: feed?.name };
    });

    res.json({
      articles: payload,
      total: count,
      page,
      limit,
      total_pages: Math.ceil(count / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

admin.patch("/api/articles", async (req, res) => {
  const { id, ids, human_label } = req.body;

  if (human_label === undefined) {
    return res.status(400).json({ error: "Missing human_label" });
  }

  const normalized = human_label === "" ? null : human_label;

  if (!isValidHumanLabel(normalized)) {
    return res.status(400).json({
      error: "Invalid human_label",
      allowed: HUMAN_LABELS,
    });
  }

  const articleIds = ids ?? (id != null ? [id] : null);
  if (!articleIds?.length) {
    return res.status(400).json({ error: "Provide id or ids array" });
  }

  try {
    const [count] = await Article.update(
      { human_label: normalized },
      { where: { id: articleIds } }
    );
    res.json({ updated: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update articles" });
  }
});

app.use("/admin", admin);

const port = process.env.PORT ?? 3000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}/admin/`));
