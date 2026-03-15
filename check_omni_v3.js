import { Client } from "@gradio/client";

async function checkOmni() {
  try {
    const client = await Client.connect("selfit-camera/Omni-Image-Editor");
    console.log("--- API Info ---");
    // Some versions use client.config.endpoints, others use different structures.
    // Let's print the whole keys and try to find where endpoints are.
    if (client.config && client.config.endpoints) {
       Object.entries(client.config.endpoints).forEach(([key, val]) => {
           console.log(`Endpoint: ${key}`);
           if (val.parameters) {
               console.log(`Params: ${val.parameters.map(p => p.label).join(", ")}`);
           }
       });
    } else {
       console.log("Structure is different. Printing client.config keys:");
       console.log(Object.keys(client.config));
    }
  } catch (err) {
    console.error("Failed to connect:", err.message);
  }
}

checkOmni();
