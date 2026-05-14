import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { BookMarked, Search, Trash2, ExternalLink, Loader2, Sparkles, BookOpen, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GlossaryWord {
  id: string;
  word: string;
  definition: string;
  created_at: string;
  language: string;
}

export default function Glossary() {
  const { t, setIsVoiceAssistantOpen } = useApp();
  const [words, setWords] = useState<GlossaryWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchGlossary = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('glossary')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWords(data || []);
    } catch (error) {
      console.error('Error fetching glossary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlossary();
  }, []);

  const deleteWord = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('glossary')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setWords(words.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error deleting word:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredWords = words.filter(w => 
    w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
              <BookMarked className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">{t('glossary')}</h1>
              <p className="text-on-surface-variant text-lg">{t('glossaryDesc')}</p>
            </div>
          </div>

          <div className="relative flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input 
                type="text"
                placeholder="Search your words..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-surface-container-high rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
              />
            </div>
            <button 
              onClick={() => setIsVoiceAssistantOpen(true)}
              className="bg-primary/10 text-primary p-4 rounded-2xl hover:bg-primary/20 transition-all active:scale-95"
              title="Voice Search"
            >
              <Mic className="w-6 h-6" />
            </button>
          </div>
        </header>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="font-bold text-primary">Loading your words...</p>
          </div>
        ) : words.length === 0 ? (
          <div className="bg-surface-container-low rounded-3xl p-12 text-center border-2 border-dashed border-surface-container-high">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary/40">
              <BookOpen className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-headline font-bold mb-3">Your glossary is empty</h3>
            <p className="text-on-surface-variant mb-8 max-w-sm mx-auto">
              Click on words you don't know while reading to add them to your personal collection.
            </p>
            <Link 
              to="/reader"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95"
            >
              Start Reading
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredWords.map((word) => (
                <motion.div 
                  key={word.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl p-8 border border-surface-container-high shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <h3 className="text-2xl font-headline font-bold text-on-surface capitalize mb-1">{word.word}</h3>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-100 px-2 py-0.5 rounded">
                        {word.language === 'en' ? 'English' : word.language === 'sw' ? 'Swahili' : 'Spanish'}
                      </span>
                    </div>
                    <button 
                      onClick={() => deleteWord(word.id)}
                      disabled={deletingId === word.id}
                      className="p-2 text-stone-300 hover:text-error hover:bg-error/10 rounded-full transition-all"
                    >
                      {deletingId === word.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  <p className="text-on-surface-variant leading-relaxed mb-6 relative z-10">
                    {word.definition}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs font-medium text-stone-400 border-t border-stone-50 pt-4 relative z-10">
                    <span>Added on {new Date(word.created_at).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1 text-primary/60">
                      <Sparkles className="w-3 h-3 fill-current" />
                      <span>AI Defined</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Layout>
  );
}
