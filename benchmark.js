import fs from "fs";
import { parse } from "csv-parse/sync";
import { prompts as geminiPrompts, labelTextWithGemini } from "./gemini.js";
import { labelTextWithOllama } from "./ollama.js";

function loadData(filename) {
  const text = fs.readFileSync(filename).toString();
  return parse(text, {
    columns: true,
  });
}

async function benchmarkGemini(promptName, filename) {
  const results = [];
  const data = loadData(filename);

  for (let i = 0; i < data.length; i++) {
    console.log("-----------------------");
    console.log(`${i + 1}/${data.length}`);
    const { text, expectedLabel } = data[i];
    console.log("expected:", expectedLabel);
    const actualLabel = await labelTextWithGemini(text, promptName, true);
    console.log("actual:", actualLabel);
    results.push({ text, expectedLabel, actualLabel });
    console.log(expectedLabel === actualLabel ? "hit" : "miss");
    await new Promise((r) => setTimeout(r, 4000));
  }

  return results;
}

async function benchmarkOllama(promptName, filename) {
  const results = [];
  const data = loadData(filename);

  for (let i = 0; i < data.length; i++) {
    console.log("-----------------------");
    console.log(`${i + 1}/${data.length}`);
    const { text, expectedLabel } = data[i];
    console.log("expected:", expectedLabel);
    const returnedLabel = await labelTextWithOllama(text);
    const actualLabel = geminiPrompts[promptName].standardize(returnedLabel);
    console.log("actual:", actualLabel);
    results.push({ text, expectedLabel, actualLabel });
    console.log(expectedLabel === actualLabel ? "hit" : "miss");
  }

  return results;
}

const version = process.argv[2] || "structured";
const filename = process.argv[3] || "tuning/validation.csv";
const results = await benchmarkGemini(version, filename);
// const results = await benchmarkOllama(prompts[version], filename);
const misses = results.filter(
  (result) => result.expectedLabel !== result.actualLabel
);
console.log(misses);
console.log(`missed ${misses.length}/${results.length} answers`);
