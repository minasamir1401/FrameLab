import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Box, Search, PenTool, Share2, Video, Play, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AITools = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const tools = [
    { title: "مولد الفيديو", desc: "حول أفكارك النصية إلى فيديوهات سينمائية قصيرة.", icon: Video, path: "/video", color: "from-blue-500/20 to-cyan-500/20" },
    { title: "تحريك الصور", desc: "بث الحياة في الصور الثابتة واجعلها تتحرك بواقعية.", icon: Play, path: "/animate", color: "from-purple-500/20 to-pink-500/20" },
    { title: "مولد الصور", desc: "إنتاج صور مذهلة من الوصف النصي فائق الدقة.", icon: Sparkles, path: "/", color: "from-orange-500/20 to-amber-500/20" },
    { title: "تكبير الصور", desc: "حول صورك الصغيرة إلى دقة 4K دون فقدان الجودة.", icon: Search, path: "/tools", color: "from-green-500/20 to-teal-500/20" },
  ];

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 text-center md:text-right">
          <h1 className="text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">{t('nav.tools')}</h1>
          <p className="text-muted text-lg">اكتشف قوة الذكاء الاصطناعي مع مجموعة أدوات <strong>FrameLab</strong> المتكاملة لتعزيز إنتاجيتك الإبداعية.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {tools.map((tool, i) => (
             <motion.div 
               key={i}
               whileHover={{ y: -10, scale: 1.02 }}
               onClick={() => navigate(tool.path)}
               className={`glass-card p-8 flex flex-col items-center text-center gap-6 hover:border-primary/50 transition-all cursor-pointer group bg-gradient-to-br ${tool.color} border-white/5`}
             >
                <div className="p-6 bg-black/40 backdrop-blur-xl rounded-[2rem] group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                   <tool.icon className="text-primary w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-3">{tool.title}</h3>
                  <p className="text-sm text-stone-300 leading-relaxed font-medium">{tool.desc}</p>
                </div>
                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                  <span>جرب الآن</span>
                  <div className="w-4 h-[1px] bg-primary"></div>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default AITools;
