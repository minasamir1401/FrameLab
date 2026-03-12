import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video as VideoIcon, Sparkles, Loader2, Download, RefreshCw } from 'lucide-react';
import { Client } from '@gradio/client';
import { saveToStudio } from '../services/storageService';
import { translateToEnglish, generateVideoSilicon, HF_TOKENS as TOKENS } from '../services/imageService';

// الموديلات المتاحة لتوليد الفيديو
const VIDEO_MODELS = [
  {
    id: "wan2.1",
    name: "Wan 2.1 Premium 💎",
    desc: "أحدث التقنيات العالمية - جودة سينمائية 1080p",
    color: "from-amber-500/20 to-orange-600/20",
    badge: "🔥 الأحدث",
  },
  {
    id: "omni",
    spaceId: "FrameAI4687/Omni-Video-Factory",
    name: "Omni Video",
    desc: "جودة عالية مجانية",
    color: "from-violet-500/20 to-purple-500/20",
    badge: "⭐ جيد",
  },
  {
    id: "nsfw",
    spaceId: "Heartsync/NSFW-Uncensored-video2",
    name: "Cinematic AI",
    desc: "تفاصيل سينمائية",
    color: "from-rose-500/20 to-pink-500/20",
    badge: "🎬 سينما",
  },
];

const VideoGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(5);
  const [selectedModel, setSelectedModel] = useState("wan2.1");
  const [loading, setLoading] = useState(false);
  const [resultVideo, setResultVideo] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResultVideo(null);
    setStatus("جاري تحضير الخادم وترجمة الوصف...");

    try {
      const isArabic = /[\u0600-\u06FF]/.test(prompt);
      const finalPrompt = isArabic ? await translateToEnglish(prompt) : prompt;

      setStatus("جاري تحضير الخادم...");

      let success = false;
      let lastError = null;
      let app = null;
      let result = null;

      if (selectedModel === "wan2.1") {
        setStatus("جاري توليد فيديو سينمائي عبر سيرفرات SiliconFlow...");
        const videoUrl = await generateVideoSilicon(prompt, "1280x720");
        setResultVideo(videoUrl);
        success = true;
      } else {
        // استخدم الموديل المختار من HF Spaces
        const modelConf = VIDEO_MODELS.find(m => m.id === selectedModel) || VIDEO_MODELS[0];
        const spaces = [{ id: modelConf.spaceId, type: selectedModel }];
        // إضافة fallback تلقائي
        VIDEO_MODELS.filter(m => m.id !== selectedModel && m.spaceId).forEach(m => spaces.push({ id: m.spaceId, type: m.id }));

        for (const space of spaces) {
          if (success) break;
          
          for (const token of TOKENS) {
            try {
              const spaceName = space.id.split('/')[1];
              setStatus(`اتصال بـ ${spaceName}...`);
              
              app = await Client.connect(space.id, { hf_token: token });

              setStatus(`جاري إنتاج فيديو في ${spaceName}... قد يستغرق دقيقة.`);
              
              if (space.type === "omni") {
                result = await app.predict("/_submit_t2v_manual", [
                  1, 5, 512, "16:9", finalPrompt, finalPrompt, "", "", ""
                ]);
                if (result?.data?.[1]?.url) {
                  setResultVideo(result.data[1].url);
                  success = true;
                  break;
                }
              } else if (space.type === "nsfw") {
                result = await app.predict("/generate_video", [
                  null, finalPrompt, 25, "low quality, blurry, watermark", duration, 7.5, 0.0, Math.floor(Math.random() * 1000000), true
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
        throw lastError || new Error("جميع السيرفرات المجانية مشغولة حالياً.");
      }

      // Save to studio if success
      if (success && resultVideo) {
        await saveToStudio({ url: resultVideo, prompt: prompt, model: `FrameLab AI (${duration}s)` });
      } else if (!success) {
        throw new Error("لم نتمكن من الحصول على ملف الفيديو، يرجى إعادة المحاولة.");
      }

    } catch (err) {
      console.error(err);
      if (err.message && err.message.toLowerCase().includes("quota")) {
        setError("لقد وصل FrameLab للحد الأقصى المسموح به من جوجل و HuggingFace حالياً. نعتذر جداً، يرجى المحاولة بعد ساعة.");
      } else {
        setError("حدث خطأ تقني في الاتصال بالسيرفر. يرجى تجربة وصف أبسط أو المحاولة لاحقاً.");
      }
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4 uppercase tracking-wider"
          >
            <Sparkles size={14} />
            <span>الجيل الأحدث LTX-Video & Wan2.1</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary via-orange-400 to-amber-200 mb-6"
          >
            الإنتاج السينمائي الاحترافي
          </motion.h1>
          <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed text-right md:text-center">
            حوّل أفكارك الخيالية إلى فيديوهات واقعية بدقة عالية. 
            يستخدم <strong>FrameLab</strong> الآن أقوى نماذج الذكاء الاصطناعي (Wan2.1 & LTX) لضمان أفضل نتيجة ممكنة.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="glass-card p-6 border-primary/10">
              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label className="block text-white font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wide opacity-80 justify-end">
                    ماذا تريد أن ترى؟
                    <VideoIcon size={18} className="text-primary" />
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="مثال: رائد فضاء يرقص على سطح القمر مع أضواء ديسكو ملونة..."
                    className="w-full bg-stone-900/50 border border-white/10 rounded-2xl p-4 text-white placeholder:text-stone-600 focus:outline-none focus:border-primary transition-all h-40 resize-none text-right shadow-inner"
                    required
                  />
                </div>

                {/* Model Selector */}
                <div>
                  <label className="block text-white font-bold mb-3 text-xs uppercase tracking-wide opacity-60 text-right">اختر موديل التوليد</label>
                  <div className="grid grid-cols-1 gap-2">
                    {VIDEO_MODELS.map(model => (
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

                {/* Duration Selector */}
                <div>
                  <label className="block text-white font-bold mb-3 text-xs uppercase tracking-wide opacity-60 text-right">تخصيص المدة</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 5, 8].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${duration === d ? 'bg-primary border-primary text-black shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 text-muted hover:border-white/20'}`}
                      >
                        {d} ثواني
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="w-full primary-button flex items-center justify-center gap-3 py-4 rounded-2xl group overflow-hidden"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-bold">جاري الصنع...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      <span className="font-bold text-lg">إنتاج الفيديو</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="glass-card p-5 bg-stone-900/30 border-white/5 text-right">
              <h3 className="text-white font-bold mb-3 text-sm flex items-center justify-end gap-2">
                نصائح لنتائج احترافية
                <Sparkles size={14} className="text-primary" />
              </h3>
              <ul className="text-xs text-muted space-y-2 leading-relaxed">
                <li className="flex gap-2 justify-end"><span>استخدم لغة قوية تصف الحركة (مثلاً: يركض، يطير، ينفجر)</span> <span>•</span></li>
                <li className="flex gap-2 justify-end"><span>حدد زاوية الكاميرا (مثلاً: زاوية سينمائية، لقطة قريبة)</span> <span>•</span></li>
                <li className="flex gap-2 justify-end"><span>كن صبوراً، عملية التوليد تتطلب وقت لمعالجة كل لقطة</span> <span>•</span></li>
              </ul>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8"
          >
            <div className="glass-card p-4 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden group">
              {loading ? (
                <div className="flex flex-col items-center text-center space-y-6 z-10">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <VideoIcon className="text-primary/40 w-8 h-8 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">جاري المعالجة...</h3>
                    <p className="text-primary animate-pulse font-medium">{status}</p>
                  </div>
                </div>
              ) : resultVideo ? (
                <div className="w-full animate-fade-in flex flex-col gap-4">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-stone-950 aspect-video flex items-center justify-center shadow-primary/5">
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
                        download={`framelab-video-${Date.now()}.mp4`}
                        target="_blank"
                        className="p-3 bg-stone-900/80 backdrop-blur-xl border border-white/10 text-white rounded-xl hover:bg-primary hover:text-black transition-all shadow-xl group/btn"
                        title="تحميل بجودة عالية"
                      >
                        <Download className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      </a>
                      <button 
                        onClick={() => handleGenerate()}
                        className="p-3 bg-stone-900/80 backdrop-blur-xl border border-white/10 text-white rounded-xl hover:bg-primary hover:text-black transition-all shadow-xl group/btn"
                        title="توليد مرة أخرى"
                      >
                        <RefreshCw className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-500" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                      <span className="text-xs text-muted font-bold uppercase tracking-widest">مكتمل بجودة HD</span>
                    </div>
                    <p className="text-xs text-muted/60">تم التوليد بواسطة FrameLab AI</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center p-10 bg-red-500/5 border border-red-500/20 rounded-3xl max-w-md mx-auto">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="text-red-500 w-8 h-8" />
                  </div>
                  <h4 className="text-white font-bold mb-2 text-xl">حدث خطأ ما</h4>
                  <p className="text-red-400 text-sm leading-relaxed mb-6">{error}</p>
                  <button 
                    onClick={() => setError(null)}
                    className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-sm hover:bg-white/10 transition-colors"
                  >
                    حاول مرة أخرى
                  </button>
                </div>
              ) : (
                <div className="text-center flex flex-col items-center max-w-xs transition-all group-hover:scale-105 duration-500">
                  <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mb-8 border border-primary/10 group-hover:border-primary/30 transition-colors relative">
                    <VideoIcon className="w-16 h-16 text-primary/20 group-hover:text-primary transition-colors duration-500" />
                    <Sparkles className="absolute top-4 right-4 text-primary/20 animate-pulse" />
                  </div>
                  <p className="text-2xl font-black text-white mb-2 tracking-tight">ابدأ إبداعك</p>
                  <p className="text-muted text-sm leading-relaxed text-balance">اكتب وصفاً خيالياً للفيديو في المربع الجانبي، وسيقوم الذكاء الاصطناعي بتحويله لواقع حي.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;
