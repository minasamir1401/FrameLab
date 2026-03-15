import { Client } from "@gradio/client";

async function testModels() {
  const models = [
    "selfit-camera/Omni-Image-Editor",
    "prithivMLmods/Kontext-Watermark-Remover"
  ];

  for (const model of models) {
    try {
      console.log(`Testing ${model}...`);
      const client = await Client.connect(model);
      console.log(`✅ ${model} is ONLINE`);
    } catch (err) {
      console.error(`❌ ${model} failed:`, err.message);
    }
  }
}

testModels();
