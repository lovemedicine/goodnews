import ollama from "ollama";
import { destandardizeLabel } from "./labels.js";
import { loadTuningExamples } from "./tuning.js";

function multiShotPrompt(text, max = null) {
  const examples = loadTuningExamples();
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

// const model = "classifier-3.1";
const model = "classifier-deepseek-r1:1.5b";

export async function labelTextWithOllama(text, multiShot = false) {
  const prompt = multiShot ? multiShotPrompt(text, multiShot) : text;
  const response = await ollama.generate({
    model,
    stream: false,
    prompt,
  });
  return response.response;
}
