import React, { useState } from 'react';
import { 
  Sparkles, 
  Globe, 
  ChevronDown,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Eraser
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-white/5 px-2 xs:px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-8">
        <Link to="/" className="flex items-center gap-1.5 min-w-0">
          <img src="/logo.png" alt="FrameLab Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-lg shrink-0" />
          <span className="text-lg sm:text-2xl font-serif text-primary font-bold tracking-tight truncate hidden xs:block">FrameLab</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted">
          <Link to="/studio" className="hover:text-primary transition-colors">{t('nav.studio')}</Link>
          <Link to="/editor" className="hover:text-primary transition-colors">تعديل الصور (AI)</Link>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-1 text-[11px] sm:text-sm text-muted hover:text-white transition-colors"
        >
          <Globe size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="truncate">{i18n.language === 'ar' ? 'EN' : 'AR'}</span>
        </button>

        {user ? (
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 pr-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5"
            >
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-8 h-8 rounded-full object-cover border border-primary/20"
              />
              <span className="text-sm font-medium text-white hidden sm:block">{user.name.split(' ')[0]}</span>
              <ChevronDown size={14} className={`text-muted transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 mt-2 w-48 glass-card border border-white/10 shadow-2xl overflow-hidden py-2"
                >
                  <div className="px-4 py-2 mb-2 border-b border-white/5">
                    <p className="text-xs text-muted truncate">{user.email}</p>
                  </div>
                  
                  <Link 
                    to="/studio" 
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <LayoutDashboard size={16} />
                    <span>استوديو أعمالي</span>
                  </Link>
                  
                  <Link 
                    to="/watermark-remover" 
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Eraser size={16} />
                    <span>إزالة العلامة المائية</span>
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors mt-1"
                  >
                    <LogOut size={16} />
                    <span>تسجيل الخروج</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link to="/login" className="primary-button text-[11px] sm:text-sm px-3 sm:px-6 py-1.5 sm:py-2 whitespace-nowrap">
            {t('nav.login')}
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
