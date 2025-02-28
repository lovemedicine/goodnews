import { HfInference } from "@huggingface/inference";
import { hfToken } from "./config.js";
import { instructions } from "./prompts.js";

const client = new HfInference(hfToken);
const text =
  "GOP Moves to Impeach Judge Who Ruled Against Trump Health Data Purge. Congressional Republicans on Monday continued to attack federal judges who rule against the Trump administration, with Rep. Andy Ogles of Tennessee introducing articles of impeachment against U.S. District Judge John Bates in Washington, D.C.";

function buildPrompt(text) {
  return `${instructions}\n\nProvided text: ${text}\nClassification: `;
}

function omitThinking(answer) {
  const lines = answer.split("\n");
  return lines[lines.length - 1];
}

export async function labelTextWithDeepSeek(text) {
  const chatCompletion = await client.conversation({
    model: "deepseek-ai/DeepSeek-R1",
    messages: [
      {
        role: "user",
        content: buildPrompt(text),
      },
    ],
    provider: "together",
    max_tokens: 50,
  });

  return omitThinking(chatCompletion.choices[0].message.content);
}
