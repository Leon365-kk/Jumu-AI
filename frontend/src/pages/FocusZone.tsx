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
  Volume2,
  VolumeX,
  ChevronRight,
  ListTodo,
  X,
  Target
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { TapEffect } from '@/components/TapEffect';
import SEO from '@/lib/SEO';
import { TodoList, Todo } from '@/components/TodoList';
import { TaskDetailModal } from '@/components/TaskDetailModal';

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
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const activeNodesRef = useRef<Map<string, { source: AudioBufferSourceNode; gainNode: GainNode }>>(new Map());
  
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
      addXP(50, "Great focus session! Your mind is now ready for learning.");
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, addXP]);

  // Initialize Web Audio API for better ambient sound mixing
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('Web Audio API not supported');
      }
    }
  }, []);

  const loadSoundBuffer = async (soundId: string, url: string): Promise<AudioBuffer | null> => {
    if (!audioContextRef.current) return null;
    if (soundBuffersRef.current.has(soundId)) {
      return soundBuffersRef.current.get(soundId)!;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      soundBuffersRef.current.set(soundId, audioBuffer);
      return audioBuffer;
    } catch (e) {
      console.error('Failed to load sound:', url, e);
      return null;
    }
  };

  const toggleSound = async (soundId: string) => {
    if (!audioContextRef.current) return;

    // If clicking the same sound, stop it
    if (activeSound === soundId) {
      const nodes = activeNodesRef.current.get(soundId);
      if (nodes) {
        try {
          nodes.source.stop();
        } catch (e) {
          // Already stopped
        }
        activeNodesRef.current.delete(soundId);
      }
      setActiveSound(null);
      return;
    }

    // Stop all currently playing sounds
    activeNodesRef.current.forEach((nodes, id) => {
      try {
        nodes.source.stop();
      } catch (e) {
        // Already stopped
      }
      activeNodesRef.current.delete(id);
    });

    // Load and play new sound
    const sound = SOUNDS.find(s => s.id === soundId);
    if (!sound) return;

    const buffer = await loadSoundBuffer(soundId, sound.url);
    if (!buffer) return;

    const source = audioContextRef.current.createBufferSource();
    const gainNode = audioContextRef.current.createGain();
    
    source.buffer = buffer;
    source.loop = true;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    source.start();
    activeNodesRef.current.set(soundId, { source, gainNode });
    setActiveSound(soundId);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    activeNodesRef.current.forEach((nodes) => {
      nodes.gainNode.gain.value = newVolume;
    });
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeNodesRef.current.forEach((nodes) => {
        try {
          nodes.source.stop();
        } catch (e) {
          // Already stopped
        }
      });
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

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
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-headline text-4xl font-extrabold text-on-surface">Focus Zone</h2>
              <p className="text-on-surface-muted text-lg">A peaceful space to regulate your senses and find your focus.</p>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visual Fidget & Timer */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              className="bg-white rounded-[40px] p-8 border-2 border-surface-container shadow-card relative overflow-hidden h-[400px] flex items-center justify-center"
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
                  background: `radial-gradient(circle at ${fidgetPos.x}% ${fidgetPos.y}%, rgba(0, 102, 255, 0.12) 0%, transparent 50%)`
                }}
              />
              
              <div className="relative z-10 text-center">
                <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
                  {/* Visual Timer Ring */}
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="128" cy="128" r="120"
                      className="fill-none stroke-surface-container"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="128" cy="128" r="120"
                      className="fill-none stroke-primary"
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
                    <span className="text-xs font-bold text-on-surface-muted uppercase tracking-widest mt-2">Focus Time</span>
                    {selectedTaskId && (
                      <span className="text-xs font-medium text-primary mt-1">
                        Task mode active
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <TapEffect>
                    <button 
                      onClick={() => setIsActive(!isActive)}
                      className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
                        isActive ? 'bg-surface-container text-primary' : 'bg-primary text-white shadow-glow'
                      }`}
                    >
                      {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                    </button>
                  </TapEffect>
                  <button 
                    onClick={() => { setTimeLeft(25 * 60); setIsActive(false); }}
                    className="w-16 h-16 rounded-full bg-surface-container text-stone-500 flex items-center justify-center hover:bg-surface-container-high transition-all"
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

            <div className="bg-primary/5 p-6 rounded-[32px] border border-primary/10 flex gap-6 items-center">
              <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
                <Target className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-headline font-bold text-xl text-on-surface mb-1">Visual Fidget</h4>
                <p className="text-on-surface-muted text-sm leading-relaxed">
                  Gently move your mouse or finger across the panel above. The light follows you, helping to ground your focus and regulate your senses.
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel - Tasks & Sounds */}
          <div className="space-y-6">
            <h3 className="font-headline text-2xl font-bold text-on-surface px-2">My Focus Tasks</h3>
            
            {/* Task List */}
            <div className="bg-white rounded-[32px] p-6 border border-surface-container shadow-card">
              <TodoList onTaskSelect={(task) => setSelectedTaskId(task.id)} selectedTaskId={selectedTaskId} />
            </div>

            {/* Ambient Sounds */}
            <div>
              <h3 className="font-headline text-2xl font-bold text-on-surface px-2 mb-4">Ambient Sounds</h3>
              <div className="grid grid-cols-1 gap-3">
                {SOUNDS.map((sound) => (
                  <button
                    key={sound.id}
                    onClick={() => toggleSound(sound.id)}
                    className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                      activeSound === sound.id 
                        ? `${sound.color} border-transparent text-white shadow-xl scale-[1.02]` 
                        : 'bg-white border-surface-container text-on-surface hover:border-primary/20'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        activeSound === sound.id ? 'bg-white/20 text-white' : 'bg-surface-container text-on-surface-muted'
                      }`}>
                        {sound.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm">{sound.name}</div>
                        <div className={`text-[10px] uppercase font-black tracking-widest ${activeSound === sound.id ? 'opacity-80' : 'text-stone-400'}`}>
                          {activeSound === sound.id ? 'Now Playing' : 'Calm Loop'}
                        </div>
                      </div>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      activeSound === sound.id ? 'bg-white text-primary' : 'bg-surface-container text-stone-300 opacity-0 group-hover:opacity-100'
                    }`}>
                      {activeSound === sound.id ? <Volume2 className="w-5 h-5" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-2xl p-5 border border-surface-container mt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-muted">Master Volume</label>
                  <div className="text-xs font-bold text-primary">{Math.round(volume * 100)}%</div>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01" value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hidden audio element for fallback */}
        <audio ref={audioRef} />
      </div>
    </Layout>
  );
}
