import { motion } from 'motion/react';
import { Layout } from '@/components/Layout';
import { User, ArrowRight, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import SEO from '@/lib/SEO';

export default function OnboardingName() {
  const navigate = useNavigate();
  const { userName, setUserName, user } = useApp();
  const [name, setName] = useState(userName);
  const [hasSpokenFirst, setHasSpokenFirst] = useState(false);

  useEffect(() => {
    if (user && userName && userName !== 'Alex') {
      navigate('/dashboard');
    }
  }, [user, userName, navigate]);

  const speak = (text: string, onEnd?: () => void) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      if (onEnd) utterance.onend = onEnd;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // Small delay to ensure component is mounted and user has interacted (though browser policies might block auto-speech)
    const timer = setTimeout(() => {
      if (!hasSpokenFirst) {
        speak("Hello, what can I do for you?");
        setHasSpokenFirst(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [hasSpokenFirst]);

  const handleContinue = () => {
    if (name.trim()) {
      setUserName(name.trim());
      speak(`Hey ${name}, what can I do for you today? Let's customize your app.`, () => {
        navigate('/onboarding/personalize');
      });
    }
  };

  return (
    <Layout hideNav>
      <div className="h-screen flex flex-col items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <User className="w-12 h-12 text-primary" />
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-primary/5 rounded-full -z-10"
            />
          </div>

          <h1 className="font-headline text-3xl font-extrabold text-primary mb-2">Hello!</h1>
          <p className="text-on-surface-variant mb-12">What should we call you?</p>

          <div className="relative mb-8">
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-surface-container-low border-2 border-surface-container-highest rounded-2xl px-6 py-5 text-xl font-headline font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-center"
              onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
              autoFocus
            />
            {name && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary"
              >
                <Sparkles className="w-6 h-6 fill-current" />
              </motion.div>
            )}
          </div>

          <button 
            onClick={handleContinue}
            disabled={!name.trim()}
            className="w-full bg-primary text-white p-5 rounded-2xl font-headline font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
          >
            Continue
            <ArrowRight className="w-6 h-6" />
          </button>
        </motion.div>
      </div>
    </Layout>
  );
}
