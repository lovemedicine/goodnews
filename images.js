import fs from "fs";
import { InferenceClient } from "@huggingface/inference";
import { hfToken } from "./config.js";

const client = new InferenceClient(hfToken);

export async function saveBlobAsImage(blob, filename) {
  const buffer = await blobToBuffer(blob);

  fs.writeFileSync(filename, buffer);
  console.log(`Image saved as ${filename}`);
}

function blobToBuffer(blob) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    blob
      .arrayBuffer()
      .then((arrayBuffer) => {
        const buffer = Buffer.from(arrayBuffer);
        resolve(buffer);
      })
      .catch(reject);
  });
}

function randomThemesList(num = 5) {
  let themes =
    "plants, flowers, ecology, gardens, animals, insects, microbiology, hands, faces, bodies, community, collaboration, dance, music, ocean, water, cloudscape, landscape, geology, seasons, architecture, invention, resilience, interdependence, surprise, nourishment, persistence, courage, peace, hope, creativity, harmony, revolution, liberation, freedom, magic, beauty, justice, cosmos, knowledge, wisdom, diversity, love, solidarity, nonlinearity, compassion, queerness, glitches, anomalies, leaves, waterfalls, rainbows, dragons, stars, nebula, tools, jungle, desert, mountains, mystery, permaculture, forest".split(
      ", "
    );
  num = Math.min(num, themes.length);
  const results = [];

  for (let i = 0; i < num; i++) {
    const index = Math.floor(Math.random() * themes.length);
    results.push(themes.splice(index, 1)[0]);
  }

  return results.join(", ");
}

export async function generateStockImage(headline, filename) {
  const artists = [
    "paul klee",
    "juan miro",
    "remedios varo",
    "frida khalo",
    "marcel duchamp",
    "max ernst",
    "georgia o'keeffe",
    "pablo picasso",
    "hilma af klint",
    "ernie barnes",
    "diego rivera",
    "r.c. gorman",
    "tarsila do amaral",
    "salvador dali",
    "giorgio de chirico",
    "jean giraud",
    "frank frazetta",
    "barney bubbles",
    "roger dean",
    "william blake",
    "leonardo da vinci",
  ];
  const artist = artists[Math.floor(Math.random() * artists.length)];
  console.log(artist);
  const themes = randomThemesList();
  console.log(themes);
  const prompt = [
    `An artwork by ${artist}, with an overall tone of hope and tranquility, soft colors, muted palette, rough edges, unfinished, work in progress, incorporating the following themes: ${themes}. No text should appear in the image.`,
    `${headline}, in the style of ${artist}, with an overall tone of hope and reassurance, with a muted and relaxing color palette, incorporating the following elements: ${themes}. No text should appear in the image.`,
    `Create a professional, high-quality, and artistic illustration to accompany a news article titled: ${headline}. The image should visually represent the essence of the topic in an engaging and thought-provoking way, using a mix of modern and classic artistic styles. The artwork should feel polished and suitable for a reputable news website, blending rich colors and intricate details. No text should appear in the image.`,
    `a pulitzer prize winning black and white photograph depicting the following news: ${headline}`,
    `${artist} artwork, not containing any text or letters, inspired by the following news: ${headline}`,
    `cover art for a high-brow magazine, not containing any text or letters, inspired by the following news: ${headline}`,
    `an extraordinary piece of contemporary artwork, not containing any text or letters, inspired by the following news: ${headline}`,
    `an illustration without any text or letters, rendered in the visual style of ${artist}, inspired by the following news: ${headline}`,
    `an uplifting mix of watercolor, pencil, and collage, with flowy composition, lots of soft color, very little white space, and a medium-brightness background inspired by the following news: ${headline}`,
  ][0];

  await generateImage(
    prompt,
    "silhouette, psychedelic, trippy, professional, glossy, clean, meticulous, high saturation, text, letters, newsprint, newspaper, white background, headline, front page",
    filename
  );
}

export async function generateImage(prompt, negativePrompt, filename) {
  const data = {
    inputs: prompt,
    parameters: {
      guidance_scale: 5,
      num_inference_steps: 75,
      negative_prompt: negativePrompt,
      width: 800,
      height: 496,
      seed: Math.floor(Math.random() * 1000),
    },
  };
  // const response = await fetch(
  //   // "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-dev",
  //   // "https://router.huggingface.co/hf-inference/models/stable-diffusion-v1-5/stable-diffusion-v1-5",
  //   // "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
  //   // "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-3.5-large",
  //   {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${hfToken}`,
  //       "Content-Type": "application/json",
  //       "x-use-cache": "false",
  //     },
  //     body: JSON.stringify(data),
  //   }
  // );
  // const blob = await response.blob();
  const blob = await client.textToImage({
    ...data,
    provider: "hf-inference",
    model: "stabilityai/stable-diffusion-3.5-large",
  });
  await saveBlobAsImage(blob, filename);
}
