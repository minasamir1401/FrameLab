import { Client } from "@gradio/client";

async function inspect() {
  try {
    const client = await Client.connect("selfit-camera/Omni-Image-Editor");
    console.log("ALL COMPONENTS:");
    Object.entries(client.config.components).forEach(([id, comp]) => {
      console.log(`ID ${id}: Type=${comp.type}, Label=${comp.props?.label || 'none'}`);
    });
    
    console.log("\nDEPENDENCIES:");
    client.config.dependencies.forEach((dep, i) => {
        console.log(`[${i}] API: ${dep.api_name || 'internal'}`);
        console.log(`   Inputs: ${dep.inputs.join(", ")}`);
        console.log(`   Outputs: ${dep.outputs.join(", ")}`);
    });
  } catch (err) {
    console.error(err);
  }
}
inspect();
