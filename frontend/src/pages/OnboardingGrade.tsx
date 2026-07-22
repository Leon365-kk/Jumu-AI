import { motion } from 'motion/react';
import { Layout } from '@/components/Layout';
import { BookOpen, ArrowRight, ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import SEO from '@/lib/SEO';

const GRADE_LEVELS = [
  { value: 'K', label: 'Kindergarten' },
  { value: '1', label: 'Grade 1' },
  { value: '2', label: 'Grade 2' },
  { value: '3', label: 'Grade 3' },
  { value: '4', label: 'Grade 4' },
  { value: '5', label: 'Grade 5' },
  { value: '6', label: 'Grade 6' },
  { value: '7', label: 'Grade 7' },
  { value: '8', label: 'Grade 8' },
  { value: '9', label: 'Grade 9' },
  { value: '10', label: 'Grade 10' },
  { value: '11', label: 'Grade 11' },
  { value: '12', label: 'Grade 12' },
  { value: 'college', label: 'College/University' },
];

export default function OnboardingGrade() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [selectedGrade, setSelectedGrade] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleContinue = () => {
    if (selectedGrade) {
      localStorage.setItem('onboarding_grade', selectedGrade);
      navigate('/onboarding/style');
    }
  };

  return (
    <Layout hideNav>
      <SEO
        title="Grade Level — Jumu AI"
        description="Select your grade level for personalized learning recommendations."
        canonical="https://jumu.ai/onboarding/grade"
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
            <BookOpen className="w-10 h-10 text-primary" />
          </div>

          <h1 className="font-headline text-3xl font-extrabold text-primary mb-2 text-center">
            What's your grade level?
          </h1>
          <p className="text-on-surface-variant mb-8 text-center">
            This helps us personalize content for your learning level.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {GRADE_LEVELS.map((grade) => (
              <button
                key={grade.value}
                onClick={() => setSelectedGrade(grade.value)}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  selectedGrade === grade.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-surface-container-highest bg-white hover:border-primary/50'
                }`}
              >
                <span className="font-bold">{grade.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleContinue}
            disabled={!selectedGrade}
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