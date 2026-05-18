import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from '@/components/Layout';
import { Calculator, Camera, Upload, Loader2, Sparkles, Brain, Mic, ChevronRight, XCircle, Info, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { TapEffect } from '@/components/TapEffect';
import { generateAIContent } from '@/services/aiService';
import { rewards } from '@/lib/gamification';

interface MathSolution {
  problem: string;
  steps: string[];
  finalAnswer: string;
  concepts: string[];
  explanation: string;
}

export default function MathHelper() {
  const { language, setIsVoiceAssistantOpen, addXP } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [solution, setSolution] = useState<MathSolution | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setSolution(null);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        const prompt = `You are a patient, encouraging Math Tutor for students with neurodiversity. 
        Analyze the math problem in this image.
        
        Tasks:
        1. Identify the problem: Transcribe the math problem exactly.
        2. Step-by-Step Solution: Break it down into very small, manageable steps. Use simple language.
        3. Explain the "Why": Briefly explain why we do each step in a friendly way.
        4. Main Concepts: Identify the core math concepts involved (e.g., "Addition", "Fractions", "Algebra").
        
        Respond ONLY with a JSON object in this format:
        {
          "problem": "The transcribed problem",
          "steps": ["Step 1: ...", "Step 2: ..."],
          "finalAnswer": "The final answer clearly stated",
          "concepts": ["Concept 1", "Concept 2"],
          "explanation": "A high-level encouraging summary of how to think about this problem"
        }
        
        Language: ${language}`;

        try {
          const result = await generateAIContent({
            model: "meta/llama-3.2-90b-vision-instruct", // NVIDIA NIM vision model for math
            contents: [
              {
                parts: [
                  { inlineData: { data: base64Data, mimeType: file.type || "image/jpeg" } },
                  { text: prompt }
                ]
              }
            ],
            config: {
              responseMimeType: "application/json"
            }
          });

          if (result.text) {
            const data = JSON.parse(result.text.trim());
            setSolution(data);
            addXP(rewards.USE_TOOL, "Math Problem Solved");
          }
        } catch (err) {
          console.error("AI Error:", err);
          alert("I couldn't quite read that math problem. Could you try taking a clearer photo?");
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File reading error:", error);
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 pb-32">
        {/* Header */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-headline text-4xl font-extrabold text-primary">Math Helper</h2>
          </div>
          <p className="text-on-surface-variant text-lg">Scan any math problem to see a friendly, step-by-step breakdown.</p>
        </motion.section>

        {!solution && !isProcessing ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[40px] p-12 text-center border-2 border-dashed border-surface-container-highest shadow-sm relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
              <Camera className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-headline text-3xl font-bold text-on-surface mb-4">Ready to solve together?</h3>
            <p className="text-on-surface-variant max-w-sm mx-auto mb-10 text-lg leading-relaxed">
              Snap a photo of your homework or worksheet! Jumu Ai will help you understand each step.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <TapEffect>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-primary text-white px-10 py-5 rounded-2xl font-bold shadow-xl shadow-primary/25 active:scale-95 transition-all flex items-center gap-3 text-lg"
                >
                  <Camera className="w-6 h-6" />
                  Scan Problem
                </button>
              </TapEffect>
              <button 
                onClick={() => setIsVoiceAssistantOpen(true)}
                className="bg-surface-container-low text-primary px-10 py-5 rounded-2xl font-bold hover:bg-surface-container-high transition-all flex items-center gap-3 text-lg"
              >
                <Mic className="w-6 h-6" />
                Ask Assistant
              </button>
            </div>
          </motion.div>
        ) : isProcessing ? (
          <div className="py-32 text-center space-y-8">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
              <Brain className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div>
              <h3 className="font-headline text-2xl font-bold text-primary mb-2">Analyzing the problem...</h3>
              <p className="text-on-surface-variant">Finding the best way to explain this to you.</p>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* The Problem */}
            <div className="bg-surface-container-low p-8 rounded-[32px] border border-surface-container-high relative overflow-hidden">
              <div className="absolute top-4 right-8 opacity-10">
                <Calculator className="w-24 h-24" />
              </div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">The Problem</p>
              <h3 className="font-headline text-3xl font-bold text-on-surface leading-tight">{solution?.problem}</h3>
            </div>

            {/* Concepts Chips */}
            <div className="flex flex-wrap gap-2">
              {solution?.concepts.map((concept, i) => (
                <span key={i} className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">
                  {concept}
                </span>
              ))}
            </div>

            {/* Explanation */}
            <div className="bg-amber-50 p-8 rounded-[32px] border border-amber-200 flex gap-4">
              <Sparkles className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
              <div>
                <p className="font-bold text-amber-900 mb-2">Quick Explanation</p>
                <p className="text-amber-800 text-lg leading-relaxed">{solution?.explanation}</p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <h4 className="font-headline text-2xl font-bold text-on-surface px-4">Step-by-Step Breakdown</h4>
              {solution?.steps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-3xl border border-surface-container-high shadow-sm flex gap-6 items-start"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-headline font-black text-primary shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-xl font-medium text-on-surface-variant leading-relaxed pt-1">{step}</p>
                </motion.div>
              ))}
            </div>

            {/* Final Answer */}
            <div className="bg-primary text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="relative z-10">
                <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Final Answer</p>
                <div className="font-headline text-6xl font-black mb-10 tracking-tight group-hover:scale-105 transition-transform origin-left">
                  {solution?.finalAnswer}
                </div>
                <button 
                  onClick={() => setSolution(null)}
                  className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-2xl font-bold backdrop-blur-sm transition-all active:scale-95 flex items-center gap-2"
                >
                  Solve another one
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Helpful Tips Sidebar */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-low p-8 rounded-3xl border border-surface-container-high">
            <h4 className="font-headline font-bold text-xl mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              How I help
            </h4>
            <p className="text-on-surface-variant leading-relaxed">
              I don't just give you the answer! I break everything down into tiny steps so you can learn how to solve it yourself next time.
            </p>
          </div>
          <div className="bg-surface-container-low p-8 rounded-3xl border border-surface-container-high">
            <h4 className="font-headline font-bold text-xl mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Scanning Tips
            </h4>
            <ul className="text-on-surface-variant space-y-2 text-sm">
              <li className="flex gap-2"><span>•</span> Use good lighting for the photo</li>
              <li className="flex gap-2"><span>•</span> Make sure the handwritten numbers are clear</li>
              <li className="flex gap-2"><span>•</span> Hold the camera steady</li>
            </ul>
          </div>
        </section>
      </div>
    </Layout>
  );
}
