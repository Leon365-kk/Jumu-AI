import { motion } from 'motion/react';
import { Layout } from '@/components/Layout';
import { Heart, ArrowRight, ChevronLeft, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import SEO from '@/lib/SEO';
import { assessDisability } from '@/services/onboardingService';
import type { DisabilityAssessmentResult } from '@/lib/onboarding';

const DISABILITY_OPTIONS = [
  { value: 'visual', label: 'Visual', description: 'Blindness, low vision, or visual processing' },
  { value: 'auditory', label: 'Auditory', description: 'Deafness or hard of hearing' },
  { value: 'cognitive', label: 'Cognitive', description: 'Dyslexia, ADHD, autism, or memory issues' },
  { value: 'physical', label: 'Physical', description: 'Motor impairment or mobility needs' },
  { value: 'speech', label: 'Speech', description: 'Speech impairment or communication needs' },
  { value: 'mental_health', label: 'Mental Health', description: 'Anxiety, depression, or sensory needs' },
  { value: 'neurodivergent', label: 'Neurodivergent', description: 'Autism spectrum or sensory processing' },
  { value: 'none', label: 'None', description: 'I don\'t have specific accessibility needs' },
];

export default function OnboardingDisability() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<DisabilityAssessmentResult | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const toggleType = (value: string) => {
    if (value === 'none') {
      setSelectedTypes(['none']);
      return;
    }
    setSelectedTypes(prev =>
      prev.includes(value)
        ? prev.filter(t => t !== value && t !== 'none')
        : [...prev.filter(t => t !== 'none'), value]
    );
  };

  const handleContinue = async () => {
    setIsSubmitting(true);

    try {
      const data = await assessDisability(user!.id, freeText, selectedTypes);
      setResult(data);
      localStorage.setItem('onboarding_disability', JSON.stringify(data));

      setTimeout(() => {
        navigate('/onboarding/grade');
      }, 1500);
    } catch (err: any) {
      console.error('Disability assessment error:', err);
      // Continue anyway - don't block onboarding
      navigate('/onboarding/grade');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout hideNav>
      <SEO
        title="Accessibility Needs — Jumu AI"
        description="Tell us about any accessibility needs so we can personalize your experience."
        canonical="https://jumu.ai/onboarding/disability"
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
            <Heart className="w-10 h-10 text-primary" />
          </div>

          <h1 className="font-headline text-3xl font-extrabold text-primary mb-2 text-center">
            Accessibility needs
          </h1>
          <p className="text-on-surface-variant mb-8 text-center">
            Select any that apply, or describe your needs. This helps us personalize Jumu AI for you.
          </p>

          {!result ? (
            <>
              <div className="flex flex-wrap gap-2 mb-6">
                {DISABILITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleType(option.value)}
                    className={`px-4 py-2 rounded-xl border-2 transition-all text-sm ${
                      selectedTypes.includes(option.value)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-surface-container-highest bg-white hover:border-primary/50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Tell us more (optional)
                </label>
                <textarea
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder="Describe any specific accommodations or features that would help you learn better..."
                  rows={3}
                  className="w-full bg-white border-2 border-surface-container-highest rounded-2xl px-4 py-3 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
                />
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
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-2">
                Thanks for sharing!
              </h3>
              <p className="text-on-surface-variant">
                We'll personalize Jumu AI to fit your needs.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
