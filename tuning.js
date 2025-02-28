import fs from "fs";
import { parse } from "csv-parse/sync";

export function loadTuningExamples(filename = "tuning.csv") {
  const contents = fs.readFileSync(`tuning/${filename}`).toString();
  return parse(contents, {
    columns: true,
  });
}
