import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Camera, Sprout, Settings, User, LogOut, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { VoiceAssistant } from './VoiceAssistant';
import { useApp } from '@/lib/AppContext';
import { TapEffect } from './TapEffect';
import { XPNotification, LevelUpNotification, BadgeNotification } from './XPNotifications';

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

export function Layout({ children, hideNav = false }: LayoutProps) {
  const location = useLocation();
  const { 
    logout, user, setIsVoiceAssistantOpen, isVoiceAssistantOpen, 
    xpNotification, setXpNotification, 
    levelUpNotification, setLevelUpNotification,
    badgeNotification, setBadgeNotification
  } = useApp();

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
        <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl px-6 py-4 border-b border-surface-container-high/50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border-2 border-primary/20 shadow-sm">
                <img 
                  src={(user?.user_metadata as any)?.avatar_url || "https://picsum.photos/seed/user/100/100"} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link 
                to="/settings" 
                className="p-2.5 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all active:scale-90"
              >
                <Settings className="w-6 h-6" />
              </Link>
              <button 
                onClick={logout}
                className="p-2.5 text-on-surface-variant hover:bg-error/10 hover:text-error rounded-full transition-all active:scale-90"
                title="Logout"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content with Transition */}
      <main className={cn("flex-1 overflow-x-hidden", !hideNav && "pt-24 pb-32")}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>

      {/* Voice Assistant */}
      {!hideNav && <VoiceAssistant />}

      {/* Bottom Nav */}
      {!hideNav && (
        <nav className="fixed bottom-0 w-full z-50 pb-[env(safe-area-inset-bottom,24px)] pt-3 px-6 bg-surface/90 backdrop-blur-2xl border-t border-surface-container-high/50 safe-area-bottom">
          <div className="max-w-2xl mx-auto flex justify-around items-center h-16 md:gap-12 lg:gap-24">
            <Link 
              to="/dashboard" 
              className={cn(
                "flex flex-col items-center justify-center w-12 h-full transition-all relative",
                location.pathname === '/dashboard' ? "text-primary" : "text-on-surface-variant/60"
              )}
            >
              <TapEffect className="flex flex-col items-center">
                <Home className={cn("w-6 h-6 transition-transform", location.pathname === '/dashboard' && "scale-110")} />
                <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Home</span>
              </TapEffect>
              {location.pathname === '/dashboard' && (
                <motion.div layoutId="nav-dot" className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
              )}
            </Link>

            <button 
              onClick={() => setIsVoiceAssistantOpen(!isVoiceAssistantOpen)}
              className={cn(
                "flex flex-col items-center justify-center w-12 h-full transition-all relative",
                isVoiceAssistantOpen ? "text-primary" : "text-on-surface-variant/60"
              )}
            >
              <TapEffect className="flex flex-col items-center">
                <Mic className={cn("w-6 h-6 transition-transform", isVoiceAssistantOpen && "scale-110")} />
                <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Voice</span>
              </TapEffect>
            </button>
            
            <Link 
              to="/camera" 
              className="relative group"
            >
              <TapEffect>
                <div className="flex items-center justify-center bg-primary text-white rounded-2xl w-14 h-14 -mt-8 shadow-lg shadow-primary/30 border-4 border-surface group-active:scale-95 transition-transform">
                  <Camera className="w-7 h-7 fill-current" />
                </div>
              </TapEffect>
            </Link>
            
            <Link 
              to="/progress" 
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full transition-all relative",
                location.pathname === '/progress' ? "text-primary" : "text-on-surface-variant/60"
              )}
            >
              <TapEffect className="flex flex-col items-center">
                <Sprout className={cn("w-6 h-6 transition-transform", location.pathname === '/progress' && "scale-110")} />
                <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Growth</span>
              </TapEffect>
              {location.pathname === '/progress' && (
                <motion.div layoutId="nav-dot" className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
              )}
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
