import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Star, Trophy, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[1001] bg-on-surface text-white px-6 py-4 rounded-2xl shadow-elevated flex items-center gap-4 border border-white/10 backdrop-blur-xl"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
        <Zap className="w-6 h-6 fill-current text-yellow-300" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">XP Gained</span>
        <span className="font-headline font-black text-xl leading-none">
          +{xp} {message && <span className="text-sm font-medium opacity-80 ml-1">— {message}</span>}
        </span>
      </div>
      <button onClick={onClose} className="ml-2 text-white/40 hover:text-white transition-colors">
        <X className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

interface BadgeNotificationProps {
  badge: { title: string; description: string };
  onClose: () => void;
}

export function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
      className="fixed bottom-36 right-6 z-[1001] bg-white text-on-surface p-5 rounded-3xl shadow-elevated flex items-start gap-4 border border-primary/10 backdrop-blur-xl max-w-sm"
    >
      <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
        <Star className="w-7 h-7 fill-current" />
      </div>
      <div className="flex-1">
        <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">New Milestone!</div>
        <div className="font-headline font-black text-lg leading-tight">{badge.title}</div>
        <div className="text-xs font-medium text-on-surface-variant mt-0.5">{badge.description}</div>
      </div>
      <button 
        onClick={onClose}
        className="text-on-surface-muted hover:text-on-surface transition-colors mt-1"
      >
        <X className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

interface LevelUpNotificationProps {
  level: number;
  onClose: () => void;
}

export function LevelUpNotification({ level, onClose }: LevelUpNotificationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.5, transition: { duration: 0.3 } }}
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-md px-6"
    >
      <motion.div 
        initial={{ y: 50, scale: 0.9 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-white rounded-[2rem] p-10 max-w-sm w-full text-center shadow-elevated border border-primary/10 relative overflow-hidden animate-level-up"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-tertiary/5" />
        
        <div className="relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-2xl border-8 border-white mx-auto mb-6">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          
          <motion.h2 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="font-headline text-5xl font-black text-primary mb-2"
          >
            LEVEL UP!
          </motion.h2>
          <p className="text-on-surface-variant font-medium mb-8">You've reached level</p>
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
            className="text-8xl font-headline font-black text-tertiary mb-8 tabular-nums"
          >
            {level}
          </motion.div>
          
          <button 
            onClick={onClose}
            className="w-full bg-primary text-white py-4 rounded-2xl font-headline font-bold text-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Keep Exploring
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
