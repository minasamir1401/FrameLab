import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Pricing = () => {
  const { t } = useTranslation();

  const plans = [
    {
      name: "الخطة المجانية",
      price: "0",
      features: ["إنشاء صور غير محدود", "دخول عام لكافة النماذج", "دعم المجتمع", "سرعة عادية"],
      icon: Sparkles,
      button: "ابدأ الآن",
      featured: false
    },
    {
      name: "خطة المحترفين",
      price: "19",
      features: ["كل ما في المجانية", "أولوية في الإنشاء", "بدون علامة مائية", "دعم فني متميز", "وصول مبكر للميزات"],
      icon: Zap,
      button: "اشترك الآن",
      featured: true
    }
  ];

  return (
    <div className="pt-32 pb-20 px-6 min-h-[70vh]">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('nav.pricing')}</h1>
        <p className="text-muted mb-16">اختر الخطة المناسبة لاحتياجاتك الإبداعية.</p>

        <div className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto">
           {plans.map((plan, i) => (
             <motion.div 
               key={i}
               whileHover={{ y: -10 }}
               className={`glass-card p-8 flex-1 flex flex-col items-center border-2 ${plan.featured ? 'border-primary shadow-2xl shadow-primary/10' : 'border-white/5'}`}
             >
                <plan.icon className={`w-12 h-12 mb-6 ${plan.featured ? 'text-primary' : 'text-muted'}`} />
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                   <span className="text-4xl font-bold">${plan.price}</span>
                   <span className="text-muted">/شهرياً</span>
                </div>
                <ul className="space-y-4 mb-10 text-right w-full">
                   {plan.features.map((f, j) => (
                     <li key={j} className="flex items-center gap-3 justify-end text-sm text-stone-300">
                        <span>{f}</span>
                        <Check size={16} className="text-primary shrink-0" />
                     </li>
                   ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-bold transition-all ${plan.featured ? 'bg-primary text-black' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>
                   {plan.button}
                </button>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
