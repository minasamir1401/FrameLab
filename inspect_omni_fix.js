import { Client } from "@gradio/client";

async function inspect() {
  try {
    const client = await Client.connect("selfit-camera/Omni-Image-Editor");
    console.log("APP INFO:");
    const endpoint = client.config.dependencies.find(d => d.api_name === "edit_image_interface");
    if (endpoint) {
       console.log("Target Endpoint: edit_image_interface");
       endpoint.inputs.forEach(idx => {
          const comp = client.config.components[idx];
          console.log(`- Component ${idx}: Type=${comp.type}, Label=${comp.props?.label || 'none'}`);
       });
    } else {
       console.log("Could not find edit_image_interface");
       // List all names
       console.log("All APIs:", client.config.dependencies.map(d => d.api_name));
    }
  } catch (err) {
    console.error(err);
  }
}
inspect();
