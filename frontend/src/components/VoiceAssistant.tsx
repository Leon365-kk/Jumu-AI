import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X, Volume2, VolumeX, Sparkles, Loader2, User, Bot } from 'lucide-react';
import { generateAIContent } from '@/services/aiService';
import { useApp } from '@/lib/AppContext';
import { mobileVoiceService } from '@/services/mobileVoiceService';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export function VoiceAssistant() {
  const { language, isVoiceAssistantOpen, setIsVoiceAssistantOpen } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check if native speech recognition is available
    const checkAvailability = async () => {
      const supported = await mobileVoiceService.isSupported();
      if (!supported) {
        console.warn('Native speech recognition not available');
      }
    };
    checkAvailability();
  }, []);

  // Cleanup when assistant closes
  useEffect(() => {
    if (!isVoiceAssistantOpen) {
      stopSpeaking();
      stopListening();
    }
  }, [isVoiceAssistantOpen]);

  // Monitor speech synthesis to update isSpeaking state
  useEffect(() => {
    const handleSpeechStart = () => setIsSpeaking(true);
    const handleSpeechEnd = () => setIsSpeaking(false);
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('start', handleSpeechStart);
      window.speechSynthesis.addEventListener('end', handleSpeechEnd);
      window.speechSynthesis.addEventListener('error', handleSpeechEnd);
    }
    
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.removeEventListener('start', handleSpeechStart);
        window.speechSynthesis.removeEventListener('end', handleSpeechEnd);
        window.speechSynthesis.removeEventListener('error', handleSpeechEnd);
      }
    };
  }, []);

  const startListening = async () => {
    stopSpeaking();
    const supported = await mobileVoiceService.isSupported();
    
    if (supported && !isListening) {
      setIsListening(true);
      setTranscript('');
      
      await mobileVoiceService.startListening(
        language,
        (result) => {
          setTranscript(result.transcript);
          if (result.isFinal) {
            processVoiceCommand(result.transcript);
          }
        },
        (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
        }
      );
    } else if (!supported) {
      console.error('Speech recognition not supported');
    }
  };

  const stopListening = async () => {
    await mobileVoiceService.stopListening();
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking();
      startListening();
    }
  };

  const processVoiceCommand = async (command: string) => {
    // Add user message to history
    setMessages(prev => [...prev, { role: 'user', text: command, timestamp: new Date() }]);
    setIsProcessing(true);
    setResponse('');
    
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
      setMessages(prev => [...prev, { role: 'assistant', text: aiResponse, timestamp: new Date() }]);
      speak(aiResponse);
    } catch (error) {
      console.error('AI processing error:', error);
      const errorMsg = "I'm having a little trouble connecting right now. Let's try again in a moment.";
      setResponse(errorMsg);
      setMessages(prev => [...prev, { role: 'assistant', text: errorMsg, timestamp: new Date() }]);
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

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsVoiceAssistantOpen(!isVoiceAssistantOpen)}
        className="fixed bottom-20 right-6 z-50 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        aria-label="Toggle voice assistant"
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
            className="fixed bottom-32 right-6 left-6 md:left-auto md:w-96 z-[60] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-surface-container-highest overflow-hidden flex flex-col max-h-[500px]"
          >
            {/* Header */}
            <div className="p-4 border-b border-surface-container-high flex items-center justify-between bg-primary/5">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5 fill-current" />
                <span className="font-headline font-bold">Jumu Ai Voice</span>
              </div>
              <div className="flex items-center gap-2">
                {isSpeaking && (
                  <span className="text-xs bg-primary text-white px-2 py-1 rounded-full flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    Speaking
                  </span>
                )}
                <button 
                  onClick={() => setIsVoiceAssistantOpen(false)} 
                  className="text-stone-400 hover:text-stone-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conversation History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && !transcript && !response && (
                <div className="text-center text-stone-400 py-8">
                  <Mic className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Tap the microphone and speak</p>
                  <p className="text-xs mt-1">Your speech will appear as text</p>
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-br-md' 
                      : 'bg-surface-container-high text-on-surface rounded-bl-md'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-white/70' : 'text-stone-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-on-surface-variant" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Current transcript (interim) */}
              {isListening && transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end gap-3"
                >
                  <div className="rounded-2xl px-4 py-3 max-w-[85%] bg-primary/80 text-white rounded-br-md">
                    <p className="text-sm leading-relaxed italic">{transcript}</p>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [4, 12, 4] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                          className="w-0.5 bg-white rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                </motion.div>
              )}

              {/* Current processing/response */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-surface-container-high">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      <span className="text-sm text-on-surface-variant">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Current response with TTS indicator */}
              {response && !isProcessing && messages[messages.length - 1]?.role !== 'assistant' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 max-w-[85%] bg-surface-container-high text-on-surface rounded-bl-md">
                    <p className="text-sm leading-relaxed">{response}</p>
                    {isSpeaking && (
                      <div className="flex items-center gap-2 mt-2 text-primary">
                        <Volume2 className="w-3 h-3 animate-pulse" />
                        <span className="text-xs">Speaking...</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Scroll anchor */}
              <div ref={(el) => el && el.scrollIntoView({ behavior: 'smooth' })} />
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-surface-container-high bg-surface-container-low">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={toggleListening}
                  disabled={isProcessing}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                    isListening
                      ? 'bg-error text-white animate-pulse'
                      : isSpeaking
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-primary text-white hover:scale-105'
                  } disabled:opacity-50`}
                  aria-label={isListening ? "Stop listening" : "Start listening"}
                >
                  {isSpeaking ? (
                    <Volume2 className="w-7 h-7" />
                  ) : isListening ? (
                    <MicOff className="w-7 h-7" />
                  ) : (
                    <Mic className="w-7 h-7" />
                  )}
                </button>
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="p-3 bg-surface border border-surface-container-high rounded-full hover:bg-surface-container-high transition-all"
                    aria-label="Stop speaking"
                  >
                    <VolumeX className="w-5 h-5 text-on-surface-variant" />
                  </button>
                )}
              </div>
              {messages.length > 0 && (
                <button
                  onClick={() => {
                    setMessages([]);
                    setResponse('');
                    setTranscript('');
                    stopSpeaking();
                    stopListening();
                  }}
                  className="mt-3 w-full text-xs text-stone-400 hover:text-stone-600 transition-colors"
                >
                  Clear conversation
                </button>
              )}
              <p className="text-xs text-center text-stone-400 mt-2">
                {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Tap to speak'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
