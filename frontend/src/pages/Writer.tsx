import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from '@/components/Layout';
import { 
  PenTool, 
  BookOpen, 
  Wand2, 
  Save, 
  RotateCcw, 
  ChevronRight, 
  Star, 
  Ghost, 
  Rocket, 
  Trees,
  Loader2,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { TapEffect } from '@/components/TapEffect';
import { generateAIContent } from '@/services/aiService';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import SEO from '@/lib/SEO';
import { rewards } from '@/lib/gamification';

interface Genre {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const GENRES: Genre[] = [
  { id: 'adventure', name: 'Adventure', icon: <Rocket className="w-5 h-5" />, color: 'bg-orange-500' },
  { id: 'fantasy', name: 'Fantasy', icon: <Star className="w-5 h-5" />, color: 'bg-purple-500' },
  { id: 'nature', name: 'Nature', icon: <Trees className="w-5 h-5" />, color: 'bg-emerald-500' },
  { id: 'mystery', name: 'Mystery', icon: <Ghost className="w-5 h-5" />, color: 'bg-blue-500' },
];

export default function Writer() {
  const { language, user, addXP } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [story, setStory] = useState('');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const generateStory = async () => {
    if (!topic || !selectedGenre) return;
    setIsGenerating(true);
    setStep(3);
    
    try {
      const prompt = `Write a creative, short, and engaging story for a child with neurodiversity. 
      Topic: ${topic}
      Genre: ${selectedGenre}
      Language: ${language}
      
      Requirements:
      - Use simple, descriptive language.
      - Keep sentences short.
      - Use an encouraging tone.
      - Total length: about 200-300 words.
      - Start with a catchy title.
      
      Format the response as:
      TITLE: [Story Title]
      STORY: [Story Content]`;

      const result = await generateAIContent({
        contents: [{ parts: [{ text: prompt }] }]
      });
      
      const output = result.text || '';
      
      const titleMatch = output.match(/TITLE:\s*(.*)\n/i);
      const storyMatch = output.match(/STORY:\s*([\s\S]*)/i);
      
      if (titleMatch && storyMatch) {
        setTitle(titleMatch[1].trim());
        setStory(storyMatch[1].trim());
        addXP(rewards.USE_TOOL, "Created a new story!");
      } else {
        setStory(output);
        setTitle("My Creative Story");
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      alert("Sorry, I couldn't create your story right now. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveStory = async () => {
    if (!user || !story) return;
    
    // If guest, don't save to DB, just go to reader
    if (user.id === 'guest-user') {
      navigate('/reader', { state: { bookTitle: title, textContent: story } });
      return;
    }

    setIsSaving(true);
    try {
      // We can use the user_books table but maybe mark it as 'created'
      const { error } = await supabase.from('user_books').upsert({
        user_id: user.id,
        title: title || "Untitled Story",
        content: story, // Assuming content field exists or we just store as a "custom" book
        format: 'custom',
        last_read: new Date().toISOString()
      });
      if (error) throw error;
      
      // Navigate to reader with this story
      navigate('/reader', { state: { bookTitle: title, textContent: story } });
    } catch (error) {
      console.error("Save Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <SEO
        title="Story Maker — Jumu AI"
        description="Create your own stories with help from writing prompts and genre templates. Build creative writing skills through guided storytelling."
        canonical="https://jumu.ai/writer"
        ogType="website"
      />
      <div className="max-w-4xl mx-auto px-6 pb-32">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-600/10 rounded-lg flex items-center justify-center text-red-600">
              <PenTool className="w-6 h-6" />
            </div>
            <h2 className="font-headline text-4xl font-extrabold text-gray-900">Story Maker</h2>
          </div>
          <p className="text-gray-600 text-lg">Create your own stories with guided writing prompts and templates.</p>
        </motion.section>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-[40px] p-10 border-2 border-gray-300 shadow-sm"
            >
              <h3 className="font-headline text-2xl font-bold mb-8">What should your story be about?</h3>
              <div className="space-y-6">
                <div className="relative">
                  <MessageSquare className="absolute left-6 top-6 text-stone-300" />
                  <textarea 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Example: A friendly robot who learns to bake cookies..."
                    className="w-full bg-gray-100 border-none rounded-xl p-6 pl-16 text-xl min-h-[150px] focus:ring-2 ring-red-600/20 transition-all font-medium"
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {GENRES.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => setSelectedGenre(genre.id)}
                      className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center gap-3 group ${
                        selectedGenre === genre.id 
                          ? `${genre.color} border-transparent text-white shadow-xl scale-105` 
                          : 'bg-white border-gray-300 text-gray-900 hover:border-red-600/20'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedGenre === genre.id ? 'bg-white/20' : 'bg-gray-100 text-stone-400 group-hover:text-red-600'}`}>
                        {genre.icon}
                      </div>
                      <span className="font-bold text-sm">{genre.name}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-8 flex justify-end">
                  <TapEffect>
                    <button 
                      onClick={() => setStep(2)}
                      disabled={!topic || !selectedGenre}
                      className="bg-red-600 text-white px-10 py-5 rounded-lg font-bold flex items-center gap-3 shadow-xl shadow-red-600/25 disabled:opacity-30 transition-all"
                    >
                      Next Step
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </TapEffect>
                </div>
              </div>
            </motion.div>
          ) : step === 2 ? (
             <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[40px] p-12 text-center border-2 border-gray-300 shadow-sm"
              >
                <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <PenTool className="w-12 h-12 text-red-600" />
                </div>
                <h3 className="font-headline text-3xl font-bold mb-4">Ready to create?</h3>
                <p className="text-gray-600 max-w-sm mx-auto mb-10 text-lg">
                  I'll use your ideas to write a special story just for you.
                </p>
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => setStep(1)}
                    className="px-8 py-5 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition-all"
                  >
                    Change Idea
                  </button>
                  <TapEffect>
                    <button 
                      onClick={generateStory}
                      className="bg-red-600 text-white px-10 py-5 rounded-lg font-bold flex items-center gap-3 shadow-xl"
                    >
                      <Wand2 className="w-6 h-6" />
                      Create Story
                    </button>
                  </TapEffect>
                </div>
              </motion.div>
          ) : (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {isGenerating ? (
                <div className="bg-white rounded-[40px] p-20 text-center border-2 border-gray-300 shadow-sm">
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="w-full h-full border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
                    <PenTool className="w-8 h-8 text-red-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-red-600 mb-2">Writing your story...</h3>
                  <p className="text-gray-600 italic">This may take a moment.</p>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-[40px] p-10 border-2 border-gray-300 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <span className="px-4 py-2 bg-red-600/10 text-red-600 rounded-full text-xs font-black uppercase tracking-widest">Your New Story</span>
                        <div className="flex gap-2">
                           <button onClick={() => setStep(1)} className="p-3 bg-gray-100 hover:bg-stone-200 rounded-xl transition-all">
                             <RotateCcw className="w-5 h-5 text-stone-500" />
                           </button>
                        </div>
                      </div>
                      <h3 className="font-headline text-4xl font-black text-gray-900 mb-8 tracking-tight leading-tight">{title}</h3>
                      <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-300 prose max-w-none">
                        <p className="text-xl font-medium text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {story}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <TapEffect className="flex-1">
                      <button 
                        onClick={saveStory}
                        disabled={isSaving}
                        className="w-full bg-red-600 text-white py-6 rounded-[32px] font-headline text-xl font-bold flex items-center justify-center gap-3 shadow-2xl shadow-red-600/30 active:scale-95 transition-all"
                      >
                        {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <BookOpen className="w-6 h-6" />}
                        Open in Reader
                      </button>
                    </TapEffect>
                    <button 
                      onClick={() => setStep(1)}
                      className="px-10 py-6 rounded-[32px] font-headline text-xl font-bold border-2 border-gray-300 hover:bg-gray-100 transition-all"
                    >
                      Write Another
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Writing Tips */}
        <section className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-100 p-8 rounded-xl border border-gray-300">
            <h4 className="font-headline font-bold text-xl mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-red-600" />
              Creative Spark
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Stuck? Try thinking about your favorite toy, a place you'd love to visit, or a superpower you wish you had. No idea is too small!
            </p>
          </div>
          <div className="bg-gray-100 p-8 rounded-xl border border-gray-300">
            <h4 className="font-headline font-bold text-xl mb-4 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-red-600" />
              Growing Writer
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Every story you create helps your brain grow. Reading back your own stories is one of the best ways to practice!
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
