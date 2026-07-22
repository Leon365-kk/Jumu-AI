import { motion } from 'motion/react';
import { Layout } from '@/components/Layout';
import { Shield, ArrowRight, ChevronLeft, Mail, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import SEO from '@/lib/SEO';
import { submitGuardianConsent } from '@/services/onboardingService';
import type { AgeCheckResult } from '@/lib/onboarding';

export default function OnboardingGuardian() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ageResult, setAgeResult] = useState<AgeCheckResult | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const stored = localStorage.getItem('onboarding_age_check');
    if (stored) {
      try {
        setAgeResult(JSON.parse(stored));
      } catch {
        navigate('/onboarding/age');
      }
    } else {
      navigate('/onboarding/age');
    }
  }, [user, navigate]);

  const handleContinue = async () => {
    if (!guardianEmail || !guardianName) {
      setError('Please provide both guardian name and email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guardianEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await submitGuardianConsent(user!.id, guardianEmail, guardianName);
      navigate('/onboarding/disability');
    } catch (err: any) {
      setError(err.message || 'Failed to submit guardian consent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ageResult) {
    return null;
  }

  return (
    <Layout hideNav>
      <SEO
        title="Guardian Consent — Jumu AI"
        description="A parent or guardian needs to help set up your account."
        canonical="https://jumu.ai/onboarding/guardian"
      />
      <div className="h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <button
            onClick={() => navigate('/onboarding/age')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Shield className="w-10 h-10 text-primary" />
          </div>

          <h1 className="font-headline text-3xl font-extrabold text-primary mb-2 text-center">
            Guardian consent needed
          </h1>
          <p className="text-on-surface-variant mb-8 text-center">
            Since you're under 13, we need a parent or guardian to help set up your account. Their email will receive a confirmation.
          </p>

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Guardian's full name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-muted" />
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-surface-container-highest rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Guardian's email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-muted" />
                <input
                  type="email"
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  placeholder="guardian@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-surface-container-highest rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
              </div>
            </div>
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
            <span>We take child safety seriously. Read our Privacy Policy.</span>
          </div>

          <button
            onClick={handleContinue}
            disabled={isSubmitting}
            className="w-full bg-primary text-white p-5 rounded-2xl font-headline font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Submit & Continue</span>
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </motion.div>
      </div>
    </Layout>
  );
}
