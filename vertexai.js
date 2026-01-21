// you must install gcloud CLI before using vertexai api
// follow instructions on https://cloud.google.com/sdk/docs/install

import { VertexAI } from "@google-cloud/vertexai";
import { instructions, matchingInstructions } from "./prompts.js";

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({
  project: "1095783573977",
  location: "us-central1",
});

// Using tuned model: goodnews-classifier-501
const model =
  "projects/1095783573977/locations/us-central1/endpoints/7477724704434814976";

// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    maxOutputTokens: 5,
    temperature: 0,
    topP: 0.95,
  },
  safetySettings: [
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "OFF",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "OFF",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "OFF",
    },
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "OFF",
    },
  ],
  systemInstruction: {
    parts: [{ text: instructions }],
  },
});
const matchingModel = vertex_ai.preview.getGenerativeModel({
  model: "gemini-2.0-flash-001",
  generationConfig: {
    maxOutputTokens: 5,
    temperature: 0,
    topP: 0.95,
  },
  safetySettings: [
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "OFF",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "OFF",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "OFF",
    },
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "OFF",
    },
  ],
  systemInstruction: {
    parts: [{ text: matchingInstructions }]
  }
});

const chat = generativeModel.startChat({});
const match = matchingModel.startChat({});

async function wait() {
  return await new Promise((r) => setTimeout(r, 4000));
}

export async function labelTextWithVertexAi(text, doWait = true) {
  if (doWait) await wait();
  const result = await chat.sendMessage(text);
  let label = result.response.candidates[0].content?.parts[0].text;

  if (!label) {
    console.log(result);
    throw new Error("Unexpected Vertext AI response");
  }

  return label.trim().toLowerCase();
}

export async function matchTextWithVertexAi(text, doWait = true) {
  if (doWait) await wait();
  const result = await match.sendMessage(text);
  return parseInt(result.response.candidates[0].content.parts[0].text.trim());
}

// const label = await labelTextWithVertexAi(
//   "#AltGov: the secret network of federal workers resisting Doge from the inside. Government employees fight the Trump administration’s chaos by organizing and publishing information on Bluesky"
// );

// console.log(label);
