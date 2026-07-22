import { createContext, useContext, useState, useCallback } from 'react';

interface GamificationContextType {
  xpNotification: { xp: number; message?: string } | null;
  setXpNotification: (notif: { xp: number; message?: string } | null) => void;
  levelUpNotification: number | null;
  setLevelUpNotification: (level: number | null) => void;
  badgeNotification: { title: string; description: string } | null;
  setBadgeNotification: (badge: { title: string; description: string } | null) => void;
  addXP: (amount: number, message?: string, challengeUpdates?: { id: string; increment: number }[]) => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children, userId }: { children: React.ReactNode; userId?: string }) {
  const [xpNotification, setXpNotification] = useState<{ xp: number; message?: string } | null>(null);
  const [levelUpNotification, setLevelUpNotification] = useState<number | null>(null);
  const [badgeNotification, setBadgeNotification] = useState<{ title: string; description: string } | null>(null);

  const addXP = async (amount: number, message?: string, challengeUpdates?: { id: string; increment: number }[]) => {
    if (!userId || userId === 'guest-user') return;

    const { updateGamification } = await import('./gamification');
    const result = await updateGamification(userId, { xpGain: amount, challengeUpdates });

    if (result) {
      setXpNotification({ xp: amount, message });
      if (result.levelUp) {
        setLevelUpNotification(result.newLevel);
      }

      if (result.newBadges.length > 0) {
        setBadgeNotification({
          title: "New Milestone!",
          description: "You've unlocked a new achievement. Check your dashboard!"
        });
      }
    }
  };

  return (
    <GamificationContext.Provider value={{ xpNotification, setXpNotification, levelUpNotification, setLevelUpNotification, badgeNotification, setBadgeNotification, addXP }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}