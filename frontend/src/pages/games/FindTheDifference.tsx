import { motion } from 'motion/react';
import { Layout } from '@/components/Layout';
import { ArrowRight, RotateCcw, Trophy, Eye, Target } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import { submitGameTelemetry } from '@/services/onboardingService';
import SEO from '@/lib/SEO';

type Difference = { id: string; x: number; y: number };
type Turn = {
  round: number;
  found: string[];
  clicks: number;
  falsePositives: number;
  durationMs: number;
};

  const SCENES = [
    {
      id: 's1',
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      objects: [
        { id: 'o1', x: 20, y: 30, char: '☀️', size: 'text-4xl' },
        { id: 'o2', x: 70, y: 20, char: '⛅', size: 'text-4xl' },
        { id: 'o3', x: 50, y: 60, char: '🏠', size: 'text-5xl' },
        { id: 'o4', x: 20, y: 70, char: '🌳', size: 'text-4xl' },
        { id: 'o5', x: 80, y: 70, char: '🌳', size: 'text-4xl' },
      ],
      differences: [
        { id: 'o1', x: 20, y: 30, change: '☀️ → ⛅' },
        { id: 'o5', x: 80, y: 70, change: '🌳 → 🌲' },
      ]
    },
    {
      id: 's2',
      bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
      objects: [
        { id: 'o1', x: 30, y: 25, char: '🐶', size: 'text-4xl' },
        { id: 'o2', x: 70, y: 25, char: '🐱', size: 'text-4xl' },
        { id: 'o3', x: 50, y: 55, char: '🦴', size: 'text-3xl' },
        { id: 'o4', x: 20, y: 75, char: '🧶', size: 'text-3xl' },
        { id: 'o5', x: 80, y: 75, char: '🐟', size: 'text-3xl' },
      ],
      differences: [
        { id: 'o1', x: 30, y: 25, change: '🐶 → 🐩' },
        { id: 'o5', x: 80, y: 75, change: '🐟 → 🦈' },
      ]
    }
  ];

export default function FindTheDifference() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [round, setRound] = useState(0);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [clicks, setClicks] = useState(0);
  const [falsePositives, setFalsePositives] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'playing' | 'complete'>('intro');

  const scene = SCENES[round];

  const startRound = useCallback(() => {
    setFound([]);
    setClicks(0);
    setFalsePositives(0);
    setStartTime(Date.now());
    setPhase('playing');
  }, []);

  useEffect(() => {
    if (phase === 'intro' && user) {
      startRound();
    }
  }, [phase, user, startRound]);

  const handlePanelClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;

    const newClicks = clicks + 1;
    setClicks(newClicks);

    const hit = scene.differences.find(d => Math.abs(d.x - px) < 8 && Math.abs(d.y - py) < 8);
    if (hit && !found.includes(hit.id)) {
      setFound(prev => [...prev, hit.id]);
    } else {
      setFalsePositives(prev => prev + 1);
    }
  };

  const finishRound = () => {
    setTurns(prev => [...prev, {
      round,
      found,
      clicks,
      falsePositives,
      durationMs: Date.now() - startTime
    }]);
  };

  const nextRound = () => {
    finishRound();
    if (round + 1 < SCENES.length) {
      setRound(r => r + 1);
      startRound();
    } else {
      setPhase('complete');
    }
  };

  const submitResults = async () => {
    try {
      if (!user || user.id === 'guest-user') {
        localStorage.setItem('onboarding_games_completed', 'true');
        navigate('/dashboard');
        return;
      }

      const totalFound = turns.reduce((sum, t) => sum + t.found.length, 0);
      const totalFalse = turns.reduce((sum, t) => sum + t.falsePositives, 0);
      const totalDuration = turns.reduce((sum, t) => sum + t.durationMs, 0);

      await submitGameTelemetry({
        userId: user.id,
        game: 'find-difference',
        gameVersion: '1.0',
        turns,
        metrics: {
          totalDifferencesFound: totalFound,
          totalFalsePositives: totalFalse,
          totalRounds: SCENES.length,
          durationMs: totalDuration,
          efficiency: totalFound / Math.max(1, totalFound + totalFalse)
        },
        completed: true,
        xpEarned: 150
      });

      localStorage.setItem('onboarding_games_completed', 'true');
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to submit results:', err);
      localStorage.setItem('onboarding_games_completed', 'true');
      navigate('/dashboard');
    }
  };

  if (phase === 'complete') {
    const totalFound = turns.reduce((sum, t) => sum + t.found.length, 0);
    const totalDiffs = SCENES.reduce((s, sc) => s + sc.differences.length, 0);
    return (
      <Layout hideNav>
        <SEO title="Assessment Complete" description="Your visual attention assessment is complete." />
        <div className="h-screen flex flex-col items-center justify-center px-6">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="font-headline text-3xl font-extrabold text-primary mb-2">Assessment Complete!</h2>
            <p className="text-on-surface-variant mb-8">You found {totalFound} of {totalDiffs} differences.</p>
            <div className="bg-white p-6 rounded-2xl border border-surface-container mb-8">
              <p className="text-4xl font-bold text-on-surface mb-1">{Math.round((totalFound / totalDiffs) * 100)}%</p>
              <p className="text-sm text-on-surface-muted">Accuracy</p>
            </div>
            <button onClick={submitResults} className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2 mx-auto">
              Go to Dashboard <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNav>
      <SEO title="Spot the Difference — Jumu AI" description="Find the differences to assess your visual attention." />
      <div className="h-screen flex flex-col items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-on-surface-variant">Round {round + 1} / {SCENES.length}</span>
            <span className="text-sm font-bold text-primary">{found.length} / {scene.differences.length} found</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`${scene.bg} rounded-2xl border-2 border-surface-container h-64 relative overflow-hidden shadow-inner`}>
              <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30 select-none pointer-events-none">
                Original
              </div>
              {scene.objects.map(obj => (
                <div key={obj.id} className="absolute" style={{ left: `${obj.x}%`, top: `${obj.y}%`, transform: 'translate(-50%, -50%)' }}>
                  <span className={obj.size}>{obj.char}</span>
                </div>
              ))}
            </div>

            <div
              onClick={handlePanelClick}
              className={`${scene.bg} rounded-2xl border-2 border-primary h-64 relative overflow-hidden cursor-pointer shadow-lg`}
            >
              <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30 select-none pointer-events-none">
                Find it!
              </div>
              {scene.objects.map(obj => {
                const diff = scene.differences.find(d => d.id === obj.id);
                if (diff) {
                  return (
                    <div key={obj.id} className="absolute" style={{ left: `${diff.x}%`, top: `${diff.y}%`, transform: 'translate(-50%, -50%)' }}>
                      <span className={`${obj.size} ${found.includes(diff.id) ? 'opacity-40' : ''}`}>
                        {diff.change.split(' → ')[1]}
                      </span>
                    </div>
                  );
                }
                return (
                  <div key={obj.id} className="absolute" style={{ left: `${obj.x}%`, top: `${obj.y}%`, transform: 'translate(-50%, -50%)' }}>
                    <span className={obj.size}>{obj.char}</span>
                  </div>
                );
              })}
              {found.map((fid, i) => {
                const diff = scene.differences.find(d => d.id === fid);
                if (!diff) return null;
                return (
                  <div key={fid} className="absolute pointer-events-none" style={{ left: `${diff.x}%`, top: `${diff.y - 8}%`, transform: 'translate(-50%, -50%)' }}>
                    <Target className="w-6 h-6 text-success" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-2">
              {scene.differences.map(d => (
                <div key={d.id} className={`w-8 h-2 rounded-full ${found.includes(d.id) ? 'bg-success' : 'bg-surface-container-highest'}`} />
              ))}
            </div>
            {found.length === scene.differences.length && (
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={nextRound} className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                {round + 1 < SCENES.length ? 'Next Round' : 'Finish'} <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
