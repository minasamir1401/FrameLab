import React from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Zap
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="py-20 border-t border-white/5 text-center px-6 mt-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-2xl font-serif text-primary font-bold mb-4">FrameLab</div>
        <p className="text-muted text-sm max-w-lg mx-auto leading-relaxed">
          {t('footer.description')}
        </p>
        <div className="flex justify-center gap-8 mt-12 grid grid-cols-1 md:grid-cols-3">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-primary">
              <Zap size={24} />
            </div>
            <h3 className="font-bold">{t('footer.feature1_title')}</h3>
            <p className="text-xs text-muted">{t('footer.feature1_desc')}</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-primary">
              <Sparkles size={24} />
            </div>
            <h3 className="font-bold">{t('footer.feature2_title')}</h3>
            <p className="text-xs text-muted">{t('footer.feature2_desc')}</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-primary">
              <ImageIcon size={24} />
            </div>
            <h3 className="font-bold">{t('footer.feature3_title')}</h3>
            <p className="text-xs text-muted">{t('footer.feature3_desc')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
