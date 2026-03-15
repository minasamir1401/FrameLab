import { Client } from "@gradio/client";

async function checkOmni() {
  try {
    const client = await Client.connect("selfit-camera/Omni-Image-Editor");
    console.log("--- Dependencies (Endpoints) ---");
    if (client.config && client.config.dependencies) {
       client.config.dependencies.forEach((dep, index) => {
           console.log(`[${index}] API Name: ${dep.api_name}`);
           console.log(`Inputs:`, dep.inputs.map(i => client.config.components[i].type));
           console.log("------------------");
       });
    }
  } catch (err) {
    console.error("Failed to connect:", err.message);
  }
}

checkOmni();
