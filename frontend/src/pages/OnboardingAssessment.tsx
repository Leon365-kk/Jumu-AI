import { motion } from 'motion/react';
import { Layout } from '@/components/Layout';
import { CheckCircle, ArrowRight, ChevronLeft, BookOpen, Calculator, Brain } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import SEO from '@/lib/SEO';
import { getStudentOnboardingData } from '@/lib/onboarding';
import { persistStudentOnboarding } from '@/services/onboardingService';

interface Question {
  id: string;
  category: 'reading' | 'math' | 'focus';
  question: string;
  options: string[];
  correctAnswer: number;
}

const ASSESSMENT_QUESTIONS: Question[] = [
  // Reading questions
  {
    id: 'r1',
    category: 'reading',
    question: 'What is the main idea of a passage called?',
    options: ['Summary', 'Main Idea', 'Theme', 'Conclusion'],
    correctAnswer: 1
  },
  {
    id: 'r2',
    category: 'reading',
    question: 'What does the word "ambiguous" mean?',
    options: ['Clear', 'Unclear', 'Important', 'Long'],
    correctAnswer: 1
  },
  // Math questions
  {
    id: 'm1',
    category: 'math',
    question: 'What is 15 × 4?',
    options: ['40', '50', '60', '70'],
    correctAnswer: 2
  },
  {
    id: 'm2',
    category: 'math',
    question: 'If x + 5 = 12, what is x?',
    options: ['5', '7', '12', '17'],
    correctAnswer: 1
  },
  // Focus questions
  {
    id: 'f1',
    category: 'focus',
    question: 'How long can you concentrate on a task without distraction?',
    options: ['5 minutes', '15 minutes', '30 minutes', '1 hour+'],
    correctAnswer: 2
  }
];

export default function OnboardingAssessment() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleNext = () => {
    if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Calculate scores by category
    const scores: Record<string, { correct: number; total: number }> = {
      reading: { correct: 0, total: 0 },
      math: { correct: 0, total: 0 },
      focus: { correct: 0, total: 0 }
    };

    ASSESSMENT_QUESTIONS.forEach(q => {
      scores[q.category].total++;
      if (answers[q.id] === q.correctAnswer) {
        scores[q.category].correct++;
      }
    });

    // Store assessment results
    localStorage.setItem('onboarding_assessment', JSON.stringify({
      scores,
      answers
    }));

    try {
      if (user && user.id !== 'guest-user') {
        const profile = getStudentOnboardingData();
        await persistStudentOnboarding(user.id, {
          gradeLevel: profile.gradeLevel,
          learningStyle: profile.learningStyle,
          interests: profile.interests,
          birthDate: profile.birthDate,
          disabilityTypes: profile.disabilityTypes,
          accessibilityNeeds: profile.accessibilityNeeds,
          guardianEmail: profile.guardianEmail
        });
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to persist onboarding:', error);
      navigate('/dashboard');
    }
  };

  const question = ASSESSMENT_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100;

  return (
    <Layout hideNav>
      <SEO
        title="Quick Assessment — Jumu AI"
        description="Complete a quick assessment to personalize your learning experience."
        canonical="https://jumu.ai/onboarding/assessment"
      />
      <div className="h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 text-on-surface-variant hover:text-primary disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="text-sm font-bold text-on-surface-variant">
              {currentQuestion + 1} of {ASSESSMENT_QUESTIONS.length}
            </div>
          </div>

          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            {question.category === 'reading' && <BookOpen className="w-10 h-10 text-primary" />}
            {question.category === 'math' && <Calculator className="w-10 h-10 text-primary" />}
            {question.category === 'focus' && <Brain className="w-10 h-10 text-primary" />}
          </div>

          <h1 className="font-headline text-2xl font-extrabold text-primary mb-2 text-center">
            {question.category === 'reading' && 'Reading'}
            {question.category === 'math' && 'Math'}
            {question.category === 'focus' && 'Focus'}
          </h1>
          <p className="text-on-surface-variant mb-8 text-center">
            {question.question}
          </p>

          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(question.id, index)}
                className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                  answers[question.id] === index
                    ? 'border-primary bg-primary/10'
                    : 'border-surface-container-highest bg-white hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[question.id] === index ? 'border-primary' : 'border-surface-container-highest'
                  }`}>
                    {answers[question.id] === index && (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="w-full h-2 bg-surface-container-highest rounded-full mb-8">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-primary rounded-full"
            />
          </div>

          {currentQuestion < ASSESSMENT_QUESTIONS.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={answers[question.id] === undefined}
              className="w-full bg-primary text-white p-5 rounded-2xl font-headline font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
            >
              Next
              <ArrowRight className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(answers).length < ASSESSMENT_QUESTIONS.length}
              className="w-full bg-primary text-white p-5 rounded-2xl font-headline font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Complete Setup</span>
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}