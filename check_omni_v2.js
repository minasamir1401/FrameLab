import { Client } from "@gradio/client";

async function checkOmni() {
  try {
    const client = await Client.connect("selfit-camera/Omni-Image-Editor");
    console.log("--- Endpoints ---");
    client.config.endpoints.forEach(e => {
        console.log(`Endpoint: ${e.api_name || e.endpoint}`);
        console.log(`Parameters:`, e.parameters);
        console.log("------------------");
    });
  } catch (err) {
    console.error("Failed to connect:", err.message);
  }
}

checkOmni();
