import fs from "fs";
import { parse } from "csv-parse/sync";

function promptWithParts(contentsParts, systemInstruction = undefined) {
  return {
    contents: [
      {
        role: "user",
        parts: contentsParts,
      },
    ],
    generationConfig: {
      temperature: 0.1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    },
    systemInstruction,
  };
}

export const prompts = {
  v1: {
    create: function (text) {
      return promptWithParts([
        {
          text:
            `Would a leftist consider the following news a win, a loss, or neither? (Please answer with only one word: "win", "loss", or "neither". Answer "opinion" if the provided text is an opinion piece, or "not news" if the text is otherwise not a news article.)` +
            `\n\n"${text}"`,
        },
      ]);
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
      return promptWithParts([
        {
          text:
            `Would a leftist consider the following news to be stressful, reassuring, or neither? (Please answer with one lower-case word. Answer "neither" if the news would be a mix of stressful and reassuring. Answer "safety" if the news would be stressful but contains important public health or safety information. Answer "opinion" if the provided text belongs to an opinion or editorial piece. Answer "not news" if the text is otherwise not a news article.)` +
            `\n\n"${text}"`,
        },
      ]);
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
      return promptWithParts([
        {
          text:
            `Would an anti-Trump anti-Musk anti-DOGE anti-billionaire anti-racist anti-war anti-colonial anti-corporate anti-monopoly pro-union pro-immigration pro-democracy pro-regulation environmentalist feminist leftist consider the following news to be stressful, reassuring, or neither? (Please answer with one lower-case word. Answer "neither" if the news would be a mix of stressful and reassuring. Answer "reassuring" if the news is about growing opposition to or a reversal of something the person would consider bad. Answer "safety" if the news would be stressful but contains important public health or safety information. Answer "opinion" if the provided text seems to be part of a column or an opinion or editorial piece. Answer "not news" if the text is otherwise does not seem to be part of a news article.)` +
            `\n\n"${text}"`,
        },
      ]);
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
      return promptWithParts([
        {
          text:
            `Would an anti-Trump anti-Musk anti-DOGE anti-billionaire anti-racist anti-war anti-colonial anti-corporate anti-monopoly pro-union pro-immigration pro-democracy pro-regulation environmentalist feminist leftist LGBTQ ally consider the following news to be stressful, reassuring, or neither? (Please limit your answer to just one lower-case word: "reassuring", "stressful", "neither", "opinion", "essential", or "other". Answer "reassuring" if the news is about opposition to or a reversal of something the person would consider bad. Answer "neither" if the news would otherwise be a mix of stressful and reassuring. Answer "essential" if the news is stressful but about essential information relevant to public health or safety. Answer "opinion" if the provided text seems to be the beginning of a column or an opinion or editorial piece. Answer "other" if the text is otherwise does not seem to be part of a news article.)` +
            `\n\n"${text}"`,
        },
      ]);
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
  structured: {
    create: function (text) {
      const parts = [];

      function destandardize(label) {
        return {
          good: "reassuring",
          bad: "stressful",
          neutral: "neither",
          opinion: "opinion",
          essential: "essential",
          other: "other",
        }[label];
      }

      const contents = fs.readFileSync("tuning/tuning.csv").toString();
      const examples = parse(contents, {
        columns: true,
      });

      examples.forEach(({ text, expectedLabel }) => {
        parts.push({ text: `input: ${text}` });
        const output = destandardize(expectedLabel);
        parts.push({ text: `output: ${output}` });
      });

      return promptWithParts(parts, {
        parts: [
          {
            text: "You are an anti-Trump anti-Musk anti-DOGE anti-billionaire anti-racist anti-war anti-colonial anti-corporate anti-monopoly pro-union pro-immigration pro-democracy pro-regulation environmentalist feminist leftist LGBTQ ally.",
          },
          {
            text: 'You will be provided text from a news website, and your job is to classify it as stressful, reassuring, or neither. Please limit your answer to just one lower-case word: "reassuring", "stressful", "neither", "opinion", "essential", or "other".',
          },
          {
            text: 'Answer "reassuring" if the news is about opposition to or a reversal of something the person would consider bad. Answer "neither" if the news would be a mix of stressful and reassuring. Answer "essential" if the news is stressful but is relevant to public health or safety. Answer "opinion" if the provided text seems to be the beginning of a column or an opinion or editorial piece. Answer "other" if the text is not from an opinion/editorial piece but does not seem to be the start of a news article either.',
          },
        ],
      });
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
  tuned: {
    create: function (text) {
      return promptWithParts([{ text }], {
        parts: [
          {
            text: "You are an anti-Trump anti-Musk anti-DOGE anti-billionaire anti-racist anti-war anti-colonial anti-corporate anti-monopoly pro-union pro-immigration pro-democracy pro-regulation environmentalist feminist leftist LGBTQ ally.",
          },
          {
            text: 'You will be provided text from a news website, and your job is to classify it as stressful, reassuring, or neither. Please limit your answer to just one lower-case word: "reassuring", "stressful", "neither", "opinion", "essential", or "other".',
          },
          {
            text: 'Answer "reassuring" if the news is about opposition to or a reversal of something the person would consider bad. Answer "neither" if the news would be a mix of stressful and reassuring. Answer "essential" if the news is stressful but is relevant to public health or safety. Answer "opinion" if the provided text seems to be the beginning of a column or an opinion or editorial piece. Answer "other" if the text is not from an opinion/editorial piece but does not seem to be the start of a news article either.',
          },
        ],
      });
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
    model: "tunedModels/goodnews-prompt-v4-using-context-8cl7e75",
  },
};
