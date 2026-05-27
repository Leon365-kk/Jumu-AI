import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from '@/components/Layout';
import { 
  CloudRain, 
  Wind, 
  Trees, 
  Waves, 
  Timer, 
  Moon, 
  Sun, 
  Play, 
  Pause, 
  RefreshCw, 
  Zap, 
  Sparkles,
  Volume2,
  VolumeX,
  ChevronRight,
  Brain
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { TapEffect } from '@/components/TapEffect';
import SEO from '@/lib/SEO';
import { TodoList } from '@/components/TodoList';

interface Sound {
  id: string;
  name: string;
  icon: React.ReactNode;
  url: string;
  color: string;
}

const SOUNDS: Sound[] = [
  { id: 'rain', name: 'Soft Rain', icon: <CloudRain className="w-6 h-6" />, url: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3', color: 'bg-blue-500' },
  { id: 'forest', name: 'Morning Forest', icon: <Trees className="w-6 h-6" />, url: 'https://assets.mixkit.co/active_storage/sfx/131/131-preview.mp3', color: 'bg-emerald-500' },
  { id: 'waves', name: 'Ocean Waves', icon: <Waves className="w-6 h-6" />, url: 'https://assets.mixkit.co/active_storage/sfx/1188/1188-preview.mp3', color: 'bg-teal-500' },
  { id: 'white', name: 'Deep Focus', icon: <Wind className="w-6 h-6" />, url: 'https://assets.mixkit.co/active_storage/sfx/2405/2405-preview.mp3', color: 'bg-stone-500' }
];

export default function FocusZone() {
  const { t, addXP } = useApp();
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Visual Fidget State
  const [fidgetPos, setFidgetPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (interval) clearInterval(interval);
      // Award XP for completing a focus session
      addXP(50, "Great focus session! Your mind is now ready for learning.");
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, addXP]);

  const toggleSound = (soundId: string) => {
    if (activeSound === soundId) {
      setActiveSound(null);
      if (audioRef.current) audioRef.current.pause();
    } else {
      setActiveSound(soundId);
      const sound = SOUNDS.find(s => s.id === soundId);
      if (sound) {
        if (audioRef.current) {
          audioRef.current.src = sound.url;
          audioRef.current.loop = true;
          audioRef.current.volume = volume;
          audioRef.current.play();
        }
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timerProgress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <Layout>
      <SEO
        title="Focus Zone — Jumu AI"
        description="Enter the Focus Zone — a sensory-friendly environment with ambient white noise, pink noise, and rain sounds to help neurodiverse learners find their calm."
        canonical="https://jumu.ai/focus-zone"
        ogType="website"
      />
      <div className="max-w-6xl mx-auto px-6 pb-32">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-tertiary/10 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-tertiary" />
            </div>
            <h2 className="font-headline text-4xl font-extrabold text-tertiary">Calm Zone</h2>
          </div>
          <p className="text-on-surface-variant text-lg">A peaceful space to regulate your senses and find your focus.</p>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visual Fidget & Timer */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              className="bg-white rounded-[40px] p-8 border-2 border-surface-container-highest shadow-sm relative overflow-hidden h-[400px] flex items-center justify-center cursor-none"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setFidgetPos({
                  x: ((e.clientX - rect.left) / rect.width) * 100,
                  y: ((e.clientY - rect.top) / rect.height) * 100
                });
              }}
            >
              {/* Interactive Gradient Fidget */}
              <div 
                className="absolute inset-0 transition-colors duration-1000"
                style={{
                  background: `radial-gradient(circle at ${fidgetPos.x}% ${fidgetPos.y}%, rgba(var(--color-primary-rgb), 0.15) 0%, transparent 50%)`
                }}
              />
              
              <div className="relative z-10 text-center">
                <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
                  {/* Visual Timer Ring */}
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="128" cy="128" r="120"
                      className="fill-none stroke-surface-container-high"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="128" cy="128" r="120"
                      className="fill-none stroke-tertiary"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={120 * 2 * Math.PI}
                      animate={{ strokeDashoffset: (1 - timerProgress / 100) * (120 * 2 * Math.PI) }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-headline font-black text-on-surface tabular-nums">
                      {formatTime(timeLeft)}
                    </span>
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-2">Focus Time</span>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <TapEffect>
                    <button 
                      onClick={() => setIsActive(!isActive)}
                      className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
                        isActive ? 'bg-surface-container-highest text-primary' : 'bg-primary text-white'
                      }`}
                    >
                      {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                    </button>
                  </TapEffect>
                  <button 
                    onClick={() => { setTimeLeft(25 * 60); setIsActive(false); }}
                    className="w-16 h-16 rounded-full bg-surface-container-low text-stone-500 flex items-center justify-center hover:bg-surface-container-high transition-all"
                  >
                    <RefreshCw className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Fidget Cursor */}
              <motion.div 
                animate={{ x: fidgetPos.x * 4 - 200, y: fidgetPos.y * 4 - 200 }}
                className="absolute pointer-events-none"
              >
                <div className="w-12 h-12 bg-primary/20 rounded-full blur-xl animate-pulse" />
              </motion.div>
            </motion.div>

            <div className="bg-primary/5 p-8 rounded-[32px] border border-primary/10 flex gap-6 items-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shrink-0">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-headline font-bold text-xl text-primary mb-1">Visual Fidget</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Gently move your mouse or finger across the panel above. The light follows you, helping to ground your focus and regulate your senses.
                </p>
              </div>
            </div>
          </div>

          {/* Soundscapes */}
          <div className="space-y-6">
            <h3 className="font-headline text-2xl font-bold text-on-surface px-2">Ambient Sounds</h3>
            <div className="grid grid-cols-1 gap-4">
              {SOUNDS.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => toggleSound(sound.id)}
                  className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between group ${
                    activeSound === sound.id 
                      ? `${sound.color} border-transparent text-white shadow-xl scale-[1.02]` 
                      : 'bg-white border-surface-container-highest text-on-surface hover:border-primary/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      activeSound === sound.id ? 'bg-white/20' : 'bg-surface-container-low text-stone-500'
                    }`}>
                      {sound.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-bold">{sound.name}</div>
                      <div className={`text-[10px] uppercase font-black tracking-widest ${activeSound === sound.id ? 'opacity-80' : 'text-stone-400'}`}>
                        {activeSound === sound.id ? 'Now Playing' : 'Calm Loop'}
                      </div>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    activeSound === sound.id ? 'bg-white text-primary' : 'bg-surface-container-low text-stone-300 opacity-0 group-hover:opacity-100'
                  }`}>
                    {activeSound === sound.id ? <Volume2 className="w-5 h-5" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-3xl p-6 border border-surface-container-highest">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Master Volume</label>
                <div className="text-xs font-bold text-primary">{Math.round(volume * 100)}%</div>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" value={volume}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setVolume(val);
                  if (audioRef.current) audioRef.current.volume = val;
                }}
                className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Shared task list used on Dashboard and Focus Zone */}
            <TodoList />
          </div>
        </div>

        <audio ref={audioRef} />
      </div>
    </Layout>
  );
}
