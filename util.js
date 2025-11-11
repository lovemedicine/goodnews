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

export function cleanGoogleNewsTitle(title) {
  const googleNewsSources = ['reuters', 'ap news', 'cnn'];
  const googleNewsSourcesRegex = googleNewsSources.map(name => "(" + name + ")").join("|");
  const regex = new RegExp(`\\s+- (${googleNewsSourcesRegex})`, 'i');
  return title.replace(regex, '');
}
