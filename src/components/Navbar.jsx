import React, { useState } from 'react';
import { 
  Sparkles, 
  Globe, 
  ChevronDown,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Eraser,
  Menu,
  X,
  Video,
  Wand2,
  Tags,
  Image as ImageIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
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
        <Link to="/" className="flex items-center gap-1 sm:gap-1.5 min-w-0 shrink-0">
          <img src="/logo.png" alt="FrameLab Logo" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 object-contain rounded-lg shrink-0" />
          <span className="text-sm sm:text-lg md:text-2xl font-serif text-primary font-bold tracking-tight truncate hidden xxs:block">FrameLab</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white">
          <Link to="/studio" className="hover:text-primary transition-colors">Studio</Link>
          <Link to="/editor" className="hover:text-primary transition-colors">تعديل الصور (AI)</Link>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-1 text-[11px] sm:text-sm text-white hover:text-primary transition-colors"
        >
          <Globe size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="truncate">{i18n.language === 'ar' ? 'EN' : 'AR'}</span>
        </button>

        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden flex items-center justify-center p-2 text-muted hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
        >
          {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <div className="md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[999]"
            />
              <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="top-menu open fixed top-[56px] sm:top-[64px] left-0 right-0 max-h-[calc(100vh-56px)] overflow-y-auto bg-black/95 backdrop-blur-xl border-b border-white/10 z-[1000] shadow-2xl"
              role="navigation"
            >
              <div className="flex justify-between items-center p-4 pb-0">
                <span className="text-xl font-bold text-primary px-2">القائمة</span>
                <button 
                  onClick={() => setShowMobileMenu(false)} 
                  className="flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white transition-colors"
                >
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>
              <ul role="list" className="flex flex-col p-4 m-0 list-none gap-2">
                <li>
                  <Link 
                    to="/" 
                    onClick={() => setShowMobileMenu(false)} 
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 text-lg font-medium border border-transparent ${location.pathname === '/' ? 'active bg-primary/10 text-primary border-primary/20' : 'text-gray-300 hover:text-white hover:bg-white/5 hover:border-white/5'}`}
                  >
                    <i className="fa-solid fa-house w-6 text-center text-xl opacity-80"></i> 
                    الرئيسية
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/studio" 
                    onClick={() => setShowMobileMenu(false)} 
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 text-lg font-medium border border-transparent ${location.pathname === '/studio' ? 'active bg-primary/10 text-primary border-primary/20' : 'text-gray-300 hover:text-white hover:bg-white/5 hover:border-white/5'}`}
                  >
                    <i className="fa-solid fa-palette w-6 text-center text-xl opacity-80"></i> 
                    Studio
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/editor" 
                    onClick={() => setShowMobileMenu(false)} 
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 text-lg font-medium border border-transparent ${location.pathname === '/editor' ? 'active bg-primary/10 text-primary border-primary/20' : 'text-gray-300 hover:text-white hover:bg-white/5 hover:border-white/5'}`}
                  >
                    <i className="fa-solid fa-wand-magic-sparkles w-6 text-center text-xl opacity-80"></i> 
                    تعديل الصور (AI)
                  </Link>
                </li>
                
                <li className="mt-4 pt-4 border-t border-white/10">
                  <button 
                    onClick={() => { toggleLanguage(); setShowMobileMenu(false); }}
                    className="w-full flex items-center justify-between px-5 py-4 bg-white/5 rounded-xl text-white transition-colors hover:bg-white/10 border border-white/5"
                  >
                     <div className="flex items-center gap-4">
                       <i className="fa-solid fa-globe w-6 text-center text-xl text-primary"></i>
                       <span className="text-lg font-medium">اللغة / Language</span>
                     </div>
                     <span className="font-bold">{i18n.language.toUpperCase()}</span>
                  </button>
                </li>

                <li>
                  {!user ? (
                    <Link 
                      to="/login" 
                      onClick={() => setShowMobileMenu(false)} 
                      className="w-full flex items-center justify-center gap-3 py-4 mt-2 text-lg text-black font-bold bg-primary hover:bg-primary-hover rounded-xl transition-all active:scale-95"
                    >
                      <i className="fa-solid fa-right-to-bracket text-xl"></i>
                      {t('nav.login')}
                    </Link>
                  ) : (
                    <button 
                      onClick={() => { handleLogout(); setShowMobileMenu(false); }}
                      className="w-full py-4 mt-2 text-red-400 font-bold bg-red-400/10 rounded-xl hover:bg-red-400/20 transition-colors flex items-center justify-center gap-3 text-lg"
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket text-xl"></i>
                      تسجيل الخروج
                    </button>
                  )}
                </li>
              </ul>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
