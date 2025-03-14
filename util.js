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
    .split("\n")[0];
}
