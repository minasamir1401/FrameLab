import axios from 'axios';
import { Client } from '@gradio/client';

// توكنات API فعّالة
export const HF_TOKENS = [
  import.meta.env.VITE_HF_TOKEN_1,
  import.meta.env.VITE_HF_TOKEN_2,
  import.meta.env.VITE_HF_TOKEN_3,
  import.meta.env.VITE_HF_TOKEN_4,
].filter(Boolean);

// توكن بريميوم جديد (SiliconFlow/PRO)
const PREMIUM_KEY = import.meta.env.VITE_SILICON_FLOW_KEY;
const SILICON_BASE = "https://api.siliconflow.cn/v1";

// Cloudflare Worker API (New Fast Engine)
const WORKER_API_URL = "https://image-api.mina15g4y.workers.dev";
const WORKER_TOKEN = "12345678";

// deAPI.ai (Fallback Engine)
const DEAPI_KEY = "7423|Z1ZDwENmLfaKAu1NPAWdeQzrjRzEUlgXpbVQXFsy1227c8ac";
const DEAPI_BASE = "https://api.deapi.ai/api/v1/client";

// ترتب التوكنات بحيث يتغير التوكن الأساسي تلقائياً كل ساعة
export const getHourlySortedTokens = () => {
  const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
  const startIndex = currentHour % HF_TOKENS.length;
  return [...HF_TOKENS.slice(startIndex), ...HF_TOKENS.slice(0, startIndex)];
};

export const getActiveToken = () => getHourlySortedTokens()[0];

/**
 * ترجمة النصوص العربية إلى الإنجليزية
 */
/**
 * Translate Arabic to English using Google Translate API (Legacy/Public endpoint)
 */
export async function translateToEnglish(text) {
  try {
    const isArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
    if (!isArabic) return text;

    console.log("Translating from Arabic to English:", text);
    const response = await axios.get(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`
    );

    // Join all translated segments
    const translatedText = response.data[0].map(s => s[0]).join("");
    console.log("Translated result:", translatedText);
    return translatedText;
  } catch (error) {
    console.warn("Translation failed, using original text:", error.message);
    return text;
  }
}

/**
 * توليد الصور باستخدام أسرع موديلات HF Inference API
 * Z-Image-Turbo مبني على SDXL-Turbo → نستخدم نفس النموذج عبر inference API
 */
export const generateImage = async (prompt, options = {}) => {
  // Always run through translation (it will return original if not Arabic)
  const finalPrompt = await translateToEnglish(prompt);

  const styleStr = options.style ? `${options.style} style, ` : "";
  const lightingStr = options.lighting ? `${options.lighting} lighting, ` : "";
  const colorStr = options.color ? `${options.color} color palette, ` : "";
  const compositionStr = options.composition ? `${options.composition} composition, ` : "";

  const baseEnhancedPrompt = `${finalPrompt}, ${styleStr}${lightingStr}${colorStr}${compositionStr}cinematic 8k, highly detailed, sharp focus, masterpiece`;

  const count = options.count || 1;

  const generateSingleImage = async (index) => {
    // Slight variation to prompt to avoid exact caching when requesting multiple
    const enhancedPrompt = count > 1 ? `${baseEnhancedPrompt} [v${index}-${Math.floor(Math.random() * 10000)}]` : baseEnhancedPrompt;
    const selectedModel = options.model || "pollinations/flux";

    // -- FLUX ♾️ (HuggingFace FLUX.1-schnell via Worker Proxy - لا CORS!) --
    if (selectedModel === "pollinations/flux") {
      try {
        console.log(`🚀 FLUX ♾️ → Worker → HuggingFace FLUX.1-schnell... (Image ${index+1})`);
        const response = await fetch(WORKER_API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${WORKER_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ prompt: enhancedPrompt })
        });

        if (response.ok) {
          const blob = await response.blob();
          if (blob.size > 1000) {
            console.log(`✅ FLUX.1-schnell via Worker Success! (Image ${index+1})`);
            return URL.createObjectURL(blob);
          }
        } else {
          const errText = await response.text();
          console.warn("Worker FLUX failed:", errText);
        }
      } catch (e) {
        console.warn("Worker FLUX error:", e.message);
      }

      // Fallback: Pollinations مباشرة (إذا فشل الـ Worker)
      const seed = Math.floor(Math.random() * 1000000000);
      console.log("⚠️ Falling back to Pollinations FLUX URL...");
      return `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${seed}&model=flux&nologo=true`;
    }

    // -- DALL-E 3 (Puter): يستخدم Puter SDK --
    if (selectedModel === "puter/dalle3") {
      try {
        console.log(`Generating via Puter DALL-E 3... (Image ${index+1})`);
        const imageElement = await window.puter.ai.txt2img(enhancedPrompt, {
          model: 'dall-e-3',
          testMode: false
        });
        if (imageElement && imageElement.src) return imageElement.src;
        throw new Error("No image returned from Puter");
      } catch (err) {
        console.warn(`Puter DALL-E 3 failed: ${err.message}. Falling back to Pollinations...`);
      }
    }

    // list of models that use Hugging Face Inference API
    const hfModels = [
      "stabilityai/stable-diffusion-xl-base-1.0",
      "black-forest-labs/FLUX.1-schnell",
      "ByteDance/SDXL-Lightning",
      "stabilityai/stable-diffusion-3-medium-diffusers"
    ];

    // -- Hugging Face Models with Universal Token Testing --
    if (hfModels.includes(selectedModel)) {
      const HF_ROUTER = "https://router.huggingface.co/hf-inference/models";
      const tokens = getHourlySortedTokens();

      for (const token of tokens) {
        try {
          console.log(`Testing token ${token.slice(0, 10)}... for ${selectedModel} (Image ${index+1})`);
          const response = await fetch(`${HF_ROUTER}/${selectedModel}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "x-wait-for-model": "true",
            },
            body: JSON.stringify({
              inputs: enhancedPrompt,
              parameters: {
                num_inference_steps: selectedModel.includes('Lightning') ? 4 : 30,
                guidance_scale: selectedModel.includes('Lightning') ? 1 : 7.5,
              }
            }),
          });

          if (response.ok) {
            const blob = await response.blob();
            if (blob.size > 1000) {
              console.log(`Success with token on ${selectedModel}! (Image ${index+1})`);
              return URL.createObjectURL(blob);
            }
          }
          console.warn(`Token ${token.slice(0, 10)} failed for ${selectedModel}: ${response.status}`);
        } catch (err) {
          console.warn(`Error testing token on ${selectedModel}: ${err.message}`);
        }
      }
      console.warn(`All tokens failed for ${selectedModel}. Falling back to Pollinations...`);
    }

    // -- Cloudflare Worker Models (5 نماذج) --
    const cfModels = {
      "cf/flux":        "flux",
      "cf/phoenix":       "phoenix",
      "cf/dreamshaper": "dreamshaper",
      "cf/sdxl":        "sdxl",
      "cf/lucid":       "lucid",
    };

    // إعدادات مخصصة لكل موديل لأفضل جودة
    const cfModelParams = {
      "cf/flux": {
        width: 1024, height: 1024, // FLUX بيشتغل أحسن على أحجام كبيرة 
        num_steps: 4,              // Schnell يحتاج 4 خطوات فقط
        guidance: 3.5,
      },
      "cf/phoenix": {
        width: 1024, height: 1024, // Phoenix 1.0 عبقري في التفاصيل الدقيقة والواقعية
        num_steps: 20,             // يحتاج 20 خطوة كاملة (مثل SDXL)
        guidance: 7.5,
      },
      "cf/dreamshaper": {
        width: 768, height: 768,   
        num_steps: 8,              // LCM Models لازم من 4 لـ 8 خطوات فقط! 20 بتعمل تشويش
        guidance: 1.5,             // 🔥 الأهم: موديلات LCM بتتشوه ألوانها لو guidance أكبر من 2!
      },
      "cf/sdxl": {
        width: 1024, height: 1024, 
        num_steps: 20,             
        guidance: 7.5,             
      },
      "cf/lucid": {
        width: 1024, height: 1024,
        num_steps: 20,
        guidance: 7.5,
      },
    };

    if (cfModels[selectedModel] !== undefined) {
      const params = cfModelParams[selectedModel] || { width: 512, height: 512, num_steps: 8, guidance: 7.5 };
      try {
        console.log(`🚀 Cloudflare Worker [${selectedModel}] steps:${params.num_steps}... (Image ${index+1})`);
        const response = await fetch(WORKER_API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${WORKER_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt:    enhancedPrompt,
            model:     cfModels[selectedModel],
            width:     params.width,
            height:    params.height,
            num_steps: params.num_steps,
            guidance:  params.guidance,
          })
        });

        if (response.ok) {
          const blob = await response.blob();
          if (blob.size > 1000) {
            console.log(`✅ Cloudflare [${selectedModel}] Success! size:${blob.size} (Image ${index+1})`);
            return URL.createObjectURL(blob);
          } else {
            console.warn(`Cloudflare returned tiny blob (${blob.size} bytes), retrying...`);
          }
        } else {
          const errorText = await response.text();
          console.warn(`Cloudflare Worker error ${response.status}: ${errorText}`);
        }
      } catch (err) {
        console.warn(`Cloudflare Worker exception: ${err.message}`);
      }
    }

    // -- Z-Image-Turbo (deAPI) --
    if (selectedModel === "runware/z-image-turbo") {
      try {
        console.log(`Generating via deAPI fallback... (Image ${index+1})`);
        const requestPayload = {
          prompt: enhancedPrompt,
          model: "ZImageTurbo_INT8",
          width: 1024,
          height: 1024,
          guidance: 3.5,
          steps: 4,
          seed: -1
        };

        const response = await fetch(`${DEAPI_BASE}/txt2img`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${DEAPI_KEY}`
          },
          body: JSON.stringify(requestPayload)
        });

        const startData = await response.json();
        const requestId = startData.data?.request_id;
        if (!requestId) throw new Error("No request_id returned from deAPI");

        let attempts = 0;
        while (attempts < 30) {
          const statusResponse = await fetch(`${DEAPI_BASE}/request-status/${requestId}`, {
            headers: { "Authorization": `Bearer ${DEAPI_KEY}` }
          });
          const statusData = await statusResponse.json();
          const job = statusData.data;

          if (job.status === "done") return job.result_url || job.result;
          if (job.status === "error") throw new Error(`deAPI job failed: ${job.error}`);

          attempts++;
          await new Promise(r => setTimeout(r, 2000));
        }
        throw new Error("deAPI timeout");
      } catch (err) {
        console.warn(`Z-Turbo Engine failed: ${err.message}. Falling back...`);
      }
    }

    // -- Pollinations.ai (Reliable Engine as Fallback or Default) --
    try {
      console.log(`Generating via Pollinations.ai engine fallback... (Image ${index+1})`);

      // Map standard model IDs to Pollinations engines
      let modelIdentifier = 'flux';
      if (selectedModel.includes('schnell') || selectedModel.includes('flux')) modelIdentifier = 'flux';
      if (selectedModel.includes('sd-xl') || selectedModel.includes('Lightning')) modelIdentifier = 'turbo';

      const width = 1024;
      const height = 1024;
      const seed = Math.floor(Math.random() * 1000000000);

      return `https://pollinations.ai/p/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&seed=${seed}&model=${modelIdentifier}&nologo=true&enhance=true`;
    } catch (err) {
      console.error("Critical error in image generation:", err);
      throw new Error("فشل توليد الصورة. نعتذر عن هذا العطل المؤقت.");
    }
  };

  const promises = Array.from({ length: count }).map((_, i) => generateSingleImage(i));
  const results = await Promise.allSettled(promises);
  
  const successfulUrls = results
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => r.value);
    
  if (successfulUrls.length === 0) {
    throw new Error("فشل توليد الصور. نعتذر عن هذا العطل المؤقت.");
  }
  
  return successfulUrls;
};




/**
 * SiliconFlow Video Generation (Wan 2.1)
 */
export const generateVideoSilicon = async (prompt, size = "1280x720") => {
  try {
    const finalPrompt = await translateToEnglish(prompt);

    console.log("Generating video via SiliconFlow...");

    const response = await fetch(`${SILICON_BASE}/video/submit`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PREMIUM_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "Wan-AI/Wan2.1-T2V-14B",
        prompt: finalPrompt,
        image_size: size
      })
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      console.error("SiliconFlow API Error:", response.status, errorMsg);
      throw new Error(`SiliconFlow API Error: ${response.status} - ${errorMsg}`);
    }

    const data = await response.json();
    const requestId = data.requestId;
    if (!requestId) throw new Error(data.message || "Failed to submit video task");

    // Polling
    console.log(`Polling SiliconFlow video: ${requestId}`);
    let attempts = 0;
    while (attempts < 60) {
      const statusResponse = await fetch(`${SILICON_BASE}/video/status`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${PREMIUM_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ requestId })
      });
      const statusData = await statusResponse.json();

      if (statusData.status === "Succeed") {
        return statusData.results.videos[0].url;
      } else if (statusData.status === "Failed") {
        throw new Error(statusData.reason || "Video generation failed");
      }

      attempts++;
      await new Promise(r => setTimeout(r, 5000)); // Poll every 5 seconds
    }
    throw new Error("Video generation timed out");
  } catch (err) {
    console.error("SiliconFlow Video Error:", err);
    throw err;
  }
};

/**
 * SiliconFlow Image-to-Video (Wan 2.1)
 */
export const animateImageSilicon = async (imageSource, prompt) => {
  try {
    const translatedPrompt = await translateToEnglish(prompt || "smooth motion, high quality");
    const enhancedPrompt = `${translatedPrompt}, high-end cinematography, award-winning photography, hyper-realistic, highly detailed, 8k, raw photo, sharp focus, volumetric lighting, masterpiece, realistic skin texture`;

    // Add negative style keywords if needed for the model (some APIs support this in the prompt)
    const finalPrompt = enhancedPrompt + " --no cartoon, anime, drawing, painting, illustration, low quality, blurry";

    console.log("Generating with enhanced prompt:", finalPrompt);

    // imageSource can be URL or Base64
    const response = await fetch(`${SILICON_BASE}/video/submit`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PREMIUM_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "Wan-AI/Wan2.1-I2V-14B-720P",
        prompt: finalPrompt,
        image: imageSource
      })
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      console.error("SiliconFlow Animate Error:", response.status, errorMsg);
      throw new Error(`SiliconFlow Animate Error: ${response.status} - ${errorMsg}`);
    }

    const data = await response.json();
    const requestId = data.requestId;
    if (!requestId) throw new Error(data.message || "Failed to submit animation task");

    // Polling
    let attempts = 0;
    while (attempts < 60) {
      const statusResponse = await fetch(`${SILICON_BASE}/video/status`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${PREMIUM_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ requestId })
      });
      const statusData = await statusResponse.json();

      if (statusData.status === "Succeed") {
        return statusData.results.videos[0].url;
      } else if (statusData.status === "Failed") {
        throw new Error(statusData.reason || "Animation failed");
      }

      attempts++;
      await new Promise(r => setTimeout(r, 5000));
    }
    throw new Error("Animation timed out");
  } catch (err) {
    console.error("SiliconFlow Animate Error:", err);
    throw err;
  }
};

/**
 * Text-to-Video generation (Legacy/Fallback)
 */
export const generateVideo = async (prompt) => {
  try {
    return await generateVideoSilicon(prompt);
  } catch (err) {
    console.warn("SiliconFlow Video failed, falling back to HF Space...");
    const isArabic = /[\u0600-\u06FF]/.test(prompt);
    const finalPrompt = isArabic ? await translateToEnglish(prompt) : prompt;

    const HF_ROUTER = "https://router.huggingface.co/hf-inference/models";
    const response = await fetch(`${HF_ROUTER}/cerspense/zeroscope_v2_576w`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getActiveToken()}`,
        "Content-Type": "application/json",
        "x-wait-for-model": "true",
      },
      body: JSON.stringify({ inputs: finalPrompt }),
    });
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
};

/**
 * Image-to-Video animation (Legacy/Fallback)
 */
export const animateImage = async (imageFile, prompt, duration) => {
  try {
    // Convert file to base64 for SiliconFlow if needed, or handle differently
    // For now, if it's a file, we wrap it
    const base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

    return await animateImageSilicon(base64Image, prompt);
  } catch (err) {
    console.warn("SiliconFlow Animate failed, falling back to HF Space...");
    const isArabic = /[\u0600-\u06FF]/.test(prompt);
    const finalPrompt = (isArabic && prompt.trim()) ? await translateToEnglish(prompt) : prompt;

    const base64Raw = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
    });

    const HF_ROUTER = "https://router.huggingface.co/hf-inference/models";
    const response = await fetch(`${HF_ROUTER}/r3gm/wan2-2-fp8da-aoti-preview`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getActiveToken()}`,
        "Content-Type": "application/json",
        "x-wait-for-model": "true",
      },
      body: JSON.stringify({
        inputs: { image: base64Raw, prompt: finalPrompt || "smooth motion, cinematic" },
        parameters: { duration: parseInt(duration) || 5 }
      }),
    });
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
};
