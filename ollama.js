import ollama from "ollama";
import { destandardizeLabel, getExamplesForPrompt } from "./prompts.js";

function multiShotPrompt(text, max = null) {
  const examples = getExamplesForPrompt();
  const prompt = examples
    .slice(0, max || examples.length)
    .map(
      ({ text, expectedLabel }) =>
        `Provided text: ${text}\nClassification: ${destandardizeLabel(
          expectedLabel
        )}`
    )
    .join("\n\n");
  return prompt + `\n\nProvided text: ${text}\nClassification: `;
}

export async function labelTextWithOllama(text, multiShot = false) {
  const prompt = multiShot ? multiShotPrompt(text, multiShot) : text;
  const response = await ollama.generate({
    model: "classifier-3.1",
    stream: false,
    prompt,
    options: {
      temperature: 0,
    },
  });
  return response.response;
}
