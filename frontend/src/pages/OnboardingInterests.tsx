import { motion } from 'motion/react';
import { Layout } from '@/components/Layout';
import { Heart, ArrowRight, ChevronLeft, Book, Calculator, Globe, Music, Palette, Microscope, PenTool } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import SEO from '@/lib/SEO';

const INTERESTS = [
  { value: 'reading', label: 'Reading', icon: <Book className="w-5 h-5" /> },
  { value: 'math', label: 'Math', icon: <Calculator className="w-5 h-5" /> },
  { value: 'science', label: 'Science', icon: <Microscope className="w-5 h-5" /> },
  { value: 'geography', label: 'Geography', icon: <Globe className="w-5 h-5" /> },
  { value: 'music', label: 'Music', icon: <Music className="w-5 h-5" /> },
  { value: 'art', label: 'Art', icon: <Palette className="w-5 h-5" /> },
  { value: 'writing', label: 'Writing', icon: <PenTool className="w-5 h-5" /> },
];

export default function OnboardingInterests() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleContinue = () => {
    localStorage.setItem('onboarding_interests', JSON.stringify(selectedInterests));
    navigate('/onboarding/assessment');
  };

  return (
    <Layout hideNav>
      <SEO
        title="Interests — Jumu AI"
        description="Select your interests for personalized content recommendations."
        canonical="https://jumu.ai/onboarding/interests"
      />
      <div className="h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <button
            onClick={() => navigate('/onboarding/style')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Heart className="w-10 h-10 text-primary" />
          </div>

          <h1 className="font-headline text-3xl font-extrabold text-primary mb-2 text-center">
            What interests you?
          </h1>
          <p className="text-on-surface-variant mb-8 text-center">
            Select topics you enjoy learning about.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            {INTERESTS.map((interest) => (
              <button
                key={interest.value}
                onClick={() => toggleInterest(interest.value)}
                className={`px-5 py-3 rounded-2xl border-2 transition-all flex items-center gap-2 ${
                  selectedInterests.includes(interest.value)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-surface-container-highest bg-white hover:border-primary/50'
                }`}
              >
                {interest.icon}
                <span className="font-bold">{interest.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleContinue}
            disabled={selectedInterests.length === 0}
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