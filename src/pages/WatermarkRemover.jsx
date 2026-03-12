import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Sparkles, Loader2, ArrowLeft, Image as ImageIcon, Download, Scissors, Check, Eraser } from 'lucide-react';
import { Client } from "@gradio/client";
import { HF_TOKENS } from '../services/imageService';

const WatermarkRemover = () => {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const imageRef = useRef(null);

  // دالة تصغير الصورة لرفعها للذكاء الاصطناعي
  const compressAndResizeImage = (dataUrl, maxWidth = 1024) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = dataUrl;
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setProcessedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeWatermark = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);

    try {
      const compressedImage = await compressAndResizeImage(image);
      
      const tokens = HF_TOKENS;
      
      let success = false;
      let resultUrl = null;

      for (const token of tokens) {
        if (success) break;
        try {
          const app = await Client.connect("prithivMLmods/Kontext-Watermark-Remover", { hf_token: token });
          
          const imageResponse = await fetch(compressedImage);
          const imageBlob = await imageResponse.blob();

          // الدالة /predict في هذا الموديل تأخذ عادةً الصورة كمدخل
          const result = await app.predict("/predict", [
            imageBlob, 
          ]);

          if (result && result.data && result.data[0]) {
            const outImg = result.data[0];
            resultUrl = outImg?.url || outImg;
            success = true;
          }
        } catch (e) {
          console.warn("HF Token failed for watermark...", e.message);
        }
      }

      if (success && resultUrl) {
        setProcessedImage(resultUrl);
      } else {
        throw new Error("السيرفرات مزدحمة حالياً أو هناك خطأ في الاتصال، حاول مرة أخرى.");
      }

    } catch (err) {
      setError(err.message || "فشلت عملية إزالة العلامة المائية");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `watermark-removed-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 mb-4 inline-flex items-center gap-3">
            <Eraser size={36} className="text-primary" />
            مزيل العلامات المائية
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            قم بإزالة العلامات المائية، النصوص، والشعارات المزعجة من صورك بسهولة وباحترافية تامة باستخدام الذكاء الاصطناعي.
          </p>
        </div>

        <div className="glass-card p-6 lg:p-10 rounded-3xl relative overflow-hidden">
          <div className="flex flex-col items-center gap-8">
            
            {/* منطقة الرفع والعرض */}
            <div className="w-full relative">
              <AnimatePresence mode="wait">
                {!image ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-2xl p-16 hover:bg-white/5 hover:border-primary/50 cursor-pointer transition-all duration-300 group bg-black/20">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Upload className="text-primary" size={36} />
                      </div>
                      <span className="text-white font-bold text-xl mb-2">اسحب الصورة هنا أو اضغط للاختيار</span>
                      <span className="text-muted text-sm">يدعم JPG, PNG (أقصى حجم ننصح به 5MB)</span>
                      <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </label>
                  </motion.div>
                ) : (
                  <motion.div
                    key="display"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="space-y-4">
                      <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <ImageIcon className="text-muted" size={18} />
                        الصورة الأصلية
                      </h3>
                      <div className="bg-black/40 rounded-2xl overflow-hidden border border-white/10 relative group">
                        <img 
                          ref={imageRef}
                          src={image} 
                          alt="Original" 
                          className="w-full h-[400px] object-contain"
                        />
                        <button 
                          onClick={() => { setImage(null); setProcessedImage(null); }}
                          className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors backdrop-blur-md"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Sparkles className="text-primary" size={18} />
                        النتيجة الصافية
                      </h3>
                      <div className="bg-black/40 rounded-2xl overflow-hidden border border-white/10 h-[400px] flex items-center justify-center relative">
                        {loading ? (
                          <div className="flex flex-col items-center justify-center text-primary gap-4">
                            <Loader2 className="w-12 h-12 animate-spin" />
                            <p className="animate-pulse font-medium">الذكاء الاصطناعي يقوم بإزالة العلامة...</p>
                          </div>
                        ) : processedImage ? (
                          <>
                            <img 
                              src={processedImage} 
                              alt="Cleaned" 
                              className="w-full h-full object-contain"
                            />
                             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full border border-green-500/30 backdrop-blur-md">
                                <Check size={14} /> تمت الإزالة بنجاح
                            </div>
                          </>
                        ) : error ? (
                          <div className="text-red-400 text-center px-6">
                            <p className="mb-2">⚠️</p>
                            <p className="text-sm">{error}</p>
                          </div>
                        ) : (
                          <p className="text-muted/50 text-sm">اضغط على زر الإزالة لتبدأ العملية</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* أدوات التحكم */}
            <AnimatePresence>
              {image && !loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="w-full md:w-1/2 flex gap-4"
                >
                  {!processedImage ? (
                    <button 
                      onClick={removeWatermark}
                      className="w-full primary-button py-4 text-base font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                      <Eraser size={20} />
                      إزالة العلامة المائية الآن
                    </button>
                  ) : (
                    <button 
                      onClick={downloadImage}
                      className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-4 text-base font-bold transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      تحميل الصورة النظيفة
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] pointer-events-none -z-10"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 blur-[120px] pointer-events-none -z-10"></div>
        </div>
      </div>
    </div>
  );
};

export default WatermarkRemover;
