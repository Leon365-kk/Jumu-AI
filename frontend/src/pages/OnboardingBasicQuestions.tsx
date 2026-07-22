import { motion } from 'motion/react';
import { Layout } from '@/components/Layout';
import { Brain, ArrowRight, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import SEO from '@/lib/SEO';

const STEPS = [
  {
    key: 'grade',
    title: 'What grade are you in?',
    subtitle: 'This helps us match content to your level.',
    options: ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'College', 'Adult Learner'],
  },
  {
    key: 'goal',
    title: 'What is your main learning goal?',
    subtitle: 'Pick the area you want to improve the most.',
    options: ['Reading', 'Math', 'Focus', 'All of the above'],
  },
  {
    key: 'style',
    title: 'How do you learn best?',
    subtitle: 'We will tailor tools to your preference.',
    options: ['Visual', 'Auditory', 'Hands-on', 'Reading / Writing'],
  },
];

export default function OnboardingBasicQuestions() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const current = STEPS[step];

  const handleSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [current.key]: value }));
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('onboarding_basic_questions', JSON.stringify(answers));
      navigate('/games/memory-match');
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <Layout hideNav>
      <SEO
        title="Personalize Your Experience — Jumu AI"
        description="Tell us a bit about yourself so we can build the right learning plan."
        canonical="https://jumu.ai/onboarding/basic-questions"
      />
      <div className="h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-8">
            <span className="text-sm font-bold text-on-surface-variant">
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
          </div>

          <div className="w-full h-2 bg-surface-container-highest rounded-full mb-10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-primary rounded-full"
            />
          </div>

          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Brain className="w-10 h-10 text-primary" />
          </div>

          <h1 className="font-headline text-2xl font-extrabold text-primary mb-2 text-center">
            {current.title}
          </h1>
          <p className="text-on-surface-variant mb-8 text-center">{current.subtitle}</p>

          <div className="space-y-3 mb-10">
            {current.options.map(option => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`w-full p-4 rounded-2xl border-2 transition-all text-left font-medium ${
                  answers[current.key] === option
                    ? 'border-primary bg-primary/10'
                    : 'border-surface-container-highest bg-white hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers[current.key] === option ? 'border-primary' : 'border-surface-container-highest'
                    }`}
                  >
                    {answers[current.key] === option && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 bg-primary rounded-full"
                      />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!answers[current.key]}
            className="w-full bg-primary text-white p-5 rounded-2xl font-headline font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
          >
            {step < STEPS.length - 1 ? (
              <>
                Next <ArrowRight className="w-6 h-6" />
              </>
            ) : (
              <>
                Start Games <Sparkles className="w-6 h-6" />
              </>
            )}
          </button>
        </motion.div>
      </div>
    </Layout>
  );
}
