import fs from "fs";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { promptForTunedModel, destandardize } from "./prompts.js";

const contents = fs.readFileSync("tuning/tuning.csv").toString();
const examples = parse(contents, {
  columns: true,
});

const convertedExamples = examples.map(({ text, expectedLabel }) => {
  return {
    text: promptForTunedModel(text),
    expectedLabel: destandardize(expectedLabel),
  };
});

const csv = stringify(convertedExamples, { header: true });
fs.writeFileSync("tuning/destandardized-tuning.csv", csv);
