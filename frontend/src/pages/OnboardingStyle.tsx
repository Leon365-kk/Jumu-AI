import { motion } from 'motion/react';
import { Layout } from '@/components/Layout';
import { Brain, ArrowRight, ChevronLeft, Eye, Ear, Pen, Hand } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import SEO from '@/lib/SEO';

const LEARNING_STYLES = [
  {
    value: 'visual',
    label: 'Visual',
    description: 'Learn best with images, diagrams, and visual aids',
    icon: <Eye className="w-8 h-8" />
  },
  {
    value: 'auditory',
    label: 'Auditory',
    description: 'Learn best by listening and speaking',
    icon: <Ear className="w-8 h-8" />
  },
  {
    value: 'kinesthetic',
    label: 'Kinesthetic',
    description: 'Learn best through hands-on activities',
    icon: <Hand className="w-8 h-8" />
  },
  {
    value: 'reading_writing',
    label: 'Reading/Writing',
    description: 'Learn best through text and written materials',
    icon: <Pen className="w-8 h-8" />
  },
];

export default function OnboardingStyle() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [selectedStyle, setSelectedStyle] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleContinue = () => {
    if (selectedStyle) {
      localStorage.setItem('onboarding_learning_style', selectedStyle);
      navigate('/onboarding/interests');
    }
  };

  return (
    <Layout hideNav>
      <SEO
        title="Learning Style — Jumu AI"
        description="Tell us your preferred learning style for personalized recommendations."
        canonical="https://jumu.ai/onboarding/style"
      />
      <div className="h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <button
            onClick={() => navigate('/onboarding/grade')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Brain className="w-10 h-10 text-primary" />
          </div>

          <h1 className="font-headline text-3xl font-extrabold text-primary mb-2 text-center">
            How do you learn best?
          </h1>
          <p className="text-on-surface-variant mb-8 text-center">
            Select your preferred learning style.
          </p>

          <div className="space-y-3 mb-8">
            {LEARNING_STYLES.map((style) => (
              <button
                key={style.value}
                onClick={() => setSelectedStyle(style.value)}
                className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                  selectedStyle === style.value
                    ? 'border-primary bg-primary/10'
                    : 'border-surface-container-highest bg-white hover:border-primary/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedStyle === style.value ? 'text-primary' : 'text-on-surface-variant'
                }`}>
                  {style.icon}
                </div>
                <div className="text-left">
                  <div className="font-bold text-on-surface">{style.label}</div>
                  <div className="text-sm text-on-surface-variant">{style.description}</div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleContinue}
            disabled={!selectedStyle}
            className="w-full bg-primary text-white p-5 rounded-2xl font-headline font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
          >
            Continue
            <ArrowRight className="w-6 h-6" />
          </button>
        </motion.div>
      </div>
    </Layout>
  );
}