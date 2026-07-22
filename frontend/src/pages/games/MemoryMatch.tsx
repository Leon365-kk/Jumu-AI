import { motion } from 'motion/react';
import { Layout } from '@/components/Layout';
import { ArrowRight, RotateCcw, Trophy, Brain } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import { submitGameTelemetry } from '@/services/onboardingService';
import SEO from '@/lib/SEO';

const EMOJIS = ['🚀', '🌟', '🎵', '🍎', '🐱', '🌈', '⚽', '🎈'];

type Turn = {
  round: number;
  sequence: string[];
  input: string[];
  correct: boolean;
  length: number;
};

export default function MemoryMatch() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [phase, setPhase] = useState<'intro' | 'show' | 'input' | 'result' | 'complete'>('intro');
  const [round, setRound] = useState(1);
  const [sequence, setSequence] = useState<string[]>([]);
  const [input, setInput] = useState<string[]>([]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const maxRounds = 4;

  const startRound = useCallback(() => {
    const length = 3 + round;
    const seq = Array.from({ length }, () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)]);
    setSequence(seq);
    setInput([]);
    setStartTime(Date.now());
    setPhase('show');
  }, [round]);

  useEffect(() => {
    if (phase === 'show') {
      const timer = setTimeout(() => setPhase('input'), 1200 + round * 400);
      return () => clearTimeout(timer);
    }
  }, [phase, round]);

  useEffect(() => {
    if (phase === 'intro' && user) {
      startRound();
    }
  }, [phase, user, startRound]);

  const handleCardClick = (emoji: string) => {
    if (phase !== 'input') return;
    const newInput = [...input, emoji];
    setInput(newInput);

    const expected = sequence[newInput.length - 1];
    if (emoji !== expected) {
      setErrors(e => e + 1);
    }

    if (newInput.length === sequence.length) {
      const correct = newInput.every((v, i) => v === sequence[i]);
      setTurns(prev => [...prev, {
        round,
        sequence,
        input: newInput,
        correct,
        length: sequence.length
      }]);
      setPhase('result');
    }
  };

  const submitResults = async () => {
    if (!user || user.id === 'guest-user') {
      navigate('/games/find-difference');
      return;
    }

    const durationMs = Date.now() - startTime;
    const payload = {
      userId: user.id,
      game: 'memory-match',
      gameVersion: '1.0',
      turns,
      metrics: {
        finalSequenceLength: sequence.length,
        totalErrors: errors,
        roundsPlayed: round,
        maxRounds,
        durationMs,
        accuracy: turns.filter(t => t.correct).length / Math.max(1, turns.length)
      },
      completed: round >= maxRounds,
      xpEarned: 100
    };

    try {
      await submitGameTelemetry(payload);
    } catch (e) {
      console.error('Failed to submit game telemetry', e);
    }

    navigate('/games/find-difference');
  };

  const nextRound = () => {
    if (round >= maxRounds) {
      setPhase('complete');
    } else {
      setRound(r => r + 1);
      startRound();
    }
  };

  if (phase === 'complete') {
    const score = turns.filter(t => t.correct).length;
    return (
      <Layout hideNav>
        <SEO title="Memory Match Complete" description="Your working memory assessment is complete." />
        <div className="h-screen flex flex-col items-center justify-center px-6">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="font-headline text-3xl font-extrabold text-primary mb-2">Great Job!</h2>
            <p className="text-on-surface-variant mb-8">You completed {maxRounds} rounds of Memory Match.</p>
            <div className="bg-white p-6 rounded-2xl border border-surface-container mb-8">
              <p className="text-4xl font-bold text-on-surface mb-1">{score} <span className="text-lg font-medium text-on-surface-muted">/ {maxRounds}</span></p>
              <p className="text-sm text-on-surface-muted">Rounds passed</p>
            </div>
            <button onClick={submitResults} className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2 mx-auto">
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNav>
      <SEO title="Memory Match — Jumu AI" description="Play Memory Match to assess your working memory." />
      <div className="h-screen flex flex-col items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-bold text-on-surface-variant">Round {round} / {maxRounds}</span>
            <span className="text-sm font-bold text-primary">{Math.round((round / maxRounds) * 100)}%</span>
          </div>

          {phase === 'show' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <Brain className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
              <p className="text-lg font-bold text-on-surface mb-6">Memorize this sequence</p>
              <div className="flex flex-wrap justify-center gap-3">
                {sequence.map((emoji, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.15 }}
                    className="w-16 h-16 bg-white rounded-2xl border-2 border-primary flex items-center justify-center text-3xl shadow-lg"
                  >
                    {emoji}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'input' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <p className="text-lg font-bold text-on-surface mb-2">Tap the cards in order</p>
              <p className="text-sm text-on-surface-muted mb-6">Repeat the sequence you just saw</p>
              <div className="flex flex-wrap justify-center gap-3">
                {EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleCardClick(emoji)}
                    className="w-16 h-16 bg-white rounded-2xl border-2 border-surface-container-highest flex items-center justify-center text-3xl shadow-md active:scale-95 transition-all hover:border-primary"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-center gap-1">
                {sequence.map((_, i) => (
                  <div key={i} className={`w-8 h-2 rounded-full ${input[i] ? 'bg-primary' : 'bg-surface-container-highest'}`} />
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${turns[turns.length - 1].correct ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                {turns[turns.length - 1].correct ? '✓' : '✗'}
              </div>
              <h3 className="font-headline text-2xl font-extrabold text-on-surface mb-2">
                {turns[turns.length - 1].correct ? 'Correct!' : 'Not quite'}
              </h3>
              <p className="text-on-surface-variant mb-8">
                {turns[turns.length - 1].correct ? 'Great memory!' : 'The sequence was: ' + sequence.join(' ')}
              </p>
              <button onClick={nextRound} className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2 mx-auto">
                {round >= maxRounds ? 'See Results' : 'Next Round'} <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
