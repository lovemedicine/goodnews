import fs from "fs";
import { parse } from "csv-parse/sync";
import { askGemini } from "./labelTexts.js";
import { prompts } from "./prompts.js";

function loadData(filename) {
  const text = fs.readFileSync(filename).toString();
  return parse(text, {
    columns: true,
  });
}

async function benchmarkPrompt(prompt, filename) {
  const results = [];
  const data = loadData(filename);

  for (let i = 0; i < data.length; i++) {
    console.log("-----------------------");
    console.log(`${i + 1}/${data.length}`);
    const { text, expectedLabel } = data[i];
    console.log("expected:", expectedLabel);
    const returnedLabel = await askGemini(prompt.create(text), prompt.model);
    const actualLabel = prompt.standardize(returnedLabel);
    console.log("actual:", actualLabel);
    results.push({ text, expectedLabel, actualLabel });
    console.log(expectedLabel === actualLabel ? "hit" : "miss");
    await new Promise((r) => setTimeout(r, 4000));
  }

  return results;
}

const version = process.argv[2] || "tuned";
const filename = process.argv[3] || "tuning/validation.csv";
const results = await benchmarkPrompt(prompts[version], filename);
const misses = results.filter(
  (result) => result.expectedLabel !== result.actualLabel
);
console.log(misses);
console.log(`missed ${misses.length}/${results.length} answers`);
