import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Loader2, Download, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';
import { Client } from '@gradio/client';
import { saveToStudio } from '../services/storageService';
import { translateToEnglish, animateImageSilicon, HF_TOKENS as TOKENS } from '../services/imageService';

// الموديلات المتاحة لتحريك الصور
const ANIMATE_MODELS = [
  {
    id: "wan2.1",
    name: "Wan 2.1 Animation 💎",
    desc: "أقوى تقنية تحريك صور عالمياً",
    color: "from-amber-500/20 to-orange-600/20",
    badge: "🔥 احترافي",
  },
  {
    id: "omni",
    spaceId: "FrameAI4687/Omni-Video-Factory",
    name: "Omni Animate",
    desc: "تحريك واقعي مجاني",
    color: "from-violet-500/20 to-purple-500/20",
    badge: "⭐ جيد",
  },
  {
    id: "nsfw",
    spaceId: "Heartsync/NSFW-Uncensored-video2",
    name: "Cinematic Animate",
    desc: "خيال سينمائي",
    color: "from-rose-500/20 to-pink-500/20",
    badge: "🎬 سينما",
  },
];

const Animate = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("wan2.1");
  const [loading, setLoading] = useState(false);
  const [resultVideo, setResultVideo] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const fileInputRef = useRef(null);


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("حجم الصورة كبير جداً. الحد الأقصى هو 5 ميجابايت.");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!imageFile) return;

    setLoading(true);
    setError(null);
    setResultVideo(null);
    setStatus("جاري معالجة الصورة وترجمة الوصف...");
    
    try {
      let finalPrompt = "The subject in the image starts to move naturally, cinematic, hyperrealistic, high quality motion";
      if (prompt.trim()) {
        setStatus("جاري ترجمة وصف الحركة...");
        const isArabic = /[\u0600-\u06FF]/.test(prompt);
        finalPrompt = isArabic ? await translateToEnglish(prompt) : prompt;
      }

      setStatus("جاري الاتصال بقوة LTX-Video...");

      let success = false;
      let lastError = null;
      let app = null;

      if (selectedModel === "wan2.1") {
        setStatus("جاري تحليل الصورة وبدء التحريك عبر SiliconFlow...");
        // Convert file to Base64 for SF API
        const base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(imageFile);
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
        });
        const videoUrl = await animateImageSilicon(base64Image, prompt);
        setResultVideo(videoUrl);
        success = true;
      } else {
        // ترتيب الموديلات: المختار أولاً ثم الباقي
        const modelConf = ANIMATE_MODELS.find(m => m.id === selectedModel) || ANIMATE_MODELS[0];
        const spaces = [{ id: modelConf.spaceId, type: selectedModel }];
        ANIMATE_MODELS.filter(m => m.id !== selectedModel && m.spaceId).forEach(m => spaces.push({ id: m.spaceId, type: m.id }));

        for (const space of spaces) {
          if (success) break;
          
          for (const token of TOKENS) {
            try {
              const spaceName = space.id.split('/')[1];
              setStatus(`اتصال بـ ${spaceName}...`);
              
              app = await Client.connect(space.id, { hf_token: token });
              
              setStatus(`جاري تحريك الصورة في ${spaceName}... قد يستغرق دقيقة.`);
              
              if (space.type === "omni") {
                result = await app.predict("/_submit_i2v_manual", [
                  1, 5, 512, imageFile, finalPrompt, finalPrompt, "", "", ""
                ]);
                if (result?.data?.[1]?.url) {
                  setResultVideo(result.data[1].url);
                  success = true;
                  break;
                }
              } else if (space.type === "nsfw") {
                result = await app.predict("/generate_video", [
                  imageFile, finalPrompt, 25, "low quality, blurry, static, watermark", 3, 7.5, 0.0, Math.floor(Math.random() * 1000000), true
                ]);
                if (result?.data?.[0]?.url) {
                  setResultVideo(result.data[0].url);
                  success = true;
                  break;
                }
              }

              if (!success) continue;
            } catch (err) {
              console.error(`Space ${space.id} failed:`, err.message);
              lastError = err;
              continue;
            }
          }
        }
      }

      if (!success) {
        throw lastError || new Error("جميع خوادم التحريك مشغولة حالياً.");
      }

      if (success && resultVideo) {
        await saveToStudio({ url: resultVideo, prompt: prompt || "تحريك صورة", model: 'FrameLab I2V' });
      } else if (!success) {
        throw new Error("فشل توليد التحريك، يرجى محاولة رفع صورة أخرى.");
      }

    } catch (err) {
      console.error(err);
      if (err.message && err.message.toLowerCase().includes("quota")) {
        setError("لقد استنفذ FrameLab حد التحريك المجاني حالياً. نعتذر منك، يرجى المحاولة بعد ساعة.");
      } else {
        setError("حدث خطأ أثناء محاولة تحريك الصورة. قد تكون الصورة غير مدعومة أو الخادم مضغوط.");
      }
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-500/5 via-background to-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black mb-4 uppercase tracking-[0.2em]"
          >
            <SparklesIcon size={14} />
            <span>AI IMAGE ANIMATOR</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 mb-6"
          >
            بث الحياة في الصور
          </motion.h1>
          <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed text-right md:text-center">
            اجعل صورك الثابتة تتحرك بواقعية مذهلة. ارفع صورتك الآن ودع <strong>FrameLab</strong> يستخدم محركات Wan2.1 و LTX لإضافة سحر الحركة.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="glass-card p-6 border-purple-500/10 shadow-purple-500/5 shadow-2xl">
              <form onSubmit={handleGenerate} className="space-y-6">
                <div 
                  className="border-2 border-dashed border-white/10 rounded-3xl p-8 text-center hover:border-purple-500/50 transition-all cursor-pointer relative overflow-hidden group bg-stone-900/20"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                  />
                  
                  {imagePreview ? (
                    <div className="absolute inset-0 z-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-stone-900/90 backdrop-blur-md px-5 py-2 rounded-2xl text-white text-sm font-bold shadow-2xl border border-white/10">تغيير الصورة</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-muted z-10 relative">
                      <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:rotate-6 transition-all duration-500">
                        <UploadIcon className="w-10 h-10 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold mb-1">اضغط لرفع صورة</p>
                        <p className="text-[10px] opacity-50 uppercase tracking-widest">JPG, PNG up to 5MB</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-white font-bold mb-3 text-xs uppercase tracking-widest opacity-60">وصف الحركة (اختياري)</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="كيف تريد أن تتحرك؟ (مثال: الابتسام، تطاير الشعر، حركة سينمائية...)"
                    className="w-full bg-stone-900/50 border border-white/10 rounded-2xl p-4 text-white placeholder:text-stone-600 focus:outline-none focus:border-purple-500 transition-all h-28 resize-none text-right shadow-inner"
                  />
                </div>

                {/* Model Selector */}
                <div>
                  <label className="block text-white font-bold mb-3 text-xs uppercase tracking-wide opacity-60 text-right">موديل التحريك</label>
                  <div className="grid grid-cols-1 gap-2">
                    {ANIMATE_MODELS.map(model => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => setSelectedModel(model.id)}
                        className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all border bg-gradient-to-r ${model.color} ${
                          selectedModel === model.id
                            ? 'border-primary shadow-lg shadow-primary/20 text-white'
                            : 'border-white/10 text-muted hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <span className="text-[10px] opacity-70">{model.badge}</span>
                        <div className="text-right">
                          <div className="font-bold">{model.name}</div>
                          <div className="text-[10px] opacity-60 font-normal">{model.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>


                <button
                  type="submit"
                  disabled={loading || !imageFile}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:scale-[1.02] active:scale-[0.98] text-white font-black rounded-2xl flex items-center justify-center gap-3 py-4 transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-xl shadow-purple-500/20"
                >
                  {loading ? (
                    <>
                      <LoaderIcon className="w-5 h-5 animate-spin" />
                      <span>جاري المعالجة...</span>
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-5 h-5 fill-current" />
                      <span>تحريك الصورة الآن</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="glass-card p-5 bg-stone-900/20 border-white/5 text-right">
              <h3 className="text-white font-bold mb-3 text-xs flex items-center justify-end gap-2 uppercase tracking-tighter">
                دليل التحريك السريع
                <SparklesIcon size={14} className="text-purple-400" />
              </h3>
              <ul className="text-xs text-muted/80 space-y-3 leading-relaxed">
                <li className="flex gap-2 justify-end"><span>الصور ذات الوجه الواضح تعمل بشكل أفضل</span> <span>•</span></li>
                <li className="flex gap-2 justify-end"><span>وصفك للحركة يساعد الذكاء الاصطناعي على فهم النتيجة المطلوبة</span> <span>•</span></li>
                <li className="flex gap-2 justify-end"><span>تحلى بالصبر، قد يستغرق التوليد حتى دقيقتين</span> <span>•</span></li>
              </ul>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8"
          >
            <div className="glass-card p-4 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden group shadow-purple-500/5 shadow-2xl border-white/5">
              {loading ? (
                <div className="flex flex-col items-center text-center space-y-6 z-10">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-purple-500/10 border-t-purple-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <SparklesIcon className="text-purple-400 w-8 h-8 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">لبس الصورة ثوب الحركة...</h3>
                    <p className="text-purple-400 animate-pulse font-bold tracking-wide">{status}</p>
                  </div>
                </div>
              ) : resultVideo ? (
                <div className="w-full animate-fade-in flex flex-col gap-4">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-stone-950 aspect-video flex items-center justify-center shadow-purple-500/10">
                    <video 
                      src={resultVideo} 
                      autoPlay 
                      loop 
                      controls
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <a 
                        href={resultVideo} 
                        download={`framelab-animated-${Date.now()}.mp4`}
                        target="_blank"
                        className="p-3 bg-stone-900/80 backdrop-blur-xl border border-white/10 text-white rounded-2xl hover:bg-purple-500 transition-all shadow-2xl group/btn"
                        title="تحميل المقطع"
                      >
                        <DownloadIcon className="w-5 h-5 group-hover/btn:-translate-y-1 transition-transform" />
                      </a>
                      <button 
                        onClick={() => handleGenerate()}
                        className="p-3 bg-stone-900/80 backdrop-blur-xl border border-white/10 text-white rounded-2xl hover:bg-purple-500 transition-all shadow-2xl group/btn"
                        title="إعادة المحاولة"
                      >
                        <RefreshIcon className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-700" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-4">
                    <span className="text-[10px] text-purple-400/60 font-black uppercase tracking-[0.3em]">Processing Complete</span>
                    <p className="text-[10px] text-muted/40 uppercase">Developed by FrameLab AI Studio</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center p-12 bg-red-500/5 border border-red-500/20 rounded-[2.5rem] max-w-md">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ImageIconLib className="text-red-500 w-10 h-10" />
                  </div>
                  <h4 className="text-white font-black mb-3 text-xl tracking-tight">واجهنا مشكلة في التحريك</h4>
                  <p className="text-red-400/80 text-sm leading-relaxed mb-8">{error}</p>
                  <button 
                    onClick={() => setError(null)}
                    className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-xs font-bold hover:bg-white/10 transition-all"
                  >
                    إعادة ضبط
                  </button>
                </div>
              ) : (
                <div className="text-center flex flex-col items-center max-w-sm transition-all group-hover:scale-[1.03] duration-700">
                  <div className="w-40 h-40 bg-purple-500/5 rounded-[3rem] flex items-center justify-center mb-10 border border-purple-500/10 group-hover:border-purple-500/30 transition-all duration-700 rotate-3 group-hover:rotate-0">
                    <ImageIconLib className="w-20 h-20 text-purple-500/20 group-hover:text-purple-500 transition-all duration-700" />
                  </div>
                  <p className="text-3xl font-black text-white mb-3 tracking-tighter">بث الحياة في صورتك</p>
                  <p className="text-muted text-sm leading-relaxed max-w-[280px]">ارفع صورة الآن وشاهد كيف يحولها FrameLab إلى مشهد سينمائي متحرك.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Animate;
