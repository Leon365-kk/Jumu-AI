import { motion } from 'motion/react';
import { Layout } from '@/components/Layout';
import { Calendar, ArrowRight, ChevronLeft, Shield, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import SEO from '@/lib/SEO';
import { checkAge } from '@/services/onboardingService';
import type { AgeCheckResult } from '@/lib/onboarding';

export default function OnboardingAgeCheck() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [birthDate, setBirthDate] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<AgeCheckResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleContinue = async () => {
    if (!birthDate) {
      setError('Please enter your birth date');
      return;
    }

    setIsChecking(true);
    setError('');

    try {
      const data = await checkAge(user!.id, birthDate);
      setResult(data);

      // Store result for next steps
      localStorage.setItem('onboarding_age_check', JSON.stringify(data));

      // Auto-advance after showing result
      setTimeout(() => {
        if (data.requiresGuardian) {
          navigate('/onboarding/guardian');
        } else {
          navigate('/onboarding/disability');
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to verify age. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const getAgeMessage = () => {
    if (!result) return '';
    if (result.isMinor) {
      if (result.requiresGuardian) {
        return "We need a parent or guardian to help set up your account.";
      }
      return "You're under 18. We'll make sure your account is safe and appropriate.";
    }
    return "Great! You're all set to continue.";
  };

  return (
    <Layout hideNav>
      <SEO
        title="Age Verification — Jumu AI"
        description="Help us keep Jumu AI safe for everyone."
        canonical="https://jumu.ai/onboarding/age"
      />
      <div className="h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <button
            onClick={() => navigate('/onboarding/name')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Calendar className="w-10 h-10 text-primary" />
          </div>

          <h1 className="font-headline text-3xl font-extrabold text-primary mb-2 text-center">
            When were you born?
          </h1>
          <p className="text-on-surface-variant mb-8 text-center">
            This helps us keep Jumu AI safe and appropriate for your age.
          </p>

          {!result ? (
            <>
              <div className="relative mb-6">
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white border-2 border-surface-container-highest rounded-2xl px-6 py-5 text-lg font-headline font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-center"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm font-medium mb-6"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex items-center gap-2 text-xs text-on-surface-muted mb-6 justify-center">
                <Shield className="w-4 h-4" />
                <span>Your information is private and secure</span>
              </div>

              <button
                onClick={handleContinue}
                disabled={isChecking || !birthDate}
                className="w-full bg-primary text-white p-5 rounded-2xl font-headline font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
              >
                {isChecking ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                result.isMinor ? 'bg-warning/10' : 'bg-success/10'
              }`}>
                <Check className={`w-8 h-8 ${result.isMinor ? 'text-warning' : 'text-success'}`} />
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-2">
                {result.isMinor ? "We'll keep you safe!" : "You're all set!"}
              </h3>
              <p className="text-on-surface-variant">
                {getAgeMessage()}
              </p>
              <p className="text-xs text-on-surface-muted mt-4">
                Redirecting...
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
