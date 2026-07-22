import { motion } from 'motion/react';
import { Layout } from '@/components/Layout';
import { Palette, Type, Mic, Check, X, Sun, Moon, Droplets, Leaf, Heart, MessageCircle, Languages, Volume2, Smile } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import { Language } from '@/lib/translations';
import SEO from '@/lib/SEO';

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme, font, setFont, language, setLanguage, userName, t } = useApp();
  const [tone, setTone] = useState('calm');
  const [voice, setVoice] = useState('natural');

  useEffect(() => {
    // Only speak if we're in the onboarding flow (check URL)
    if (window.location.pathname.includes('onboarding')) {
      const speak = (text: string) => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
          window.speechSynthesis.speak(utterance);
        }
      };
      // Small delay to let the page settle
      const timer = setTimeout(() => {
        speak(`Let's customize your app, ${userName}. Choose the settings that help you focus best.`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [userName]);

  return (
    <Layout hideNav>
      <SEO
        title="Settings — Jumu AI"
        description="Customize your Jumu AI experience. Adjust your preferred language, theme, font (including OpenDyslexic), reading goals, and voice assistant settings."
        canonical="https://jumu.ai/settings"
        ogType="website"
        noIndex={true}
      />
      <header className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-primary font-headline font-extrabold text-2xl tracking-tight">Jumu Ai</h1>
        <button 
          onClick={() => navigate(-1)}
          className="p-2 text-stone-500 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-24 pb-32">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-primary rounded-full" />
            <div className="h-1 w-12 bg-primary rounded-full" />
            <div className="h-1 w-12 bg-gray-200 rounded-full" />
            <div className="h-1 w-12 bg-gray-200 rounded-full" />
          </div>
          <h2 className="font-headline font-bold text-4xl md:text-5xl text-gray-900 mb-4 tracking-tight">
            Customize your experience.
          </h2>
          <p className="text-gray-600 text-lg max-w-xl leading-relaxed">
            Customize the app to work best for you. Choose the settings that help you focus.
          </p>
        </div>

        <div className="space-y-12">
          {/* Theme Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-red-600" />
              <h3 className="font-headline font-semibold text-xl">Theme</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'light', label: 'Light', icon: Sun, bg: 'bg-white', color: 'text-stone-400' },
                { id: 'dark', label: 'Dark', icon: Moon, bg: 'bg-stone-900', color: 'text-stone-500' },
                { id: 'blue', label: 'Blue', icon: Droplets, bg: 'bg-[#eef6ff]', color: 'text-red-600' },
                { id: 'green', label: 'Green', icon: Leaf, bg: 'bg-[#f2f8f2]', color: 'text-emerald-600' },
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setTheme(item.id)}
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all border-2 ${
                    theme === item.id ? 'bg-white border-primary ring-4 ring-primary/10' : 'bg-gray-100 border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.bg} border border-gray-300`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Font Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Type className="w-6 h-6 text-red-600" />
              <h3 className="font-headline font-semibold text-xl">Reading Font</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'inter', label: 'Inter', sub: 'Standard modern precision', style: 'font-sans' },
                { id: 'dyslexic', label: 'OpenDyslexic', sub: 'Enhanced readability layout', style: 'font-serif' },
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setFont(item.id)}
                  className={`flex items-center justify-between p-8 rounded-xl transition-all border-2 text-left ${
                    font === item.id ? 'bg-white border-primary ring-4 ring-primary/10' : 'bg-gray-100 border-transparent hover:border-gray-300'
                  }`}
                >
                  <div>
                    <span className={`block text-2xl mb-1 ${item.style}`}>{item.label}</span>
                    <span className="text-gray-600 text-sm">{item.sub}</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${font === item.id ? 'border-primary' : 'border-gray-300'}`}>
                    {font === item.id && <div className="w-3 h-3 bg-primary rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 p-6 bg-white-container rounded-lg italic text-gray-600">
              "The quick brown fox jumps over the lazy dog. Reading should be effortless and clear for everyone."
            </div>
          </section>

          {/* Language Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Languages className="w-6 h-6 text-red-600" />
              <h3 className="font-headline font-semibold text-xl">Language</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'en', label: 'English' },
                { id: 'sw', label: 'Swahili' },
                { id: 'es', label: 'Spanish' },
              ].map((lang) => (
                <button 
                  key={lang.id}
                  onClick={() => setLanguage(lang.id as Language)}
                  className={`p-6 rounded-xl transition-all border-2 text-center font-bold ${
                    language === lang.id ? 'bg-white border-primary ring-4 ring-primary/10 text-primary' : 'bg-gray-100 border-transparent hover:border-gray-300'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </section>

          {/* Voice Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Volume2 className="w-6 h-6 text-red-600" />
              <h3 className="font-headline font-semibold text-xl">Voice Selection</h3>
            </div>
            <div className="space-y-3">
              {[
                { id: 'natural', label: 'Clear Natural', desc: 'Best for long reading' },
                { id: 'friendly', label: 'Warm Friendly', desc: 'Great for short tips' },
              ].map((v) => (
                <button 
                  key={v.id}
                  onClick={() => setVoice(v.id)}
                  className={`w-full flex items-center justify-between p-6 rounded-xl transition-all border-2 ${
                    voice === v.id ? 'bg-white border-primary ring-4 ring-primary/10' : 'bg-gray-100 border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-bold">{v.label}</div>
                    <div className="text-xs text-gray-600">{v.desc}</div>
                  </div>
                  {voice === v.id && <Check className="w-6 h-6 text-primary" />}
                </button>
              ))}
            </div>
          </section>

          {/* Tone Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Mic className="w-6 h-6 text-red-600" />
              <h3 className="font-headline font-semibold text-xl">Tone</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'encouraging', label: 'Encouraging', sub: 'Motivating and supportive', icon: Smile },
                { id: 'calm', label: 'Calm', sub: 'Minimal and peaceful', icon: Heart },
                { id: 'friendly', label: 'Friendly', sub: 'Warm and conversational', icon: MessageCircle },
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setTone(item.id)}
                  className={`p-6 rounded-xl transition-all border-2 text-center ${
                    tone === item.id ? 'bg-white border-primary ring-4 ring-primary/10' : 'bg-gray-100 border-transparent hover:border-gray-300'
                  }`}
                >
                  <item.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h4 className="font-bold mb-1">{item.label}</h4>
                  <p className="text-xs text-gray-600">{item.sub}</p>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl px-6 py-6 border-t border-gray-300">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="text-primary font-headline font-semibold px-6 py-4 hover:bg-gray-100 rounded-full transition-colors"
            >
              {t('back')}
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-primary text-white font-headline font-bold px-10 py-4 rounded-full hover:bg-primary/90 active:scale-95 transition-all"
            >
              {t('continue')}
            </button>
          </div>
        </div>
      </main>
    </Layout>
  );
}
