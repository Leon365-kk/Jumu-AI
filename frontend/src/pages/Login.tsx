import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Chrome, 
  User, 
  ArrowRight,
  Target,
  Users,
  BookOpen
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import SEO from '@/lib/SEO';
import { cn } from '@/lib/utils';
import { hasCompletedOnboarding } from '@/lib/onboarding';

export default function Login() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, loginAsGuest, user } = useAuth();
  const navigate = useNavigate();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasCompletedOnboarding()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/welcome');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google login failed.');
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/dashboard');
  };

  return (
    <>
      <SEO
        title="Login — Jumu AI"
        description="Sign in to your Jumu AI account. Access your personalized learning dashboard, track progress, and continue your educational journey."
        canonical="https://jumu.ai/login"
        ogType="website"
      />
      <div className="min-h-screen bg-surface flex">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-dark to-tertiary relative overflow-hidden items-center justify-center p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-tertiary/30 rounded-full blur-2xl -ml-16 -mb-16" />
          
          <div className="relative z-10 max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary font-bold text-xl shadow-lg">
                  J
                </div>
                <span className="font-headline font-bold text-2xl text-white">JumuAI</span>
              </div>
              
              <h2 className="font-headline font-bold text-4xl text-white mb-6 leading-tight">
                Learn smarter, not harder
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-8">
                Join thousands of learners who are already experiencing the future of inclusive education with JumuAI.
              </p>

              <div className="space-y-4">
                {[
                  { icon: BookOpen, text: 'Personalized reading and learning tools' },
                  { icon: Target, text: 'Gamified challenges and achievements' },
                  { icon: Users, text: 'Collaborative learning with peers' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3 text-white/90"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-10">
              <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-lg">
                  J
                </div>
                <span className="font-headline font-bold text-2xl text-on-surface">JumuAI</span>
              </div>
              <h1 className="text-3xl font-headline font-bold text-on-surface mb-2">
                {isRegistering ? 'Create Account' : 'Welcome back'}
              </h1>
              <p className="text-on-surface-muted">
                {isRegistering 
                  ? 'Start your learning journey today' 
                  : 'Sign in to continue your learning journey'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!showEmailForm ? (
                <motion.div
                  key="social"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-surface-container rounded-xl py-4 px-4 text-on-surface font-medium hover:border-primary hover:shadow-md transition-all"
                  >
                    <Chrome className="w-5 h-5" />
                    Continue with Google
                  </button>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-surface-container"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-surface text-on-surface-muted font-medium">New here?</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowEmailForm(true)}
                    className="w-full flex items-center justify-center gap-3 bg-surface-container-low border-2 border-surface-container rounded-xl py-4 px-4 text-on-surface font-medium hover:border-primary hover:text-primary transition-all"
                  >
                    <Mail className="w-5 h-5" />
                    Continue with Email
                  </button>

                  <button
                    onClick={handleGuestLogin}
                    className="w-full flex items-center justify-center gap-3 bg-surface-container-low border-2 border-surface-container rounded-xl py-4 px-4 text-on-surface-muted font-medium hover:border-on-surface-muted transition-all"
                  >
                    <User className="w-5 h-5" />
                    Continue as Guest
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="email"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-muted" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-surface-container rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-on-surface"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-muted" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-surface-container rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-on-surface"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-muted hover:text-on-surface transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm font-medium"
                    >
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {isRegistering ? 'Create Account' : 'Sign In'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(!isRegistering);
                        setError('');
                      }}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      {isRegistering 
                        ? 'Already have an account? Sign in' 
                        : "Don't have an account? Sign up"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowEmailForm(false);
                      setError('');
                    }}
                    className="w-full text-center text-sm text-on-surface-muted hover:text-on-surface transition-colors font-medium"
                  >
                    ← Back to other options
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <p className="text-center text-xs text-on-surface-muted mt-8">
              By continuing, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}

