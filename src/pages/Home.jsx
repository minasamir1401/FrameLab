import React, { useState } from 'react';
import { 
  Sparkles, 
  ChevronDown,
  Maximize2,
  Zap,
  RotateCcw,
  Plus,
  Download,
  History
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { generateImage } from '../services/imageService';
import { saveToStudio, blobToBase64 } from '../services/storageService';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="pt-32 pb-16 px-6 text-center max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="w-20 h-20 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center mb-2">
          <Sparkles className="text-primary w-10 h-10" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
          {t('hero.title')}
        </h1>
        
        <p className="text-xl text-muted max-w-2xl font-medium">
          {t('hero.subtitle')}
        </p>
        
        <div className="flex items-center gap-2 text-sm justify-center">
          <Sparkles className="text-primary w-4 h-4 shrink-0" />
          <span className="text-muted">{t('hero.description')}</span>
          <Sparkles className="text-primary w-4 h-4 shrink-0" />
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <span className="badge-purple">{t('hero.badge_unlimited')}</span>
          <span className="badge-blue">{t('hero.badge_no_login')}</span>
          <span className="badge-teal">{t('hero.badge_powered')}</span>
          <span className="badge-orange">{t('hero.badge_free')}</span>
        </div>
      </motion.div>
    </section>
  );
};

const ImageGenerator = ({ prompt, setPrompt }) => {
  const { t, i18n } = useTranslation();
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('cf/flux');
  const [imageCount, setImageCount] = useState(1);
  
  // Style States
  const [activeStyle, setActiveStyle] = useState('None');
  const [activeLighting, setActiveLighting] = useState('None');
  const [activeColor, setActiveColor] = useState('None');
  const [activeComposition, setActiveComposition] = useState('None');

  const models = [
    { id: 'pollinations/flux', name: 'FLUX Unlimited 🔥', description: '100,000+ صورة يومياً | مجاني بالكامل وبدون أي قيود أو توقف' },
    { id: 'cf/flux',        name: 'FLUX.1 Schnell',    description: '~ 60 صورة يومياً | دقيق وممتاز للسرعة العالية' },
    { id: 'cf/dreamshaper', name: 'DreamShaper 8',     description: '~ 120 صورة يومياً | الأفضل للوجوه والواقعية' },
    { id: 'cf/phoenix',     name: 'Phoenix 1.0',       description: '~ 25 صورة يومياً | جودة سينمائية خرافية وتفاصيل دقيقة' },
    { id: 'cf/sdxl',        name: 'SDXL 1.0',          description: '~ 25 صورة يومياً | تفصيل عالي للإبداع' },
    { id: 'cf/lucid',       name: 'Lucid Origin',      description: '~ 25 صورة يومياً | دقيق جداً في النصوص والتصاميم' },
    { id: 'runware/z-image-turbo', name: 'Z-Image-Turbo', description: 'سيرفر خاص للملفات السريعة' },
  ];


  const randomPrompts = {
    ar: [
      "مدينة عائمة فوق سحابة برتقالية عند الغروب، مع مباني زجاجية تتوهج في الضوء.",
      "غابة مظلمة مليئة بحيوانات ميكانيكية، وكائنات شبه بشرية تتحرك بين الأشجار.",
      "ساحة قتال فضائية، مع روبوتات عملاقة ونجوم ملونة في الخلفية، أسلوب واقعي سينمائي.",
      "مكتبة لا نهائية تحت البحر، مع مخلوقات بحرية تطفو بين الرفوف.",
      "مدينة مستقبلية تتسلق الجبال العالية، طرق معلقة ومركبات طائرة تمر بين المباني.",
      "مصارعة تنينين في صحراء نارية، رماد وألسنة لهب تتطاير في الهواء، واقعي وفنتازي.",
      "قصر جليدي في منتصف المحيط، مع أضواء شفق قطبي تعكس على الجليد.",
      "سوق شعبي في مدينة فضائية، أشخاص من كواكب مختلفة يبيعون سلع غريبة، ألوان زاهية وحركة.",
      "طيور عملاقة تحمل سفنًا صغيرة في السماء، بين سحاب وردي وأشعة شمس ذهبية.",
      "معبد قديم مدمّر على قمة جبل، مع ضباب كثيف وأشعة ضوء تخترق الغموض، أسلوب سينمائي."
    ],
    en: [
      "Floating city above an orange cloud at sunset, with glowing glass buildings.",
      "Dark forest filled with mechanical animals and humanoid creatures moving among the trees.",
      "Space battle arena with giant robots and colorful stars in the background, cinematic realistic style.",
      "Infinite underwater library with sea creatures floating among the shelves.",
      "Futuristic city climbing tall mountains, with suspended roads and flying vehicles passing between buildings.",
      "Two dragons battling in a fiery desert, ashes and flames flying in the air, realistic fantasy.",
      "Ice palace in the middle of the ocean, with aurora lights reflecting on the ice.",
      "Marketplace in a space city, people from different planets selling strange goods, vibrant colors and motion.",
      "Giant birds carrying small ships in the sky, among pink clouds and golden sunlight.",
      "Ancient ruined temple on a mountain peak, with thick fog and beams of light piercing the mystery, cinematic style."
    ]
  };

  const downloadImage = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `framelab-ai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const isArabic = /[\u0600-\u06FF]/.test(prompt);
      
      const imageUrl = await generateImage(prompt, { 
        model: selectedModel,
        style: activeStyle !== 'None' ? activeStyle : null,
        lighting: activeLighting !== 'None' ? activeLighting : null,
        color: activeColor !== 'None' ? activeColor : null,
        composition: activeComposition !== 'None' ? activeComposition : null,
        count: imageCount
      });

      setResultImage(imageUrl);

      // Save to local history (Base64 for persistence)
      try {
        for (const url of imageUrl) {
          const base64 = await blobToBase64(url);
          await saveToStudio({
            url: base64,
            prompt: prompt,
            model: selectedModel
          });
        }
      } catch (saveErr) {
        console.warn("Failed to save to history:", saveErr);
      }
    } catch (err) {
      if (err.message.includes("503")) {
        setError("الموديل جاري تحميله الآن (تعريف لأول مرة). يرجى المحاولة مرة أخرى بعد 20 ثانية.");
      } else if (err.message.includes("429")) {
        setError("عدد الطلبات كبير حالياً. يرجى الانتظار دقيقة والمحاولة مرة أخرى.");
      } else {
        setError("حدث خطأ غير متوقع. جرب اختيار موديل آخر من القائمة.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="generator" className="px-4 sm:px-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-white">{t('generator.title')}</h2>
        
        <div className="glass-card p-4 sm:p-6 shadow-2xl shadow-primary/5">
          <div className="relative mb-6">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-lg text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none text-right"
              placeholder={t('generator.placeholder')}
            ></textarea>
            <div className="absolute top-4 left-4 text-[10px] md:text-xs text-muted/50">
              {t('generator.hint')}
            </div>
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
               <button 
                 onClick={() => {
                   setPrompt('');
                   setActiveStyle('None');
                   setActiveLighting('None');
                   setActiveColor('None');
                   setActiveComposition('None');
                 }}
                 className="p-2 hover:bg-white/10 rounded-lg text-muted transition-all"
               >
                  <RotateCcw size={20} />
               </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4">
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 justify-center">
                {['1:1', '4:3', '3:4', '16:9'].map(ratio => (
                  <button 
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-sm transition-all ${aspectRatio === ratio ? 'bg-primary text-black font-semibold' : 'text-muted hover:text-white'}`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-wrap gap-2">
                <select 
                   value={activeStyle} 
                   onChange={(e) => setActiveStyle(e.target.value)}
                   className="secondary-button text-[10px] sm:text-xs font-medium bg-stone-900 border-none outline-none appearance-none cursor-pointer w-full py-2 px-2"
                >
                  <option value="None">بلا نمط</option>
                  <option value="Cinematic">سينمائي</option>
                  <option value="Digital Art">فن رقمي</option>
                  <option value="Oil Painting">رسم زيتي</option>
                  <option value="3D Render">ريندر 3D</option>
                </select>

                <select 
                   value={activeLighting} 
                   onChange={(e) => setActiveLighting(e.target.value)}
                   className="secondary-button text-[10px] sm:text-xs font-medium border-none outline-none appearance-none cursor-pointer w-full py-2 px-2"
                   style={{ backgroundColor: '#1c1917', color: '#fff' }}
                >
                  <option value="None" style={{ backgroundColor: '#1c1917', color: '#fff' }}>بلا إضاءة</option>
                  <option value="Volumetric" style={{ backgroundColor: '#1c1917', color: '#fff' }}>إضاءة حجمية</option>
                  <option value="Neon" style={{ backgroundColor: '#1c1917', color: '#fff' }}>نيون</option>
                  <option value="Soft" style={{ backgroundColor: '#1c1917', color: '#fff' }}>ناعمة</option>
                  <option value="Golden Hour" style={{ backgroundColor: '#1c1917', color: '#e3a659' }}>ساعة ذهبية</option>
                </select>

                <select 
                   value={activeColor} 
                   onChange={(e) => setActiveColor(e.target.value)}
                   className="secondary-button text-[10px] sm:text-xs font-medium border-none outline-none appearance-none cursor-pointer w-full py-2 px-2"
                   style={{ backgroundColor: '#1c1917', color: '#fff' }}
                >
                  <option value="None" style={{ backgroundColor: '#1c1917', color: '#fff' }}>بلا ألوان</option>
                  <option value="Vibrant" style={{ backgroundColor: '#1c1917', color: '#fff' }}>زاهية</option>
                  <option value="Monochrome" style={{ backgroundColor: '#1c1917', color: '#fff' }}>أبيض وأسود</option>
                  <option value="Pastel" style={{ backgroundColor: '#1c1917', color: '#fff' }}>باستيل</option>
                  <option value="Vintage" style={{ backgroundColor: '#1c1917', color: '#e3a659' }}>قديم</option>
                </select>

                <select 
                   value={activeComposition} 
                   onChange={(e) => setActiveComposition(e.target.value)}
                   className="secondary-button text-[10px] sm:text-xs font-medium border-none outline-none appearance-none cursor-pointer w-full py-2 px-2"
                   style={{ backgroundColor: '#1c1917', color: '#fff' }}
                >
                  <option value="None" style={{ backgroundColor: '#1c1917', color: '#fff' }}>بلا تكوين</option>
                  <option value="Portrait" style={{ backgroundColor: '#1c1917', color: '#fff' }}>بورتريه</option>
                  <option value="Wide Angle" style={{ backgroundColor: '#1c1917', color: '#fff' }}>زاوية واسعة</option>
                  <option value="Macro" style={{ backgroundColor: '#1c1917', color: '#fff' }}>ماكرو</option>
                  <option value="Birds Eye" style={{ backgroundColor: '#1c1917', color: '#fff' }}>منظور طائر</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select 
                  value={imageCount}
                  onChange={(e) => setImageCount(parseInt(e.target.value))}
                  className="secondary-button text-[10px] sm:text-xs font-medium border-none outline-none appearance-none cursor-pointer px-2 flex-1 sm:flex-none"
                  style={{ backgroundColor: '#1c1917', color: '#fff' }}
                  title="عدد الصور"
                >
                  <option value={1} style={{ backgroundColor: '#1c1917', color: '#fff' }}>صورة 1</option>
                  <option value={2} style={{ backgroundColor: '#1c1917', color: '#fff' }}>صورتان 2</option>
                  <option value={3} style={{ backgroundColor: '#1c1917', color: '#fff' }}>3 صور</option>
                  <option value={4} style={{ backgroundColor: '#1c1917', color: '#fff' }}>4 صور</option>
                </select>
                <button 
                  onClick={handleGenerate}
                  disabled={loading}
                  className={`primary-button flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 group relative py-3 sm:py-2.5 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="text-xs sm:text-sm">إنشاء</span>
                      <div className="h-4 w-[1px] bg-black/20 hidden sm:block"></div>
                      <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform hidden sm:block" />
                    </>
                  )}
                  <span className="absolute -top-2 right-0 sm:-right-2 badge-orange text-[8px] sm:text-[9px] px-1 py-0 shadow-lg">Free</span>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          {resultImage && resultImage.length > 0 && (
            <div className={`mt-8 grid gap-6 ${resultImage.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {resultImage.map((url, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group bg-stone-900"
                >
                  <img src={url} alt={`Generated ${idx + 1}`} className="w-full h-auto" />
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => downloadImage(url)}
                      className="p-3 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-black/70 flex items-center gap-2"
                    >
                      <Download size={18} />
                      <span className="text-xs font-semibold">تحميل</span>
                    </button>
                    <button 
                      onClick={() => window.open(url, '_blank')}
                      className="p-3 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-black/70"
                    >
                      <Maximize2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="mt-6 flex flex-col xs:flex-row items-center justify-between gap-4 border-t border-white/5 pt-4">
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => setPrompt('')}
                  className="text-xs text-muted hover:text-white transition-colors"
                >
                  {t('generator.clear')}
                </button>
                <button 
                  onClick={() => {
                    const lang = i18n.language.startsWith('ar') ? 'ar' : 'en';
                    const list = randomPrompts[lang];
                    setPrompt(list[Math.floor(Math.random() * list.length)]);
                  }}
                  className="text-xs text-muted hover:text-white transition-colors"
                >
                  {t('generator.random')}
                </button>
             </div>
             <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/10 text-[10px] sm:text-xs w-full xs:w-auto overflow-hidden">
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-transparent text-white outline-none cursor-pointer p-1 min-w-0 flex-1 truncate max-w-[150px] sm:max-w-none"
                  dir="ltr"
                >
                  {models.map(m => (
                    <option key={m.id} value={m.id} className="bg-background-card">{m.name}</option>
                  ))}
                </select>
                <span className="text-muted shrink-0">:Model</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Gallery = ({ onSelectPrompt }) => {
  const { t } = useTranslation();
  
  const examples = [
    { src: '/example-images/1.webp', prompt: 'style is lite brite art, luminous and colorful designs, pixelated compositions, retro aesthetic, glowing effects, creative patterns, interactive and playful, nostalgic charm, vibrant and dynamic arrangements.From the side, the winged cat fae is captured mid-strike, its small body coiled in violent motion. Its thorn-crown diadem glows with unstable, raw magic, a chaotic nimbus of luminous color. It swings a glowing, pixelated club to batter a large, somber carnivorous plant, its jaw-like leaves frozen as they recoil from the impact. The plant’s pot is tipped, and soil, a single black-eyed susan, and the petals of a dark rose are suspended in the vibrant, autumnal leaf-storm. A stark contrast, a peaceful dove remains perfectly still on an olive branch nearby, its form a simple, glowing pattern. The entire composition is rendered in a retro Lite-Brite aesthetic, with the cascading waterfalls and ancient ruins of the floating island background simplified into a grid of glowing, colorful pins, creating a paradox of a violent action unfolding within a playfully nostalgic and luminous world.masterpiece, best quality.' },
    { src: '/example-images/2.webp', prompt: 'dark fantasy, high quality ultra detailed anime illustration, 1girl with very long flowing silver-white hair blowing in the wind, glowing red eyes, cold and fierce expression. she grips a katana with both hands, the blade emitting intense blood-red light and a long sweeping energy arc, like burning blood and lightning. she wears a deep red and black kimono-style cloak covered in eerie circular eye-like patterns and red crack veins, with a tattered white dress underneath. background is a shadowy forest / gothic ruins, a huge spiked blood-red halo or magic circle behind her against a stormy dark blue night sky. ground is dark, wet and cracked, scattered with pink cherry blossom petals and branches, petals drifting in the air. strong contrast lighting, cool blue ambient light mixed with vivid red sword glow, lots of sparks and particles, dramatic, ominous, epic atmosphere, no text, no watermark, anime style.' },
    { src: '/example-images/3.webp', prompt: 'A hyper-detailed action scene set on a windswept mountain slope with two mountain goats battling' },
    { src: '/example-images/4.webp', prompt: 'Blonde, beautiful woman wearing a cropped satin top, seen from an elevated angle, realistic' },
    { src: '/example-images/5.webp', prompt: 'dark fantasy, high quality ultra detailed anime illustration, 1girl with very long hair, glowing accents' },
    { src: '/example-images/6.webp', prompt: 'high quality anime illustration, surreal night scene. in the center a girl with glowing eyes' },
    { src: '/example-images/7.webp', prompt: 'animalization, mirror, photo of a cat looking at itself in mirror, highly detailed, sharp focus' },
    { src: '/example-images/8.webp', prompt: 'Cutting-edge quantum computing research laboratory with pristine white surfaces and blue glowing lights' },
    { src: '/example-images/9.webp', prompt: 'A close-up of a face adorned with intricate black and blue patterns, tribal art, makeup' },
    { src: '/example-images/10.webp', prompt: '3D cartoon style underwater scene, high quality render. in clear blue-green water' },
    { src: '/example-images/11.webp', prompt: 'high quality illustration with an ink painting / oriental atmosphere. night scene, calligraphy style' },
    { src: '/example-images/12.webp', prompt: 'A sophisticated magazine cover portrait of a ginger-haired young model, cinematic lighting' },
    { src: '/example-images/13.webp', prompt: 'high quality humorous photo in a warm-lit American sports bar / restaurant, wide angle' },
    { src: '/example-images/14.webp', prompt: 'high quality fantasy concept art in warm orange tones. an endless cracked wasteland' },
    { src: '/example-images/15.webp', prompt: 'ultra realistic 3D render, humorous scene in a McDonald’s style fast food restaurant' },
    { src: '/example-images/16.webp', prompt: 'style is tech futurism, glowing circuits and cybernetic enhancements, workstation' },
  ];

  return (
    <section className="px-6 pb-32">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">{t('gallery.title')}</h2>
          <p className="text-muted text-sm sm:text-base">{t('gallery.subtitle')}</p>
        </div>

        <div className="columns-1 xs:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {examples.map((img, idx) => {
            const num = idx + 1;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onSelectPrompt(img.prompt);
                  window.scrollTo({ top: document.getElementById('generator').offsetTop - 100, behavior: 'smooth' });
                }}
                className="break-inside-avoid mb-4 cursor-pointer transition-transform hover:scale-[1.02] cursor-target w-full text-left bg-transparent border-0 p-0"
              >
                <div className="relative overflow-hidden rounded-lg group">
                  <img 
                    alt={`Example ${num}`} 
                    loading={num > 4 ? "lazy" : undefined}
                    width="512" 
                    height="768" 
                    decoding="async" 
                    className="w-full h-auto transition-transform duration-300 group-hover:scale-105" 
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" 
                    src={img.src} 
                    style={{ aspectRatio: "512 / 768", objectFit: 'cover' }} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 will-change-[opacity]">
                    <p className="text-white text-xs leading-relaxed mb-2 line-clamp-3">
                      {img.prompt}
                    </p>
                    <div className="flex items-center justify-end text-white/80 text-xs">
                      <span>انقر للاستخدام</span>
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const [prompt, setPrompt] = useState('');

  return (
    <>
      <Hero />
      <ImageGenerator prompt={prompt} setPrompt={setPrompt} />
      <Gallery onSelectPrompt={setPrompt} />
    </>
  );
};

export default Home;
