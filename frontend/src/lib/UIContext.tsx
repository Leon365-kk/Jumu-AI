import { createContext, useContext, useState } from 'react';

interface UIContextType {
  isVoiceAssistantOpen: boolean;
  setIsVoiceAssistantOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);

  return (
    <UIContext.Provider value={{ isVoiceAssistantOpen, setIsVoiceAssistantOpen }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}