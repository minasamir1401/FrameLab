import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        studio: "Studio",
        editor: "Image Editor",
        video: "Video Generator",
        pricing: "Pricing",
        tools: "AI Tools",
        animate: "Animate Image",
        login: "Login"
      },
      hero: {
        title: "FrameLab",
        subtitle: "Create stunning AI-generated images in seconds",
        badge_free: "100% Free",
        badge_unlimited: "Unlimited Prompts",
        badge_no_login: "No Login Required",
        badge_powered: "Powered by FrameLab",
        description: "The world's first unlimited free AI image generator"
      },
      generator: {
        title: "AI Image Generator",
        placeholder: "What do you want to see?",
        hint: "Please enter prompts in English for best results",
        create: "Create",
        clear: "Clear",
        random: "Random",
        model: "Model",
        no_style: "No Style",
        no_lighting: "No Lighting",
        no_color: "No Color",
        no_composition: "No Composition",
        negative_prompt: "Negative Prompt",
        fast_mode: "Fast Mode"
      },
      gallery: {
        title: "Be Inspired",
        subtitle: "Get inspired by what others create with FrameLab"
      },
      footer: {
        description: "FrameLab image generator is powerful, free, and privacy-focused - experience the next generation of AI image generation.",
        feature1_title: "Advanced Text Understanding",
        feature1_desc: "Superior text-to-image capabilities. FrameLab delivers an image generator with accurate interpretation of complex prompts.",
        feature2_title: "Top-Tier Quality",
        feature2_desc: "FrameLab's built-in smart prompting selects the best model for high-quality results.",
        feature3_title: "Zero Cost Creation",
        feature3_desc: "FrameLab is the world's first completely free AI image generator with no restrictions."
      },
      studio: {
        title: "My Studio",
        subtitle: "Your creative history and saved generations",
        search_placeholder: "Search prompts...",
        empty_title: "No images yet",
        empty_description: "Start creating to see your images here!",
        no_results: "No images match your search.",
        confirm_clear: "Are you sure you want to clear your entire history?",
      },
      video: {
        subtitle: "Turn your text into magical videos in seconds",
        generating: "Generating Video...",
        button: "Generate Video Now",
        tips_title: "Tips for better results:",
        tip1: "Use clear descriptive motion language.",
        tip2: "Define lighting and angle style.",
        tip3: "Video generation can take up to a minute.",
      }
    }
  },
  ar: {
    translation: {
      nav: {
        studio: "الاستوديو",
        editor: "محرر الصور",
        video: "مولّد فيديو",
        pricing: "الأسعار",
        tools: "أدوات الذكاء الاصطناعي",
        animate: "تحريك الصورة",
        login: "تسجيل الدخول"
      },
      hero: {
        title: "FrameLab",
        subtitle: "أنشئ صوراً مذهلة مولدة بالذكاء الاصطناعي في ثوانٍ",
        badge_free: "%مجاني 100",
        badge_unlimited: "إشاعات غير محدودة",
        badge_no_login: "لا حاجة لتسجيل الدخول",
        badge_powered: "مدعوم من FrameLab",
        description: "أول مولد صور مجاني غير محدود في العالم بالذكاء الاصطناعي"
      },
      generator: {
        title: "مولد الصور بالذكاء الاصطناعي",
        placeholder: "ماذا تريد أن ترى؟",
        hint: "يرجى إدخال الموجهات باللغة الإنجليزية للحصول على أفضل النتائج GB",
        create: "إنشاء",
        clear: "مسح",
        random: "عشوائي",
        model: "النموذج",
        no_style: "بلا نمط",
        no_lighting: "بلا إضاءة",
        no_color: "بلا ألوان",
        no_composition: "بلا تكوين",
        negative_prompt: "موجه سلبي",
        fast_mode: "الوضع السريع"
      },
      gallery: {
        title: "استلهم",
        subtitle: "استلهم مما ينشئه الآخرون باستخدام FrameLab"
      },
      footer: {
        description: "قوي ومجاني ويركز على الخصوصية - جرب الجيل القادم من توليد الصور بالذكاء الاصطناعي مع FrameLab.",
        feature1_title: "فهم متقدم للنصوص",
        feature1_desc: "إمكانيات متفوقة من النص إلى الصورة FrameLab يقدم مولد صور مع تفسير دقيق للطلبات المعقدة.",
        feature2_title: "جودة عالية المستوى",
        feature2_desc: "يختار FrameLab التوجيه الذكي المدمج في مولد صور أفضل نموذج لتقديم صور واقعية.",
        feature3_title: "إنشاء بتكلفة صفرية",
        feature3_desc: "هو أول مولد صور مجاني بالذكاء الاصطناعي FrameLab الاصطناعي مجاني تماماً في العالم."
      },
      studio: {
        title: "استوديو أعمالي",
        subtitle: "تاريخ إبداعاتك والصور التي قمت بتوليدها",
        search_placeholder: "ابحث في الأوصاف...",
        empty_title: "لا توجد صور بعد",
        empty_description: "ابدأ بإنشاء صورك الأولى لتظهر هنا في الاستوديو!",
        no_results: "لا توجد صور تطابق بحثك.",
        confirm_clear: "هل أنت متأكد من مسح جميع الصور في التاريخ؟",
      },
      video: {
        subtitle: "حول نصوصك إلى مقاطع فيديو سحرية في ثوانٍ",
        generating: "جاري التوليد...",
        button: "توليد فيديو الآن",
        tips_title: "نصائح للحصول على نتائج أفضل:",
        tip1: "استخدم لغة وصفية واضحة للحركة.",
        tip2: "حدد نمط الإضاءة والزاوية.",
        tip3: "قد يستغرق توليد الفيديو ما يصل إلى دقيقة.",
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    }
  });

i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

// Set initial direction
document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';

export default i18n;
