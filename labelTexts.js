import { GoogleGenerativeAI } from "@google/generative-ai";
import { geminiApiKey, hfToken } from "./config.js";

async function queryBart(data) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
    {
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  const result = await response.json();
  return result;
}

function computeBartResult({ labels, scores }) {
  if (scores[0] > 0.5 && scores[0] > scores[1] * 1.5) {
    return labels[0];
  } else {
    return null;
  }
}

async function labelTextsWithBart(texts) {
  const response = await queryBart({
    inputs: texts,
    parameters: {
      candidate_labels: ["good news", "bad news", "neutral news", "not news"],
    },
  });

  // console.log(response);
  return response.map(computeBartResult);
}

const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

function writePrompt(text, version = 1) {
  const promptStart = [
    `Would a leftist consider the following news a win, a loss, or neither? (Please answer with only one word: "win", "loss", or "neither". Answer "opinion" if the provided text is an opinion piece, or "not news" if the text is otherwise not a news article.)`,
    `Would a leftist consider the following news to be hopeful, stressful, or neither? (Please answer with one word. If it would be mix of hopeful and stressful, answer "neither". Answer "opinion" if the provided text is an opinion piece, or "not news" if the text is otherwise not a news article.)`,
  ];

  return promptStart[version - 1] + `\n\n"${text}"`;
}

export async function labelTextWithGemini(text) {
  const result = await model.generateContent(writePrompt(text));
  const labelMap = {
    win: "good news",
    loss: "bad news",
    neither: "neutral news",
    "not news": "not news",
    opinion: "opinion",
  };

  return labelMap[result.response.text().trim().toLowerCase()];
}
