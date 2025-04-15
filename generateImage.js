import crypto from "crypto";
import { generateImage } from "./images.js";

const prompt = process.argv[2];
const hash = crypto.randomBytes(16).toString("hex").slice(0, 8);

await generateImage(prompt, null, `./tmp/test-image-${hash}.jpg`);
