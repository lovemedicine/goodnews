import fs from "fs";
import { instructions } from "./prompts.js";
import { destandardizeLabel } from "./labels.js";
import { loadTuningExamples } from "./tuning.js";

function convertExamplesToJsonl(baseName = "tuning") {
  const examples = loadTuningExamples(baseName + ".csv");
  return examples
    .map(({ text, expectedLabel }) => {
      return JSON.stringify({
        systemInstruction: {
          role: "system",
          parts: [{ text: instructions }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text }],
          },
          {
            role: "model",
            parts: [{ text: destandardizeLabel(expectedLabel) }],
          },
        ],
      });
    })
    .join("\n");
}

["tuning", "validation"].forEach((baseName) => {
  fs.writeFileSync(
    `tuning/${baseName}.jsonl`,
    convertExamplesToJsonl(baseName)
  );
});
