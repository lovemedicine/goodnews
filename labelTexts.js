import { GoogleGenerativeAI } from "@google/generative-ai";
import { geminiApiKey, hfToken } from "./config.js";

// const labels = ["hopeful", "delightful", "neutral", "sad", "scary"];
const defaultLabels = ["good news", "bad news", "neutral news"];

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

async function labelTextsWithBart(texts, labels = defaultLabels) {
  const response = await queryBart({
    inputs: texts,
    parameters: { candidate_labels: labels },
  });

  // console.log(response);
  return response.map(computeBartResult);
}

async function labelTextsWithGemini(texts) {
  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const promptStart = `Would a leftist consider the following news a win, a loss, or neither? (Please answer with only one word: "win", "loss", or "neither". Answer "not news" if the provided text is an opinion piece.) `;
  let results = [];

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    const result = await model.generateContent(promptStart + `"${text}"`);
    const labelMap = {
      win: "good news",
      loss: "bad news",
      neither: "neutral news",
      "not news": "not news",
    };
    const label = labelMap[result.response.text().trim().toLowerCase()];
    results.push(label);
    console.log("*******************");
    console.log(`${i + 1} / ${texts.length}`);
    console.log(text);
    console.log(label);
    // this model is free but rate-limited to 15 req/min
    await new Promise((r) => setTimeout(r, 4000));
  }

  return results;
}

export async function labelTexts(texts, method = "gemini") {
  const functions = {
    bart: labelTextsWithBart,
    gemini: labelTextsWithGemini,
  };
  return functions[method](texts);
}
