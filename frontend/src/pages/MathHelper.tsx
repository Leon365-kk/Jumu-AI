import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from '@/components/Layout';
import { Calculator, Camera, Upload, Loader2, Brain, Mic, ChevronRight, XCircle, Info, CheckCircle2, Lightbulb } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { TapEffect } from '@/components/TapEffect';
import { generateAIContent } from '@/services/aiService';
import { rewards } from '@/lib/gamification';
import SEO from '@/lib/SEO';

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
            model: "meta/llama-3.2-90b-vision-instruct",
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
        } catch (err: any) {
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
      <SEO
        title="Math Visualizer — Jumu AI"
        description="Break down math problems into step-by-step explanations. Upload a worksheet or snap a photo to see each solution step clearly explained."
        canonical="https://jumu.ai/math"
        ogType="website"
      />
      <div className="max-w-4xl mx-auto px-6 pb-32">
        {/* Header */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-600/10 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="font-headline text-4xl font-extrabold text-red-600">Math Helper</h2>
          </div>
          <p className="text-gray-600 text-lg">Scan any math problem to see a friendly, step-by-step breakdown.</p>
        </motion.section>

        {!solution && !isProcessing ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[40px] p-12 text-center border-2 border-dashed border-gray-300 shadow-sm relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-red-600/2 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
              <Camera className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="font-headline text-3xl font-bold text-gray-900 mb-4">Ready to solve together?</h3>
            <p className="text-gray-600 max-w-sm mx-auto mb-10 text-lg leading-relaxed">
              Snap a photo of your homework or worksheet to see each step explained clearly.
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
                  className="bg-red-600 text-white px-10 py-5 rounded-lg font-bold shadow-xl shadow-red-600/25 active:scale-95 transition-all flex items-center gap-3 text-lg"
                >
                  <Camera className="w-6 h-6" />
                  Scan Problem
                </button>
              </TapEffect>
              <button 
                onClick={() => setIsVoiceAssistantOpen(true)}
                className="bg-gray-100 text-red-600 px-10 py-5 rounded-lg font-bold hover:bg-gray-200 transition-all flex items-center gap-3 text-lg"
              >
                <Mic className="w-6 h-6" />
                Ask Assistant
              </button>
            </div>
          </motion.div>
        ) : isProcessing ? (
          <div className="py-32 text-center space-y-8">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin mx-auto" />
              <Brain className="w-8 h-8 text-red-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div>
              <h3 className="font-headline text-2xl font-bold text-red-600 mb-2">Analyzing the problem...</h3>
              <p className="text-gray-600">Breaking down the solution steps.</p>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* The Problem */}
            <div className="bg-gray-100 p-8 rounded-[32px] border border-gray-300 relative overflow-hidden">
              <div className="absolute top-4 right-8 opacity-10">
                <Calculator className="w-24 h-24" />
              </div>
              <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">The Problem</p>
              <h3 className="font-headline text-3xl font-bold text-gray-900 leading-tight">{solution?.problem}</h3>
            </div>

            {/* Concepts Chips */}
            <div className="flex flex-wrap gap-2">
              {solution?.concepts.map((concept, i) => (
                <span key={i} className="px-4 py-2 bg-red-600/10 text-red-600 rounded-full text-xs font-bold uppercase tracking-widest">
                  {concept}
                </span>
              ))}
            </div>

            {/* Explanation */}
            <div className="bg-amber-50 p-8 rounded-[32px] border border-amber-200 flex gap-4">
              <Lightbulb className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
              <div>
                <p className="font-bold text-amber-900 mb-2">Quick Explanation</p>
                <p className="text-amber-800 text-lg leading-relaxed">{solution?.explanation}</p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <h4 className="font-headline text-2xl font-bold text-gray-900 px-4">Step-by-Step Breakdown</h4>
              {solution?.steps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm flex gap-6 items-start"
                >
                  <div className="w-10 h-10 bg-red-600/10 rounded-full flex items-center justify-center font-headline font-black text-red-600 shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-xl font-medium text-gray-600 leading-relaxed pt-1">{step}</p>
                </motion.div>
              ))}
            </div>

            {/* Final Answer */}
            <div className="bg-red-600 text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="relative z-10">
                <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Final Answer</p>
                <div className="font-headline text-6xl font-black mb-10 tracking-tight group-hover:scale-105 transition-transform origin-left">
                  {solution?.finalAnswer}
                </div>
                <button 
                  onClick={() => setSolution(null)}
                  className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-bold backdrop-blur-sm transition-all active:scale-95 flex items-center gap-2"
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
          <div className="bg-gray-100 p-8 rounded-xl border border-gray-300">
            <h4 className="font-headline font-bold text-xl mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-red-600" />
              How it works
            </h4>
            <p className="text-gray-600 leading-relaxed">
              I don't just give you the answer! I break everything down into tiny steps so you can learn how to solve it yourself next time.
            </p>
          </div>
          <div className="bg-gray-100 p-8 rounded-xl border border-gray-300">
            <h4 className="font-headline font-bold text-xl mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-red-600" />
              Scanning Tips
            </h4>
            <ul className="text-gray-600 space-y-2 text-sm">
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
