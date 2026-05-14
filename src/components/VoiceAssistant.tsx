import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X, Volume2, Sparkles, Loader2 } from 'lucide-react';
import { generateAIContent } from '@/services/aiService';
import { useApp } from '@/lib/AppContext';

export function VoiceAssistant() {
  const { language, isVoiceAssistantOpen, setIsVoiceAssistantOpen } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      
      // Map app language to BCP 47 language tags
      const langMap = {
        en: 'en-US',
        sw: 'sw-KE',
        es: 'es-ES'
      };
      recognition.lang = langMap[language as keyof typeof langMap] || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setResponse('');
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const resultTranscript = event.results[current][0].transcript;
        setTranscript(resultTranscript);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          processVoiceCommand(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [transcript, language]);

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    try {
      const result = await generateAIContent({
        contents: [{ parts: [{ text: command }] }],
        config: {
          systemInstruction: `You are Jumu Ai, a helpful, encouraging, and calm assistant for neurodiverse learners. 
          The user's preferred language is ${language}. 
          Always respond in ${language}. 
          Keep your responses short, simple, and supportive. 
          If the user asks for help with reading, writing, or shopping, guide them to the respective tools in the app.`,
        },
      });

      const aiResponse = result.text || "I'm sorry, I didn't quite catch that. Could you repeat it?";
      setResponse(aiResponse);
      speak(aiResponse);
    } catch (error) {
      console.error('AI processing error:', error);
      setResponse("I'm having a little trouble connecting right now. Let's try again in a moment.");
    } finally {
      setIsProcessing(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      const langMap = {
        en: 'en-US',
        sw: 'sw-KE',
        es: 'es-ES'
      };
      utterance.lang = langMap[language] || 'en-US';
      
      utterance.rate = 0.9; // Slightly slower for better comprehension
      utterance.pitch = 1.1; // Friendly pitch
      synthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleAssistant = () => {
    if (isVoiceAssistantOpen) {
      window.speechSynthesis.cancel();
      recognitionRef.current?.stop();
    }
    setIsVoiceAssistantOpen(!isVoiceAssistantOpen);
  };

  const startListening = () => {
    window.speechSynthesis.cancel();
    recognitionRef.current?.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={toggleAssistant}
        className="hidden"
      >
        {isVoiceAssistantOpen ? <X className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </button>

      {/* Assistant Overlay */}
      <AnimatePresence>
        {isVoiceAssistantOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-52 right-6 left-6 md:left-auto md:w-96 z-[60] bg-white rounded-3xl shadow-2xl border border-surface-container-highest overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="w-5 h-5 fill-current" />
                  <span className="font-headline font-bold">Jumu Ai Assistant</span>
                </div>
                <button onClick={toggleAssistant} className="text-stone-400 hover:text-stone-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="min-h-[120px] mb-8 flex flex-col justify-center text-center">
                {isListening ? (
                  <div className="space-y-4">
                    <div className="flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [10, 30, 10] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                          className="w-1 bg-primary rounded-full"
                        />
                      ))}
                    </div>
                    <p className="text-on-surface-variant font-medium italic">
                      {transcript || "Listening..."}
                    </p>
                  </div>
                ) : isProcessing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-on-surface-variant font-medium">Thinking...</p>
                  </div>
                ) : response ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <p className="text-lg font-medium text-on-surface leading-relaxed">
                      {response}
                    </p>
                    <div className="flex justify-center">
                      <Volume2 className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                  </motion.div>
                ) : (
                  <p className="text-on-surface-variant font-medium">
                    Tap the microphone and tell me how I can help you today.
                  </p>
                )}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                    isListening
                      ? 'bg-error text-white animate-pulse'
                      : 'bg-primary text-white shadow-lg hover:scale-105'
                  }`}
                >
                  {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </button>
              </div>
            </div>
            
            <div className="bg-surface-container-low p-4 text-center">
              <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
                Powered by Jumu Ai
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
