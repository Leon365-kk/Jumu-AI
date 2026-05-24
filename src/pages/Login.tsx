import { motion, AnimatePresence } from 'motion/react';
import { Layout } from '@/components/Layout';
import { Mail, Chrome, ArrowRight, Lock, AlertCircle, Quote, Sparkles, Wand2, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import SEO from '@/lib/SEO';
import React, { useEffect, useState } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const { t, loginWithGoogle, loginWithEmail, registerWithEmail, loginAsGuest, user } = useApp();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/onboarding/name');
    }
  }, [user, navigate]);

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!password.trim()) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (isRegistering) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      if (err.message?.includes('provider is not enabled')) {
        setError('Google login is not enabled in Supabase yet. Please use Email login or enable the provider in your dashboard.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Sign In — Jumu AI"
        description="Sign in to your Jumu AI account. Create with Google or email, or continue as a guest — free to start."
        canonical={typeof window !== 'undefined' ? window.location.origin + '/login' : 'https://jumu.ai/login'}
      />
      <Layout hideNav>
        <div className="min-h-screen flex flex-col lg:flex-row bg-surface">
          {/* Left Side: Visual/Branding (Hidden on mobile) */}
          <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col justify-between p-16">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-white/10 rounded-full blur-3xl" 
              />
              <motion.div 
                animate={{ 
                  scale: [1, 1.5, 1],
                  rotate: [0, -45, 0],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-tertiary/20 rounded-full blur-3xl" 
              />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-12">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <span className="text-3xl font-headline font-black text-white tracking-tight uppercase">Jumu Ai</span>
              </div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-6xl font-headline font-black text-white leading-tight mb-8">
                  Your journey to <br />
                  <span className="text-tertiary-container italic">cognitive ease</span> <br />
                  starts here.
                </h1>
                <p className="text-white/80 text-xl max-w-md leading-relaxed">
                  Unlock the power of your mind with AI-powered reading, writing, and daily assistance tailored to you.
                </p>
              </motion.div>
            </div>

            <div className="relative z-10">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl max-w-sm">
                <Quote className="w-10 h-10 text-tertiary-container mb-4 opacity-50" />
                <p className="text-white font-medium text-lg italic mb-4">
                  "Jumu Ai has completely changed how I process information. It's like having a personal tutor for everything I read."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/20">
                    <Star className="w-5 h-5 text-tertiary-container" />
                  </div>
                  <div>
                    <div className="text-white font-bold">Sarah Jenkins</div>
                    <div className="text-white/60 text-sm">Lifelong Learner</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Auth Form */}
          <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-24">
            <div className="w-full max-w-md mx-auto">
              {/* Mobile Header (Visible only on mobile) */}
              <div className="lg:hidden flex flex-col items-center mb-12 text-center">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="font-headline text-4xl font-black text-primary tracking-tight uppercase mb-2">Jumu Ai</h1>
                <p className="text-on-surface-variant font-medium">{t('tagline')}</p>
              </div>

              <div className="mb-10 text-center lg:text-left">
                <h2 className="text-3xl font-headline font-bold text-on-surface mb-2">
                  {showEmailForm ? (isRegistering ? t('signUp') : t('signIn')) : t('welcome')}
                </h2>
                <p className="text-on-surface-variant">
                  {showEmailForm 
                    ? (isRegistering ? 'Start your cognitive journey today' : 'Welcome back, please log in to continue') 
                    : 'Choose how you want to settle into your sanctuary'}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {!showEmailForm ? (
                  <motion.div 
                    key="social"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-4"
                  >
                    <button 
                      onClick={loginWithGoogle}
                      className="w-full h-16 flex items-center justify-center gap-4 bg-white border-2 border-surface-container-highest rounded-2xl font-headline font-bold hover:bg-surface-container-low transition-all active:scale-[0.98] group"
                    >
                      <Chrome className="w-6 h-6 text-primary transition-transform group-hover:scale-110" />
                      <span className="text-lg">{t('continueGoogle')}</span>
                    </button>
                    
                    <button 
                      onClick={() => setShowEmailForm(true)}
                      className="w-full h-16 flex items-center justify-center gap-4 bg-primary text-white rounded-2xl font-headline font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
                    >
                      <Mail className="w-6 h-6" />
                      <span className="text-lg">{t('continueEmail')}</span>
                    </button>

                    <button 
                      onClick={loginAsGuest}
                      className="w-full h-16 flex items-center justify-center gap-4 bg-surface-container border-2 border-dashed border-stone-300 rounded-2xl font-headline font-bold text-stone-500 hover:bg-surface-container-high transition-all active:scale-[0.98]"
                    >
                      <ArrowRight className="w-6 h-6" />
                      <span className="text-lg">Continue as Guest</span>
                    </button>

                    <div className="pt-8 flex items-center gap-4">
                      <div className="h-[1px] flex-1 bg-surface-container-highest" />
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">New Here?</span>
                      <div className="h-[1px] flex-1 bg-surface-container-highest" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col items-center text-center gap-2">
                        <Wand2 className="w-5 h-5 text-tertiary" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">AI Powered</span>
                      </div>
                      <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col items-center text-center gap-2">
                        <Lock className="w-5 h-5 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">Secure Space</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="email"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleEmailAuth}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-primary transition-colors" />
                        <input 
                          type="email"
                          value={email}
                          required
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t('emailPlaceholder')}
                          className="w-full bg-surface-container-low border-2 border-surface-container-highest rounded-2xl pl-14 pr-5 py-5 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest">Password</label>
                        {!isRegistering && (
                          <button type="button" className="text-xs font-bold text-primary hover:underline transition-all">
                            {t('forgotPassword')}
                          </button>
                        )}
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-primary transition-colors" />
                        <input 
                          type="password"
                          value={password}
                          required
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={t('passwordPlaceholder')}
                          className="w-full bg-surface-container-low border-2 border-surface-container-highest rounded-2xl pl-14 pr-5 py-5 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 text-error text-sm font-bold bg-error/5 p-4 rounded-xl border border-error/10"
                      >
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-16 bg-primary text-white rounded-2xl font-headline font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span className="text-lg">{isRegistering ? t('signUp') : t('signIn')}</span>
                          <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>

                    <div className="flex flex-col items-center gap-4 pt-4">
                      <button 
                        type="button"
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-on-surface-variant font-bold text-sm hover:text-primary transition-colors"
                      >
                        {isRegistering ? t('alreadyAccount') : t('noAccount')}{" "}
                        <span className="text-primary underline decoration-2 underline-offset-4">{isRegistering ? t('signIn') : t('signUp')}</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setShowEmailForm(false);
                          setError('');
                        }}
                        className="flex items-center gap-2 text-stone-400 font-bold text-xs uppercase tracking-widest hover:text-on-surface transition-colors"
                      >
                        {t('backToSocial')}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              <div className="mt-12 text-center">
                <p className="text-[10px] text-stone-400 uppercase font-black tracking-[0.2em] leading-relaxed">
                  {t('agreeTo')} <br />
                  <button className="text-stone-500 hover:text-primary underline">{t('terms')}</button> {t('and')} <button className="text-stone-500 hover:text-primary underline">{t('privacy')}</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
