import { GoogleGenerativeAI } from "@google/generative-ai";
import { geminiApiKey, hfToken } from "./config.js";
import { prompts } from "./prompts.js";

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

export async function askGemini(prompt, modelName = "gemini-2.0-flash") {
  const model = genAI.getGenerativeModel({ model: modelName });
  return (await model.generateContent(prompt)).response
    .text()
    .trim()
    .toLowerCase();
}

export async function labelTextWithGemini(text, promptVersion = "structured") {
  const prompt = prompts[promptVersion];
  const result = await askGemini(prompt.create(text));
  return prompt.standardize(result);
}
