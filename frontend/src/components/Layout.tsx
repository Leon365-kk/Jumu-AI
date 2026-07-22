import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Camera, Sprout, Settings, User, LogOut, Mic, BookOpen, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { VoiceAssistant } from './VoiceAssistant';
import { useAuth } from '@/lib/AuthContext';
import { useGamification } from '@/lib/GamificationContext';
import { useUI } from '@/lib/UIContext';
import { TapEffect } from './TapEffect';
import { XPNotification, LevelUpNotification, BadgeNotification } from './XPNotifications';

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

export function Layout({ children, hideNav = false }: LayoutProps) {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { isVoiceAssistantOpen, setIsVoiceAssistantOpen } = useUI();
  const { xpNotification, setXpNotification, levelUpNotification, setLevelUpNotification, badgeNotification, setBadgeNotification } = useGamification();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/progress', icon: BarChart3, label: 'Growth' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Notifications Overlay */}
      <AnimatePresence>
        {xpNotification && (
          <XPNotification 
            xp={xpNotification.xp} 
            message={xpNotification.message} 
            onClose={() => setXpNotification(null)} 
          />
        )}
        {levelUpNotification && (
          <LevelUpNotification 
            level={levelUpNotification} 
            onClose={() => setLevelUpNotification(null)} 
          />
        )}
        {badgeNotification && (
          <BadgeNotification 
            badge={badgeNotification} 
            onClose={() => setBadgeNotification(null)} 
          />
        )}
      </AnimatePresence>
      
      {/* Header */}
      {!hideNav && (
        <header className="fixed top-0 w-full z-50 glass-nav px-6 py-3 safe-area-top">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-sm transition-all">
                J
              </div>
              <span className="font-headline font-bold text-lg text-on-surface hidden sm:block">JumuAI</span>
            </Link>
            
            <div className="flex items-center gap-1">
              {user && user.id !== 'guest-user' && (
                <Link 
                  to="/progress" 
                  className={cn(
                    "p-2.5 rounded-xl transition-all",
                    location.pathname === '/progress' 
                      ? 'text-primary bg-primary/10' 
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  )}
                  title="Growth"
                >
                  <BarChart3 className="w-5 h-5" />
                </Link>
              )}
              <Link 
                to="/settings" 
                className={cn(
                  "p-2.5 rounded-xl transition-all",
                  location.pathname === '/settings' 
                    ? 'text-primary bg-primary/10' 
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                )}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <button 
                onClick={logout}
                className="p-2.5 text-on-surface-variant hover:bg-error/10 hover:text-error rounded-xl transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content with Transition */}
      <main className={cn("flex-1 overflow-x-hidden", !hideNav && "pt-20 pb-28")}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="h-full"
          style={{ willChange: 'transform, opacity' }}
        >
          {children}
        </motion.div>
      </main>

      {/* Voice Assistant */}
      {!hideNav && <VoiceAssistant />}

      {/* Bottom Nav */}
      {!hideNav && (
        <nav className="fixed bottom-0 w-full z-50 pb-[env(safe-area-inset-bottom,24px)] pt-2 px-6 glass-nav border-t border-surface-container/50">
          <div className="max-w-2xl mx-auto flex justify-around items-center h-16 md:gap-12 lg:gap-24">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={cn(
                    "flex flex-col items-center justify-center w-12 h-full transition-all relative",
                    isActive ? "text-primary" : "text-on-surface-muted hover:text-on-surface-variant"
                  )}
                >
                  <TapEffect className="flex flex-col items-center">
                    <item.icon className={cn("w-6 h-6 transition-transform", isActive && "scale-110")} />
                    <span className="text-[10px] font-bold mt-1 uppercase tracking-tight">{item.label}</span>
                  </TapEffect>
                  {isActive && (
                    <motion.div layoutId="nav-dot" className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
            
            <button 
              onClick={() => setIsVoiceAssistantOpen(!isVoiceAssistantOpen)}
              className={cn(
                "flex flex-col items-center justify-center w-12 h-full transition-all relative",
                isVoiceAssistantOpen ? "text-primary" : "text-on-surface-muted hover:text-on-surface-variant"
              )}
            >
              <TapEffect className="flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isVoiceAssistantOpen 
                    ? "bg-primary text-white shadow-glow" 
                    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container"
                )}>
                  <Mic className={cn("w-5 h-5", isVoiceAssistantOpen && "animate-pulse")} />
                </div>
              </TapEffect>
            </button>
            
            <Link 
              to="/camera" 
              className="relative group flex flex-col items-center"
            >
              <TapEffect>
                <div className="flex items-center justify-center bg-primary text-white rounded-2xl w-14 h-14 -mt-6 border-4 border-surface group-active:scale-95 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
              </TapEffect>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}