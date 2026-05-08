import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_IMAGE_MODEL ?? "gemini-3.1-flash-image-preview";
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey ?? "")}`;
const referencePath = path.join("src", "assets", "vip-2026", "07_cabane_DMpc_1.jpg");
const outputDir = path.join("src", "assets", "vip-2026");

const jobs = [
  {
    name: "before",
    prompt:
      "Aerial drone photo of VIP Coco Beach private beach in Ghar El Melh Tunisia at 7am, empty wooden walkway leading to thatched beach umbrellas, all umbrellas closed, no people, calm turquoise water, soft golden morning light, photorealistic, ultra detailed, 16:9 aspect ratio, 2048x1152",
    output: path.join(outputDir, "nano-before.webp"),
  },
  {
    name: "after",
    prompt:
      "Exact same aerial camera angle and composition as reference, VIP Coco Beach now at noon fully operational, thatched umbrellas open, colorful beach loungers with people relaxing, wooden cabanas, a jet ski approaching in the distance, vibrant turquoise water, bright sunlight, lively atmosphere, photorealistic, ultra detailed, 16:9, 2048x1152",
    output: path.join(outputDir, "nano-after.webp"),
  },
];

function getImageData(responseJson) {
  for (const candidate of responseJson.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      const inlineData = part.inlineData ?? part.inline_data;
      if (inlineData?.data) return inlineData.data;
    }
  }
  return undefined;
}

async function generateImage(referenceBase64, job) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: job.prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: referenceBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE"],
      },
    }),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(
      `Gemini request failed for ${job.name}: ${response.status} ${json.error?.message ?? response.statusText}`,
    );
  }

  const imageData = getImageData(json);
  if (!imageData) {
    throw new Error(`Gemini response did not include image data for ${job.name}.`);
  }

  await sharp(Buffer.from(imageData, "base64"))
    .resize(2048, 1152, { fit: "cover" })
    .webp({ quality: 88 })
    .toFile(job.output);

  console.log(`Generated ${job.output}`);
}

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is required.");
}

await mkdir(outputDir, { recursive: true });
const referenceBase64 = (await readFile(referencePath)).toString("base64");
for (const job of jobs) {
  await generateImage(referenceBase64, job);
}
