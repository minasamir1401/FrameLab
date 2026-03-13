import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Client } from '@gradio/client';
import { getHourlySortedTokens } from '../services/imageService';
import { 
  Upload, 
  Download, 
  RotateCcw, 
  Sun, 
  Contrast, 
  Droplets,
  Scissors,
  Type,
  Image as ImageIcon,
  Check,
  Layers,
  Sparkles,
  LayoutGrid,
  Loader2,
  Brush,
  Eraser,
  Undo2
} from 'lucide-react';

const Editor = () => {
  const { t } = useTranslation();
  const [image, setImage] = useState(null);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturate: 100,
    blur: 0,
    sepia: 0,
    grayscale: 0,
    hueRotate: 0,
    invert: 0,
    opacity: 100
  });
  const [activeTab, setActiveTab] = useState('filters');
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiStyle, setAiStyle] = useState("Detail-Enhancer");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const [brushSize, setBrushSize] = useState(30);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const canvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // دالة لتصغير الصورة قبل إرسالها لـ Cloudflare لمنع تشوه الصور
  const compressAndResizeImage = (dataUrl, maxWidth = 768) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // الحفاظ على نسبة العرض والارتفاع وتغيير الحجم ليكون مناسب للـ AI
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }
        
        // يجب أن تكون الأبعاد من مضاعفات 8 لـ Stable Diffusion
        canvas.width = width - (width % 8);
        canvas.height = height - (height % 8);
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.9)); // ضغط ذكي 90%
      };
      img.src = dataUrl;
    });
  };

  // Helper function to convert any image (Base64 or Blob URL) to a clean Base64 string
  const getBase64Image = (imgSrc) => {
    return new Promise((resolve) => {
      if (imgSrc.startsWith('data:')) {
        resolve(imgSrc);
        return;
      }
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = imgSrc;
    });
  };

  const handleAIEdit = async () => {
    if (!image) return;
    setAiLoading(true);
    setAiError(null);

    try {
      if (activeTab === 'inpainting') {
        if (!aiPrompt.trim()) throw new Error("يرجى وصف التعديل المطلوب (مثلاً: إضافة قبعة، تغيير الخلفية)");
        
        // 1. استخراج الماسك من الكانفاس (PNG أفضل للماسك ليكون حاداً)
        const maskData = maskCanvasRef.current.toDataURL('image/png');
        
        // 2. تصغير الصورة الأصلية لـ 512x512 (شرط أساسي لـ Inpainting)
        const optimizedImage = await compressAndResizeImage(image, 512);

        // 3. إرسال للووركر
        const response = await fetch("https://image-api.mina15g4y.workers.dev", {
          method: "POST",
          headers: {
            "Authorization": "Bearer 12345678",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "inpainting",
            prompt: aiPrompt,
            image: optimizedImage,
            mask: maskData
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "فشل السيرفر في معالجة طلب التعديل");
        }
        
        const blob = await response.blob();
        setImage(URL.createObjectURL(blob));
        clearMask();
      }
    } catch (err) {
      setAiError(err.message || "حدث خطأ");
    }
  };

  const startDrawing = (e) => {
    if (activeTab !== 'inpainting') return;
    const canvas = maskCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    // Scale coordinates based on canvas size vs display size
    const x = ((e.clientX || e.touches[0].clientX) - rect.left) * (canvas.width / rect.width);
    const y = ((e.clientY || e.touches[0].clientY) - rect.top) * (canvas.height / rect.height);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || activeTab !== 'inpainting') return;
    const canvas = maskCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    const x = ((e.clientX || e.touches[0].clientX) - rect.left) * (canvas.width / rect.width);
    const y = ((e.clientY || e.touches[0].clientY) - rect.top) * (canvas.height / rect.height);
    
    ctx.lineTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = 'rgba(255, 255, 255, 1)'; // Solid white for mask
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearMask = () => {
    const canvas = maskCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleImageLoad = () => {
    // Sync mask canvas size with the image size
    if (imageRef.current) {
      maskCanvasRef.current.width = imageRef.current.naturalWidth;
      maskCanvasRef.current.height = imageRef.current.naturalHeight;
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setAiPrompt("");
        setAiError(null);
        // Reset filters
        setFilters({
          brightness: 100,
          contrast: 100,
          saturate: 100,
          blur: 0,
          sepia: 0,
          grayscale: 0,
          hueRotate: 0,
          invert: 0,
          opacity: 100
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const downloadEditedImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Apply filters to canvas
      ctx.filter = `
        brightness(${filters.brightness}%)
        contrast(${filters.contrast}%)
        saturate(${filters.saturate}%)
        blur(${filters.blur}px)
        sepia(${filters.sepia}%)
        grayscale(${filters.grayscale}%)
        hue-rotate(${filters.hueRotate}deg)
        invert(${filters.invert}%)
        opacity(${filters.opacity}%)
      `;
      
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = 'edited-framelab.png';
      link.href = canvas.toDataURL();
      link.click();
    };
    img.src = image;
  };

  const filterConfigs = [
    { label: 'السطوع', name: 'brightness', icon: Sun, min: 0, max: 200, unit: '%' },
    { label: 'التباين', name: 'contrast', icon: Contrast, min: 0, max: 200, unit: '%' },
    { label: 'التشبع', name: 'saturate', icon: Droplets, min: 0, max: 200, unit: '%' },
    { label: 'التمويه (Blur)', name: 'blur', icon: Layers, min: 0, max: 20, unit: 'px' },
    { label: 'سيبيا (قديم)', name: 'sepia', icon: Sparkles, min: 0, max: 100, unit: '%' },
    { label: 'أبيض وأسود', name: 'grayscale', icon: ImageIcon, min: 0, max: 100, unit: '%' },
    { label: 'تغيير درجات اللون', name: 'hueRotate', icon: RotateCcw, min: 0, max: 360, unit: 'deg' },
    { label: 'عكس الألوان', name: 'invert', icon: Type, min: 0, max: 100, unit: '%' },
    { label: 'شفافية', name: 'opacity', icon: Check, min: 0, max: 100, unit: '%' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Editor Sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="glass-card p-6 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Scissors className="text-primary" size={20} />
              أدوات التعديل
            </h2>

            {!image ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-8 hover:bg-white/5 cursor-pointer transition-all group">
                <Upload className="text-muted group-hover:text-primary mb-4 transition-colors" size={32} />
                <span className="text-white font-medium mb-1">رفع صورة</span>
                <span className="text-muted text-xs text-center">قم برفع صورة لبدء التعديل الاحترافي</span>
                <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
              </label>
            ) : (
              <div className="space-y-6">
                {/* Tabs */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                  <button 
                    onClick={() => setActiveTab('filters')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'filters' ? 'bg-primary text-black' : 'text-muted hover:text-white'}`}
                  >
                    الفلاتر
                  </button>
                  <button 
                    onClick={() => setActiveTab('inpainting')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'inpainting' ? 'bg-primary text-black' : 'text-muted hover:text-white'}`}
                  >
                    تعديل ذكي (AI)
                  </button>
                </div>

                {activeTab === 'filters' && (
                  /* Filter Sliders */
                  <div className="space-y-5 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {filterConfigs.map((cfg) => (
                      <div key={cfg.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-stone-300">
                            <cfg.icon size={14} className="text-muted" />
                            <span>{cfg.label}</span>
                          </div>
                          <span className="text-[10px] text-primary">{filters[cfg.name]}{cfg.unit}</span>
                        </div>
                        <input 
                          type="range"
                          min={cfg.min}
                          max={cfg.max}
                          value={filters[cfg.name]}
                          onChange={(e) => handleFilterChange(cfg.name, e.target.value)}
                          className="w-full appearance-none h-1.5 bg-white/10 rounded-lg accent-primary cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'inpainting' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl">
                      <p className="text-[10px] text-primary leading-relaxed text-right">قم بالرسم على المنطقة التي تريد تغييرها، ثم اكتب الوصف بالأسفل.</p>
                    </div>
                    
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <span className="text-[10px] text-primary">{brushSize}px</span>
                             <label className="text-[10px] text-muted text-right">حجم الفرشاة</label>
                        </div>
                        <input 
                            type="range"
                            min="5"
                            max="100"
                            value={brushSize}
                            onChange={(e) => setBrushSize(parseInt(e.target.value))}
                            className="w-full appearance-none h-1 bg-white/10 rounded-lg accent-primary cursor-pointer mb-2"
                        />
                        <button 
                            onClick={clearMask}
                            className="w-full flex items-center justify-center gap-2 py-2 border border-white/10 rounded-lg text-white text-[10px] hover:bg-white/5"
                        >
                            <Undo2 size={12} />
                            مسح الرسم الحالي
                        </button>
                    </div>

                    <div>
                      <label className="block text-[10px] text-muted mb-2 text-right">ماذا تريد أن تضع مكان الرسم؟</label>
                      <textarea 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="قميص أزرق، نظارات شمسية، غابة..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white h-20 focus:border-primary focus:outline-none"
                      />
                    </div>
                    
                    <button 
                      onClick={handleAIEdit}
                      disabled={aiLoading}
                      className="w-full primary-button py-3 text-xs flex items-center justify-center gap-2"
                    >
                      {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles size={14} />}
                      {aiLoading ? "جاري التعديل..." : "تطبيق الرسم الذكي"}
                    </button>
                    {aiError && <p className="text-[10px] text-red-500 text-right">{aiError}</p>}
                  </div>
                )}

                {/* Presets - Only for filters tab */}
                {activeTab === 'filters' && (
                  <div className="pt-4 border-t border-white/5">
                    <h3 className="text-xs font-semibold text-muted mb-3">فلاتر جاهزة</h3>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => setFilters({ brightness: 110, contrast: 110, saturate: 130, blur: 0, sepia: 0, grayscale: 0, hueRotate: 0, invert: 0, opacity: 100 })}
                        className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-all text-white"
                      >
                        زاهي
                      </button>
                      <button 
                        onClick={() => setFilters({ brightness: 90, contrast: 120, saturate: 85, blur: 1, sepia: 40, grayscale: 0, hueRotate: 0, invert: 0, opacity: 100 })}
                        className="px-3 py-1.5 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-md transition-all"
                      >
                        كلاسيكي
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-white/5">
                   <button 
                    onClick={() => {
                      setImage(null);
                      setAiPrompt("");
                    }}
                    className="flex-1 secondary-button py-3 text-xs"
                   >
                     البدء من جديد
                   </button>
                   <button 
                    onClick={downloadEditedImage}
                    className="flex-1 primary-button py-3 text-xs flex items-center justify-center gap-2"
                   >
                     <Download size={14} />
                     حفظ
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 min-h-[600px] glass-card p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!image ? (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                 <div className="w-24 h-24 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                    <ImageIcon className="text-primary w-10 h-10" />
                 </div>
                 <h2 className="text-3xl font-bold text-white mb-2">في انتظار إبداعك</h2>
                 <p className="text-muted">ارفع صورة أو قم بتوليد واحدة ثم ابدأ بالتعديل</p>
              </motion.div>
            ) : (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative max-w-full"
              >
                <div 
                    ref={containerRef}
                    className="relative cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                >
                    <img 
                      ref={imageRef}
                      src={image} 
                      onLoad={handleImageLoad}
                      alt="Edit target"
                      className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl transition-all duration-200 select-none pointer-events-none"
                      style={{
                        filter: `
                          brightness(${filters.brightness}%)
                          contrast(${filters.contrast}%)
                          saturate(${filters.saturate}%)
                          blur(${filters.blur}px)
                          sepia(${filters.sepia}%)
                          grayscale(${filters.grayscale}%)
                          hue-rotate(${filters.hueRotate}deg)
                          invert(${filters.invert}%)
                          opacity(${filters.opacity}%)
                        `
                      }}
                    />
                    
                    <canvas 
                        ref={maskCanvasRef}
                        className={`absolute top-0 left-0 w-full h-full rounded-2xl pointer-events-none ${activeTab === 'inpainting' ? 'opacity-50' : 'opacity-0'}`}
                        style={{ mixBlendMode: 'normal' }}
                    />
                </div>
                
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-stone-900/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-4 shadow-xl z-10">
                   <div className="flex items-center gap-2 text-[10px] text-muted border-r border-white/10 pr-4">
                      <LayoutGrid size={12} />
                      <span>{imageRef.current?.naturalWidth || 0}x{imageRef.current?.naturalHeight || 0} PX</span>
                   </div>
                   <div className="flex items-center gap-2 text-[10px] text-primary">
                      <Check size={12} />
                      <span>{activeTab === 'inpainting' ? 'وضع الرسم مُفعل' : 'معاينة حية'}</span>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none"></div>
        </div>

      </div>
    </div>
  );
};

export default Editor;
