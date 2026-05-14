import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Star, Trophy, CheckCircle2 } from 'lucide-react';

interface XPNotificationProps {
  xp: number;
  message?: string;
  onClose: () => void;
}

export function XPNotification({ xp, message, onClose }: XPNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[1001] bg-primary text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border-2 border-white/20 backdrop-blur-md"
    >
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
        <Zap className="w-5 h-5 fill-current text-tertiary-container text-yellow-300" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-black uppercase tracking-widest opacity-80 leading-none mb-1">XP Gained</span>
        <span className="font-headline font-black text-lg leading-none">+{xp} {message && <span className="text-xs font-medium opacity-80">— {message}</span>}</span>
      </div>
    </motion.div>
  );
}

export function BadgeNotification({ badge, onClose }: { badge: { title: string; description: string }; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
      className="fixed bottom-36 right-6 z-[1001] bg-white text-on-surface px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border-2 border-primary/20 backdrop-blur-md max-w-xs"
    >
      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary flex-shrink-0">
        <Star className="w-6 h-6 fill-current" />
      </div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">New Milestone!</div>
        <div className="font-headline font-black text-lg leading-tight">{badge.title}</div>
        <div className="text-xs font-medium text-on-surface-variant">{badge.description}</div>
      </div>
      <button 
        onClick={onClose}
        className="ml-2 text-stone-300 hover:text-stone-500"
      >
        <span className="sr-only">Close</span>
        <CheckCircle2 className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

export function LevelUpNotification({ level, onClose }: { level: number; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.5, transition: { duration: 0.3 } }}
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm px-6"
    >
      <motion.div 
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl border-4 border-primary/20 relative"
      >
        <div className="absolute -top-16 left-1/2 -translate-x-1/2">
          <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center shadow-2xl border-8 border-white">
            <Trophy className="w-16 h-16 text-white" />
          </div>
        </div>
        
        <div className="mt-12">
          <h2 className="font-headline text-4xl font-black text-primary mb-2">LEVEL UP!</h2>
          <p className="text-on-surface-variant font-medium mb-8">You've reached level</p>
          
          <div className="text-8xl font-headline font-black text-tertiary mb-8 tabular-nums">
            {level}
          </div>
          
          <button 
            onClick={onClose}
            className="w-full bg-primary text-white py-5 rounded-3xl font-headline font-bold text-xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
          >
            Keep Exploring
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
