import express from "express";
import { Article, Feed } from "./db.js";

const HUMAN_LABELS = ["good", "bad", "neutral", "opinion", "essential", "other"];

function isValidHumanLabel(value) {
  return value === null || value === "" || HUMAN_LABELS.includes(value);
}

const app = express();
app.use(express.json());

app.get("/api/articles", async (req, res) => {
  try {
    const articles = await Article.findAll({
      order: [["published_at", "DESC"]],
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
      include: [{ model: Feed, attributes: ["name"] }],
    });
    const payload = articles.map((a) => {
      const { Feed: feed, ...rest } = a.toJSON();
      return { ...rest, feed_name: feed?.name };
    });
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

app.patch("/api/articles", async (req, res) => {
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

const port = process.env.PORT ?? 3000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
