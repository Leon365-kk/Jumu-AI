import { motion } from 'motion/react';
import { Layout } from '@/components/Layout';
import { Sparkles, ArrowRight, Gamepad2, Brain, Eye } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import SEO from '@/lib/SEO';

export default function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = () => {
    navigate('/onboarding/basic-questions');
  };

  return (
    <Layout hideNav>
      <SEO
        title="Welcome to Jumu AI"
        description="Welcome! Let us learn about you through a few quick questions and fun cognitive games."
        canonical="https://jumu.ai/welcome"
      />
      <div className="h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <Sparkles className="w-12 h-12 text-primary" />
          </motion.div>

          <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface mb-4">
            Welcome to Jumu AI
          </h1>
          <p className="text-on-surface-variant text-lg mb-8 leading-relaxed">
            We will get to know you with a few quick questions and two fun cognitive games.
            Your results help us build a personalized learning plan just for you.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-white p-4 rounded-2xl border border-surface-container">
              <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-bold text-on-surface">Memory Match</p>
              <p className="text-xs text-on-surface-muted">Working memory</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-surface-container">
              <Eye className="w-8 h-8 text-tertiary mx-auto mb-2" />
              <p className="text-sm font-bold text-on-surface">Spot the Difference</p>
              <p className="text-xs text-on-surface-muted">Visual attention</p>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full bg-primary text-white p-5 rounded-2xl font-headline font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            Get Started <ArrowRight className="w-6 h-6" />
          </button>
        </motion.div>
      </div>
    </Layout>
  );
}
