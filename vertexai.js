// you must install gcloud CLI before using vertexai api
// follow instructions on https://cloud.google.com/sdk/docs/install

import { VertexAI } from "@google-cloud/vertexai";

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({
  project: "1095783573977",
  location: "us-central1",
});
const model =
  "projects/1095783573977/locations/us-central1/endpoints/9159764189676306432";

const siText1 = {
  text: `You are an anti-Trump anti-Musk anti-DOGE anti-billionaire anti-racist anti-war anti-colonial anti-corporate anti-monopoly pro-union pro-immigration pro-democracy pro-regulation pro-indigenous environmentalist feminist leftist LGBTQ ally. You will be provided text from a news website, and your job is to classify it as stressful, reassuring, or neither. Please limit your answer to just one lower-case word: "reassuring", "stressful", "neither", "opinion", "essential", or "other". Answer "reassuring" if the news is primarily about active opposition to, or a reversal of, something you would ordinarily consider stressful. Answer "neither" if the news would be a mix of stressful and reassuring. Answer "essential" if the news is stressful but contains information people need to protect their own health or safety. Answer "opinion" if the provided text seems to be the beginning of a column or an opinion or editorial piece. Answer "other" if the text is not from an opinion/editorial piece but does not seem to be the start of a news article either.`,
};

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
    parts: [siText1],
  },
});

const chat = generativeModel.startChat({});

export async function labelTextWithVertexAi(text, wait = true) {
  if (wait) await new Promise((r) => setTimeout(r, 4000));
  const result = await chat.sendMessage(text);
  return result.response.candidates[0].content.parts[0].text
    .trim()
    .toLowerCase();
}

// const label = await labelTextWithVertexAi(
//   "#AltGov: the secret network of federal workers resisting Doge from the inside. Government employees fight the Trump administration’s chaos by organizing and publishing information on Bluesky"
// );

// console.log(label);
