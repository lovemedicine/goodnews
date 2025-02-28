import tldjs from "tldjs";

export function convertRedditArticle(article) {
  const link = article.content?.match(/<a href="([^"]+)">\[link\]/i);

  if (link) {
    const domain = getRootDomain(link[1]);
    // discard links to other reddit posts
    if (domain === "reddit.com") return null;

    article.link = link[1];
    article.description = null;
    article.author = domain + " via reddit";
    return article;
  }

  return null;
}

function getRootDomain(urlString) {
  const parsedUrl = new URL(urlString);
  const domain = parsedUrl.hostname;

  // Use tldjs to get the root domain (handles ccTLDs like .co.uk, .com.au, etc.)
  const rootDomain = tldjs.getDomain(domain);

  return rootDomain;
}
