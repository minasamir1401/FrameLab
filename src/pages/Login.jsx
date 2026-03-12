import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { loginUser, registerUser, loginWithGoogle } from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const session = await loginUser(formData.email, formData.password);
        login(session);
        navigate('/');
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('كلمات المرور غير متطابقة!');
        }
        if (formData.password.length < 6) {
          throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
        }
        const session = await registerUser(formData.name, formData.email, formData.password);
        login(session);
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const decoded = jwtDecode(credentialResponse.credential);
      const session = loginWithGoogle(decoded);
      login(session);
      navigate('/');
    } catch (err) {
      setError('فشل تسجيل الدخول عبر Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-primary font-bold mb-2">
            {isLogin ? 'مرحباً بك مجدداً' : 'إنشاء حساب جديد'}
          </h1>
          <p className="text-muted text-sm px-4">
            {isLogin ? 'سجل دخولك لمتابعة إبداعاتك في FrameLab' : 'انضم إلينا وابدأ بتوليد الصور والفيديوهات مجاناً'}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1"
              >
                <label className="text-xs font-medium text-stone-400 mr-1">الاسم الكامل</label>
                <div className="relative">
                  <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input 
                    type="text"
                    name="name"
                    required
                    placeholder="أدخل اسمك"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-stone-900 border border-white/5 rounded-xl py-3 pr-12 pl-4 text-white focus:border-primary/50 outline-none transition-all text-right"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            <label className="text-xs font-medium text-stone-400 mr-1">البريد الإلكتروني</label>
            <div className="relative">
              <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500" />
              <input 
                type="email"
                name="email"
                required
                placeholder="example@mail.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-stone-900 border border-white/5 rounded-xl py-3 pr-12 pl-4 text-white focus:border-primary/50 outline-none transition-all text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-stone-400 mr-1">كلمة المرور</label>
            <div className="relative">
              <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500" />
              <input 
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-stone-900 border border-white/5 rounded-xl py-3 pr-12 pl-12 text-white focus:border-primary/50 outline-none transition-all text-left"
                dir="ltr"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1"
              >
                <label className="text-xs font-medium text-stone-400 mr-1">تأكيد كلمة المرور</label>
                <div className="relative">
                  <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-stone-900 border border-white/5 rounded-xl py-3 pr-12 pl-4 text-white focus:border-primary/50 outline-none transition-all text-left"
                    dir="ltr"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={loading}
            className="primary-button w-full py-4 mt-4 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب')}
          </button>
        </form>

        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <span className="relative bg-[#0c0a09] px-4 text-xs text-muted">أو المتابعة عبر</span>
        </div>

        <div className="flex justify-center flex-col items-center">
           <GoogleLogin 
             onSuccess={onGoogleSuccess}
             onError={() => setError('فشل تسجيل الدخول عبر Google')}
             theme="filled_black"
             shape="pill"
             text="continue_with"
             locale="ar"
           />
        </div>

        <div className="mt-8 text-center text-sm">
          <span className="text-muted">
            {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
          </span>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-bold mr-2 hover:underline"
          >
            {isLogin ? 'سجل الآن مجاناً' : 'سجل دخولك هنا'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
