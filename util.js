import { convert } from "html-to-text";

export function shortDescription(description) {
  return convert(description, {
    wordwrap: false,
    selectors: [
      { selector: "a", options: { ignoreHref: true } },
      { selector: "img", format: "skip" },
    ],
  })
    .trim()
    .split("\n")[0]
    .replace(/\s+(reuters|ap news)$/i, '');
}

export function getTextForLabeling({ title, description }) {
  if (!description) return title;
  return title + ". " + shortDescription(description);
}

export function getArticleImagePath({ hash }) {
  return `feeds/images/image-${hash}.jpg`;
}
