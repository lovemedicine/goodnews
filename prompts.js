export const prompts = {
  v1: {
    create: function (text) {
      return (
        `Would a leftist consider the following news a win, a loss, or neither? (Please answer with only one word: "win", "loss", or "neither". Answer "opinion" if the provided text is an opinion piece, or "not news" if the text is otherwise not a news article.)` +
        `\n\n"${text}"`
      );
    },
    standardize: function (label) {
      return {
        win: "good",
        loss: "bad",
        neither: "neutral",
        other: "other",
        opinion: "opinion",
      };
    },
  },
  v2: {
    create: function (text) {
      return (
        `Would a leftist consider the following news to be stressful, reassuring, or neither? (Please answer with one lower-case word. Answer "neither" if the news would be a mix of stressful and reassuring. Answer "safety" if the news would be stressful but contains important public health or safety information. Answer "opinion" if the provided text belongs to an opinion or editorial piece. Answer "not news" if the text is otherwise not a news article.)` +
        `\n\n"${text}"`
      );
    },
    standardize: function (label) {
      return {
        reassuring: "good",
        stressful: "bad",
        neither: "neutral",
        opinion: "opinion",
        safety: "essential",
        other: "other",
      }[label];
    },
  },
  v3: {
    create: function (text) {
      return (
        `Would an anti-Trump anti-Musk anti-DOGE anti-billionaire anti-racist anti-war anti-colonial anti-corporate anti-monopoly pro-union pro-immigration pro-democracy pro-regulation environmentalist feminist leftist consider the following news to be stressful, reassuring, or neither? (Please answer with one lower-case word. Answer "neither" if the news would be a mix of stressful and reassuring. Answer "reassuring" if the news is about growing opposition to or a reversal of something the person would consider bad. Answer "safety" if the news would be stressful but contains important public health or safety information. Answer "opinion" if the provided text seems to be part of a column or an opinion or editorial piece. Answer "not news" if the text is otherwise does not seem to be part of a news article.)` +
        `\n\n"${text}"`
      );
    },
    standardize: function (label) {
      return {
        reassuring: "good",
        stressful: "bad",
        neither: "neutral",
        opinion: "opinion",
        safety: "essential",
        other: "other",
      }[label];
    },
  },
  v4: {
    create: function (text) {
      return (
        `Would an anti-Trump anti-Musk anti-DOGE anti-billionaire anti-racist anti-war anti-colonial anti-corporate anti-monopoly pro-union pro-immigration pro-democracy pro-regulation environmentalist feminist leftist LGBTQ ally consider the following news to be stressful, reassuring, or neither? (Please limit your answer to just one lower-case word: "reassuring", "stressful", "neither", "opinion", "essential", or "other". Answer "reassuring" if the news is about opposition to or a reversal of something the person would consider bad. Answer "neither" if the news would otherwise be a mix of stressful and reassuring. Answer "essential" if the news is stressful but about essential information relevant to public health or safety. Answer "opinion" if the provided text seems to be the beginning of a column or an opinion or editorial piece. Answer "other" if the text is otherwise does not seem to be part of a news article.)` +
        `\n\n"${text}"`
      );
    },
    standardize: function (label) {
      return {
        reassuring: "good",
        stressful: "bad",
        neither: "neutral",
        opinion: "opinion",
        essential: "essential",
        other: "other",
      }[label];
    },
  },
};
