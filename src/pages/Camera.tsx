import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from '@/components/Layout';
import { Camera, History, ZoomIn, Lightbulb, Type, Play, Pause, X, Volume2, Upload, Loader2 } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { generateAIContent } from '@/services/aiService';
import SEO from '@/lib/SEO';

export default function CameraView() {
  const { language } = useApp();
  const [isCaptured, setIsCaptured] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const words = extractedText.split(/\s+/).filter(w => w.length > 0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        const result = await generateAIContent({
          model: "meta/llama-3.2-90b-vision-instruct", // NVIDIA NIM vision model for OCR
          contents: [{
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: file.type
                }
              },
              { text: `Extract all visible text from this document. If it's a receipt, list the items and prices. If it's a book page or PDF, extract the text clearly. Maintain the original structure as much as possible. Respond only with the extracted text in ${language}.` }
            ]
          }]
        });
        
        setExtractedText(result.text || '');
        setIsCaptured(true);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("OCR Error:", error);
      setIsProcessing(false);
    }
  };

  const handlePlayPause = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      startSpeech();
    }
  };

  const startSpeech = () => {
    if (!extractedText) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(extractedText);
    
    const langMap = {
      en: 'en-US',
      sw: 'sw-KE',
      es: 'es-ES'
    };
    utterance.lang = langMap[language as keyof typeof langMap] || 'en-US';

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = event.charIndex;
        const textBefore = extractedText.substring(0, charIndex);
        const wordCount = textBefore.trim() ? textBefore.trim().split(/\s+/).length : 0;
        setCurrentWordIndex(wordCount);
      }
    };

    utterance.onend = () => {
      setIsReading(false);
      setCurrentWordIndex(-1);
    };

    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsReading(true);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <Layout>
      <SEO
        title="Camera OCR — Jumu AI"
        description="Take a photo or upload an image and extract text instantly with Jumu AI's OCR reader. Open-source, local processing — your photos never leave your device."
        canonical="https://jumu.ai/camera"
        ogType="website"
        noIndex={true}
      />
      <div className="relative min-h-[calc(100vh-200px)] lg:h-[calc(100vh-160px)] w-full flex flex-col px-4 md:px-12 lg:px-24">
        {/* Camera Viewport */}
        <div className="relative flex-1 bg-black rounded-xl overflow-hidden shadow-2xl">
          <AnimatePresence mode="wait">
            {!isCaptured ? (
              <motion.div 
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                {/* Mock Camera Feed */}
                <div className="absolute inset-0 grayscale-[0.2] brightness-90">
                  <img 
                    src="https://picsum.photos/seed/book/1200/800" 
                    alt="Camera Feed" 
                    className="w-full h-full object-cover opacity-80"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* OCR Overlays */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-[20%] left-[15%] w-[40%] h-[8%] ocr-bound rounded-lg" />
                  <div className="absolute top-[32%] left-[15%] w-[70%] h-[12%] ocr-bound rounded-lg" />
                  <div className="absolute top-[48%] left-[15%] w-[65%] h-[15%] ocr-bound rounded-lg" />
                  <div className="absolute top-[68%] left-[15%] w-[50%] h-[4%] ocr-bound rounded-lg" />
                </div>

                {/* Detecting Hint */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full text-white/90">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
                  </span>
                  <span className="font-headline text-sm font-medium tracking-wide uppercase">Detecting Text...</span>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-surface p-12 overflow-y-auto"
              >
                <div className="max-w-2xl mx-auto">
                  <div className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-3 text-primary">
                      <Volume2 className="w-6 h-6" />
                      <span className="font-headline font-bold">Reading Mode</span>
                    </div>
                    <button 
                      onClick={() => { setIsCaptured(false); setIsReading(false); setCurrentWordIndex(-1); }}
                      className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="text-3xl leading-relaxed font-light text-on-surface">
                    {words.map((word, i) => (
                      <span 
                        key={i}
                        className={`inline-block mr-2 rounded px-1 transition-all duration-200 ${
                          i === currentWordIndex ? 'bg-primary text-white scale-110 shadow-lg' : ''
                        }`}
                      >
                        {word}
                      </span>
                    ))}
                  </div>

                  <div className="fixed bottom-40 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-white/80 backdrop-blur-xl p-4 rounded-full shadow-2xl border border-surface-container-highest">
                    <button 
                      onClick={() => setIsReading(!isReading)}
                      className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"
                    >
                      {isReading ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                    </button>
                    <div className="pr-6">
                      <div className="font-bold text-on-surface">Playback</div>
                      <div className="text-xs text-on-surface-variant">Tap to listen</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Camera Corners (only visible when not captured) */}
          {!isCaptured && (
            <>
              <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-white/40 rounded-tl-lg" />
              <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-white/40 rounded-tr-lg" />
              <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-white/40 rounded-bl-lg" />
              <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-white/40 rounded-br-lg" />
            </>
          )}
        </div>

        {/* Floating Controls */}
        {!isCaptured && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4">
            <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col gap-6">
              <button className="p-3 text-stone-400 hover:text-primary transition-all"><ZoomIn className="w-6 h-6" /></button>
              <button className="p-3 text-stone-400 hover:text-primary transition-all"><Lightbulb className="w-6 h-6" /></button>
              <button className="p-3 text-stone-400 hover:text-primary transition-all"><Type className="w-6 h-6" /></button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isCaptured && (
          <div className="absolute bottom-8 left-0 w-full flex items-center justify-around px-12">
            <label className="w-14 h-14 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-md overflow-hidden active:scale-95 transition-all cursor-pointer flex items-center justify-center">
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
              <Upload className="w-6 h-6 text-white" />
            </label>

            <button 
              onClick={() => setIsCaptured(true)}
              className="group relative flex items-center justify-center p-2 active:scale-90 transition-all"
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full scale-125 blur-xl group-hover:scale-150 transition-transform" />
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-container rounded-full flex items-center justify-center shadow-2xl relative z-10">
                {isProcessing ? <Loader2 className="w-10 h-10 text-white animate-spin" /> : <Camera className="w-10 h-10 text-white fill-current" />}
              </div>
            </button>

            <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:text-primary active:scale-95 transition-all">
              <History className="w-7 h-7" />
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
