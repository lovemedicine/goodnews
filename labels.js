export function standardizeLabel(label) {
  return {
    reassuring: "good",
    stressful: "bad",
    neither: "neutral",
    opinion: "opinion",
    essential: "essential",
    other: "other",
  }[label];
}

export function destandardizeLabel(label) {
  return {
    good: "reassuring",
    bad: "stressful",
    neutral: "neither",
    opinion: "opinion",
    essential: "essential",
    other: "other",
  }[label];
}
