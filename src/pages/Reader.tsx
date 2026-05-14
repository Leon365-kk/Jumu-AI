import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Sparkles, Wand2, FileText, Type, AlignLeft, AlignCenter, AlignRight, Plus, Minus, Play, Pause, Upload, Clipboard, Volume2, Info, Brain, CheckCircle2, XCircle, Loader2, ChevronLeft, ChevronRight, BookOpen, Library, Mic, Eye, EyeOff, BookMarked } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import { generateAIContent } from '@/services/aiService';
import { rewards } from '@/lib/gamification';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function Reader() {
  const { language, userName, user, addXP } = useApp();
  const location = useLocation();
  const [text, setText] = useState('');
  const [bookTitle, setBookTitle] = useState<string | null>(null);
  const [bookId, setBookId] = useState<number | null>(null);
  const [bookCover, setBookCover] = useState<string | null>(null);
  const [bookUrl, setBookUrl] = useState<string | null>(null);
  const [recentBooks, setRecentBooks] = useState<any[]>([]);
  
  // Pagination
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pagesReadInSession, setPagesReadInSession] = useState(0);
  
  const [isBookLoading, setIsBookLoading] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [lineSpacing, setLineSpacing] = useState(1.5);
  const [theme, setTheme] = useState<'light' | 'cream' | 'green' | 'dark'>('cream');
  const [isDyslexic, setIsDyslexic] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordDefinition, setWordDefinition] = useState<string | null>(null);
  const [isDefining, setIsDefining] = useState(false);
  const [isSavingWord, setIsSavingWord] = useState(false);
  const [wordSaved, setWordSaved] = useState(false);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isLineFocus, setIsLineFocus] = useState(false);
  const [focusY, setFocusY] = useState(0);
  const [persona, setPersona] = useState<'teacher' | 'friend' | 'narrator'>('narrator');
  const [pitch, setPitch] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [isChunked, setIsChunked] = useState(false);
  const [isBionic, setIsBionic] = useState(false);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [reReadCount, setReReadCount] = useState(0);
  
  // Quiz states
  const [showQuiz, setShowQuiz] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isTtsLoading, setIsTtsLoading] = useState(false);

  const [isControlsExpanded, setIsControlsExpanded] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const words = pages.length > 0 ? pages[currentPage].split(/\s+/) : text.split(/\s+/);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle book passed from library or writer
    const state = location.state as { bookTitle?: string; bookUrl?: string; bookId?: number; bookCover?: string; textContent?: string };
    
    if (state?.textContent) {
      setBookTitle(state.bookTitle || 'My New Story');
      setText(state.textContent);
      paginateText(state.textContent);
    } else if (state?.bookUrl) {
      setBookTitle(state.bookTitle || 'Unknown Book');
      setBookId(state.bookId || null);
      setBookCover(state.bookCover || null);
      setBookUrl(state.bookUrl);
      setIsBookLoading(true);
      fetchBookContent(state.bookUrl);
      
      // Upsert into user_books if we have a bookId
      if (state.bookId && user) {
        upsertUserBook(state.bookId, state.bookTitle || 'Unknown Book', state.bookCover || null, state.bookUrl);
      }
    }

    if (!state?.bookUrl && user) {
      fetchRecentBooks();
    }
  }, [location, user]);

  const upsertUserBook = async (id: number, title: string, cover: string | null, url: string) => {
    if (!user || user.id === 'guest-user') return;
    try {
      const { supabase } = await import('@/lib/supabase');
      // We don't know total pages yet, we'll update it later or use a default
      await supabase.from('user_books').upsert({
        user_id: user?.id,
        book_id: id,
        title: title,
        cover_url: cover,
        book_url: url,
        last_read: new Date().toISOString()
      }, { onConflict: 'user_id,book_id' });
    } catch (e) {
      console.error("Upsert user book error:", e);
    }
  };

  const fetchRecentBooks = async () => {
    if (!user || user.id === 'guest-user') return;
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase
        .from('user_books')
        .select('*')
        .eq('user_id', user.id)
        .order('last_read', { ascending: false })
        .limit(4);
      if (data) setRecentBooks(data);
    } catch (e) {
      console.error("Fetch recent books error:", e);
    }
  };

  const fetchBookContent = async (url: string) => {
    setIsBookLoading(true);
    const proxies = [
      (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
      (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
      (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    ];

    let rawText = "";
    let success = false;

    for (const getProxyUrl of proxies) {
      try {
        const proxyUrl = getProxyUrl(url);
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        rawText = await response.text();
        if (rawText && rawText.length > 500) { // Basic check for meaningful content
          success = true;
          break;
        }
      } catch (err) {
        console.warn(`Proxy failed:`, err);
        continue;
      }
    }

    if (!success) {
      console.error("All proxies failed for URL:", url);
      setText("We couldn't load this book's content directly. You can try searching for another one or pasting the text here!");
      setIsGeneratingQuiz(false);
      return;
    }

    try {
      // Clean up Gutenberg metadata (start/end markers)
      // More robust splitting for different Gutenberg variations
      let cleanText = rawText;
      const startMarkers = [
        '*** START OF THE PROJECT GUTENBERG EBOOK',
        '*** START OF THIS PROJECT GUTENBERG EBOOK',
        '***START OF THE PROJECT GUTENBERG EBOOK',
        '***START OF THIS PROJECT GUTENBERG EBOOK'
      ];
      const endMarkers = [
        '*** END OF THE PROJECT GUTENBERG EBOOK',
        '*** END OF THIS PROJECT GUTENBERG EBOOK',
        '***END OF THE PROJECT GUTENBERG EBOOK',
        '***END OF THIS PROJECT GUTENBERG EBOOK'
      ];

      for (const marker of startMarkers) {
        if (cleanText.includes(marker)) {
          cleanText = cleanText.split(marker)[1];
          // Usually there's a title line after the marker
          const lines = cleanText.split('\n');
          if (lines.length > 5) cleanText = lines.slice(5).join('\n');
          break;
        }
      }

      for (const marker of endMarkers) {
        if (cleanText.includes(marker)) {
          cleanText = cleanText.split(marker)[0];
          break;
        }
      }
        
      setText(cleanText.trim());
      paginateText(cleanText.trim());
    } catch (error) {
      console.error("Text processing error:", error);
      setText(rawText.substring(0, 5000)); // Fallback to raw text if cleaning fails
      paginateText(rawText.substring(0, 5000));
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const paginateText = (fullText: string) => {
    const wordsPerPage = 250;
    const allWords = fullText.split(/\s+/);
    const newPages: string[] = [];
    
    for (let i = 0; i < allWords.length; i += wordsPerPage) {
      newPages.push(allWords.slice(i, i + wordsPerPage).join(' '));
    }
    
    setPages(newPages);
    setCurrentPage(0);

    // Update total pages in user_books
    if (bookId && user) {
      updateTotalPages(newPages.length);
    }
  };

  const updateTotalPages = async (total: number) => {
    if (!user || user.id === 'guest-user' || !bookId) return;
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.from('user_books')
        .update({ total_pages: total })
        .eq('user_id', user.id)
        .eq('book_id', bookId);
    } catch (e) {}
  };

  useEffect(() => {
    if (isReading) {
      setStartTime(Date.now());
      if (currentCharIndex === 0) {
        setReReadCount(prev => prev + 1);
      }
    } else if (startTime) {
      const endTime = Date.now();
      const minutesRead = (endTime - startTime) / 60000;
      updateProgress(minutesRead);
      setStartTime(null);
    }
  }, [isReading]);

  const updateProgress = async (minutes: number, score?: number, isNewPage?: boolean) => {
    if (!user || user.id === 'guest-user' || (minutes < 0.1 && score === undefined && !isNewPage)) return;

    try {
      const { supabase } = await import('@/lib/supabase');
      
      // Update general progress
      const { data: currentData } = await supabase
        .from('progress')
        .select('*')
        .eq('id', user.id)
        .single();
      
      const today = new Date();
      const currentDayName = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][today.getDay()];

      if (currentData) {
        const weeklyActivity = currentData.weekly_activity || [];
        
        // Update weekly activity
        const dayIndex = weeklyActivity.findIndex((d: any) => d.day === currentDayName);
        if (dayIndex > -1) {
          weeklyActivity[dayIndex].value = (weeklyActivity[dayIndex].value || 0) + minutes;
        } else {
          weeklyActivity.push({ day: currentDayName, value: minutes });
        }

        // Keep only last 7 days
        if (weeklyActivity.length > 7) weeklyActivity.shift();

        const newScore = score !== undefined 
          ? ((currentData.comprehension_score || 0) + score) / (currentData.quiz_count ? currentData.quiz_count + 1 : 1)
          : currentData.comprehension_score;

        await supabase.from('progress').update({
          current_minutes: (currentData.current_minutes || 0) + minutes,
          total_words: (currentData.total_words || 0) + (isReading ? 0 : words.length),
          pages_read: (currentData.pages_read || 0) + (isNewPage ? 1 : 0),
          re_reads: (currentData.re_reads || 0) + (minutes > 0.5 ? 1 : 0),
          comprehension_score: Math.round(newScore || 0),
          quiz_count: score !== undefined ? (currentData.quiz_count || 0) + 1 : (currentData.quiz_count || 0),
          weekly_activity: weeklyActivity,
          updated_at: new Date().toISOString()
        }).eq('id', user.id);
      } else {
        // Initialize
        await supabase.from('progress').insert({
          id: user.id,
          current_minutes: minutes,
          total_words: words.length,
          pages_read: isNewPage ? 1 : 0,
          re_reads: 0,
          comprehension_score: score || 0,
          quiz_count: score !== undefined ? 1 : 0,
          weekly_activity: [{ day: currentDayName, value: minutes }],
          updated_at: new Date().toISOString()
        });
      }

      // Update book specific progress
      if (bookId && (isNewPage || minutes > 0)) {
        await supabase.from('user_books')
          .update({ 
            pages_read: currentPage + 1,
            last_read: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('book_id', bookId);
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const generateQuiz = async () => {
    if (!text || text.length < 50) return;
    setIsGeneratingQuiz(true);
    setShowQuiz(true);
    setQuizFinished(false);
    setQuizScore(0);
    setCurrentQuestionIndex(0);

    try {
      const prompt = `Create a 3-question multiple choice quiz about the following text for a neurodiverse learner. 
      The questions should be simple and direct. 
      Respond ONLY with a JSON array of objects, each having:
      "question": string,
      "options": string[] (exactly 4),
      "correctAnswer": number (0-3),
      "explanation": string (short, encouraging explanation of why the answer is correct).
      Language: ${language}.
      Text: ${text}`;

      const result = await generateAIContent({
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const questions = JSON.parse(result.text || '[]');
      setQuizQuestions(questions);
    } catch (error) {
      console.error("Quiz generation error:", error);
      setShowQuiz(false);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIndex);
    setShowExplanation(true);
    const isCorrect = optionIndex === quizQuestions[currentQuestionIndex].correctAnswer;
    if (isCorrect) setQuizScore(prev => prev + 1);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
      const finalScorePercent = Math.round((quizScore / quizQuestions.length) * 100);
      updateProgress(0, finalScorePercent);
      
      // Award XP for quiz completion
      if (finalScorePercent >= 50) {
        addXP(rewards.COMPLETE_CHALLENGE, "Quiz Master");
      } else {
        addXP(rewards.USE_TOOL, "Quiz attempt");
      }
    }
  };

  useEffect(() => {
    return () => {
      stopTts();
    };
  }, []);

  const stopTts = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {}
      audioSourceRef.current = null;
    }
    setIsReading(false);
  };

  const playGeminiTts = async () => {
    if (!text || isTtsLoading) return;
    if (isReading) {
      stopTts();
      return;
    }

    setIsTtsLoading(true);
    try {
      // Select voice based on language
      const voiceMap = {
        en: 'Kore',
        es: 'Kore',
        sw: 'Zephyr'
      };
      const voiceName = voiceMap[language as keyof typeof voiceMap] || 'Kore';

      const response = await generateAIContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: text.substring(0, 3000) }] }], // Limit length for stability
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("No audio returned");

      // Initialize AudioContext on user gesture
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Gemini TTS returns PCM L16 24000Hz. We need to convert this to an AudioBuffer.
      // Note: This is raw PCM, not a WAV/MP3.
      const rawData = bytes.buffer;
      const int16Array = new Int16Array(rawData);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768; // Normalize -1 to 1
      }

      const audioBuffer = audioContext.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      source.onended = () => {
        setIsReading(false);
        setCurrentWordIndex(-1);
      };

      audioSourceRef.current = source;
      source.start(0);
      setIsReading(true);
      
      // Simulation of word highlighting (rough approximation)
      // Since we don't have boundaries from Gemini TTS yet, we'll just highlight the start
      setCurrentWordIndex(0);

    } catch (error) {
      console.error("Gemini TTS Error:", error);
    } finally {
      setIsTtsLoading(false);
    }
  };

  const handlePlayPause = () => {
    playGeminiTts();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsGeneratingQuiz(true);
    setBookTitle(file.name.replace(/\.[^/.]+$/, ""));
    
    try {
      const fileData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      
      const result = await generateAIContent({
        model: "gemini-1.5-flash",
        contents: [{
          parts: [
            {
              inlineData: {
                data: fileData,
                mimeType: file.type
              }
            },
            { text: `Extract all visible text from this document accurately. Maintain the reading order and structure. If there are multiple columns, read left to right, top to bottom. Respond only with the extracted text in ${language}.` }
          ]
        }]
      });
      
      const extractedText = result.text || '';
      if (extractedText) {
        setText(extractedText);
        paginateText(extractedText);
      } else {
        throw new Error("No text could be extracted from this file.");
      }
    } catch (error) {
      console.error("File processing error:", error);
      alert("We had trouble reading that file. Please try a clearer photo or a different file type.");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSummarize = async () => {
    if (!text || isSummarizing) return;
    setIsSummarizing(true);
    try {
      const result = await generateAIContent({
        contents: [{ parts: [{ text: `Summarize the following text in ${language} using very simple, child-friendly language. Focus on the main ideas and keep it brief: ${pages[currentPage]}` }] }]
      });
      setSummary(result.text || "Could not generate summary.");
    } catch (error) {
      console.error("Summarization error:", error);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSimplify = async () => {
    if (!text || isSimplifying) return;
    setIsSimplifying(true);
    try {
      const result = await generateAIContent({
        contents: [{ parts: [{ text: `Rewrite the following text in ${language} to be much simpler and easier to read. Use short sentences and simple words. Keep the meaning the same: ${pages[currentPage]}` }] }]
      });
      
      const simplifiedText = result.text || pages[currentPage];
      // Replace the current page with simplified text or just show it?
      // For now, let's just update the current page in a temporary way
      const newPages = [...pages];
      newPages[currentPage] = simplifiedText;
      setPages(newPages);
    } catch (error) {
      console.error("Simplification error:", error);
    } finally {
      setIsSimplifying(false);
    }
  };
  const handleVoiceCommand = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : 'fr-FR';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log("Voice command:", command);

      if (command.includes('read') || command.includes('play') || command.includes('start')) {
        playGeminiTts();
      } else if (command.includes('stop') || command.includes('pause')) {
        if (audioSourceRef.current) {
          audioSourceRef.current.stop();
          setIsReading(false);
        }
      } else if (command.includes('simplify')) {
        handleSimplify();
      } else if (command.includes('summarize') || command.includes('explain')) {
        handleSummarize();
      } else if (command.includes('next')) {
        handleNextPage();
      } else if (command.includes('back')) {
        handlePrevPage();
      }
    };

    recognition.start();
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isLineFocus) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setFocusY(clientY);
  };

  const handleWordClick = async (word: string) => {
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    setSelectedWord(cleanWord);
    setIsDefining(true);
    setWordDefinition(null);
    setWordSaved(false);
    
    try {
      const result = await generateAIContent({
        contents: [{ parts: [{ text: `Provide a simple, child-friendly definition and one example sentence for the word "${cleanWord}" in ${language}. Keep it very brief and easy to understand.` }] }]
      });
      setWordDefinition(result.text || "I'm sorry, I couldn't find a definition for that word right now.");
      
      // Check if word is already saved
      if (user && user.id !== 'guest-user') {
        const { data } = await supabase
          .from('glossary')
          .select('id')
          .eq('word', cleanWord.toLowerCase())
          .single();
        
        if (data) setWordSaved(true);
      }
    } catch (error) {
      console.error("Definition error:", error);
      setWordDefinition("I'm sorry, I couldn't find a definition for that word right now.");
    } finally {
      setIsDefining(false);
    }
  };

  const handleSaveToGlossary = async () => {
    if (!selectedWord || !wordDefinition || wordSaved) return;
    if (!user || user.id === 'guest-user') {
      alert("Sign in to save words to your glossary!");
      return;
    }
    
    setIsSavingWord(true);
    try {
      const { error } = await supabase
        .from('glossary')
        .insert({
          word: selectedWord.toLowerCase(),
          definition: wordDefinition,
          language: language
        });

      if (error) throw error;
      setWordSaved(true);
      addXP(rewards.SAVE_WORD, "New word learned", [{ id: '2', increment: 1 }]);
    } catch (error) {
      console.error('Error saving to glossary:', error);
    } finally {
      setIsSavingWord(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
      setPagesReadInSession(prev => prev + 1);
      updateProgress(0, undefined, true);
      addXP(rewards.READ_MINUTE / 2, "Page read", [{ id: '1', increment: 1 }]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Layout>
      <div className={`min-h-screen transition-colors duration-500 pb-64 ${
        theme === 'cream' ? 'bg-[#fcf8ef]' : 
        theme === 'green' ? 'bg-[#f0f7f0]' : 
        theme === 'dark' ? 'bg-stone-950' : 
        'bg-surface'
      }`}>
        <div ref={containerRef} className="max-w-4xl mx-auto px-6 pt-12">
          {/* AI Status Chip */}
          <div className="flex justify-center mb-8">
            <button className={`px-6 py-2 rounded-full border flex items-center gap-2 transition-all ${
              theme === 'dark' ? 'bg-stone-900 border-stone-800' : 'bg-surface-container-low border-surface-container-highest'
            }`}>
              <Sparkles className="w-4 h-4 text-primary fill-current" />
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-stone-400' : 'text-on-surface-variant'}`}>Jumu Ai is ready to assist</span>
            </button>
          </div>

          {(!text && !isBookLoading) ? (
            <div className="space-y-12 pb-32">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-3xl p-12 text-center border-2 border-dashed transition-all ${
                  theme === 'dark' ? 'bg-stone-900 border-stone-800' : 'bg-white border-surface-container-highest'
                }`}
              >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-primary" />
                </div>
                <h2 className={`font-headline text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-stone-100' : 'text-on-surface'}`}>What would you like to read?</h2>
                <p className={`mb-8 max-w-sm mx-auto ${theme === 'dark' ? 'text-stone-400' : 'text-on-surface-variant'}`}>Paste text or upload a file to start your personalized reading experience.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      setText(text);
                      paginateText(text);
                    } catch (err) {
                      console.error('Failed to read clipboard:', err);
                    }
                  }}
                  className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all"
                >
                  <Clipboard className="w-5 h-5" />
                  Paste from Clipboard
                </button>
                <label className="flex items-center justify-center gap-2 bg-surface-container-low text-primary px-8 py-4 rounded-xl font-bold hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer">
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
                  <Upload className="w-5 h-5" />
                  Upload File
                </label>
              </div>
            </motion.div>

            {recentBooks.length > 0 && (
              <section>
                <h3 className="font-headline text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
                  <Library className="w-6 h-6 text-primary" />
                  Recently Read
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recentBooks.map((book) => (
                    <motion.div 
                      key={book.book_id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white p-4 rounded-2xl border border-surface-container-high flex gap-4 cursor-pointer"
                      onClick={() => {
                        setBookTitle(book.title);
                        setBookId(book.book_id);
                        setBookCover(book.cover_url);
                        setBookUrl(book.book_url);
                        setIsBookLoading(true);
                        fetchBookContent(book.book_url);
                        upsertUserBook(book.book_id, book.title, book.cover_url, book.book_url);
                      }}
                    >
                      <div className="w-16 h-20 bg-surface-container-low rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                        {book.cover_url ? (
                          <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5">
                            <BookOpen className="w-6 h-6 text-primary/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center overflow-hidden">
                        <h4 className="font-bold text-on-surface line-clamp-1 mb-1">{book.title}</h4>
                        <div className="text-[10px] font-bold text-primary uppercase tracking-widest">
                          {Math.round((book.pages_read / (book.total_pages || 1)) * 100)}% Complete
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-surface-container-highest self-center" />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <section 
            className="space-y-12 relative pb-96"
            onMouseMove={handleMouseMove}
            onTouchMove={handleMouseMove}
          >
            {isBookLoading ? (
              <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
                <div className="flex justify-between items-center mb-12">
                   <div className="h-4 bg-stone-200 rounded w-1/4"></div>
                   <div className="h-4 bg-stone-200 rounded w-1/4"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-8 bg-stone-200 rounded w-3/4"></div>
                  <div className="h-4 bg-stone-200 rounded w-full"></div>
                  <div className="h-4 bg-stone-200 rounded w-full"></div>
                  <div className="h-4 bg-stone-200 rounded w-5/6"></div>
                  <div className="h-4 bg-stone-200 rounded w-full"></div>
                  <div className="h-4 bg-stone-200 rounded w-4/5"></div>
                </div>
                <div className="pt-12 text-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                  <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">Preparing your summary & quiz...</p>
                </div>
              </div>
            ) : (
              <>
                {isLineFocus && (
              <div 
                className="fixed inset-0 z-[50] pointer-events-none transition-opacity duration-300"
                style={{
                  background: `linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.7) ${focusY - 50}px, transparent ${focusY - 50}px, transparent ${focusY + 50}px, rgba(0,0,0,0.7) ${focusY + 50}px, rgba(0,0,0,0.7) 100%)`
                }}
              />
            )}
            {bookTitle && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between pb-4 border-b border-surface-container-highest">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <h3 className="font-headline text-xl font-bold text-on-surface line-clamp-1">{bookTitle}</h3>
                  </div>
                  {pages.length > 0 && (
                    <div className="bg-surface-container-low px-4 py-1.5 rounded-full text-sm font-bold text-primary border border-surface-container-high">
                      Page {currentPage + 1} of {pages.length}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={handleSimplify}
                    disabled={isSimplifying}
                    className="flex-1 bg-primary/10 text-primary px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/20 transition-all disabled:opacity-50"
                  >
                    {isSimplifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    Simplify Page
                  </button>
                  <button 
                    onClick={handleSummarize}
                    disabled={isSummarizing}
                    className="flex-1 bg-primary/10 text-primary px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/20 transition-all disabled:opacity-50"
                  >
                    {isSummarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                    Explain Main Idea
                  </button>
                  <button 
                    onClick={handleVoiceCommand}
                    className={`flex-1 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                      isListening ? 'bg-error text-white animate-pulse' : 'bg-primary/10 text-primary hover:bg-surface-container-high'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    {isListening ? 'Listening...' : 'Assistant'}
                  </button>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Persona:
                  </div>
                  {(['narrator', 'teacher', 'friend'] as const).map(p => (
                    <button 
                      key={p}
                      onClick={() => setPersona(p)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        persona === p ? 'bg-primary text-white border-primary' : 'bg-surface-container-low text-on-surface-variant border-surface-container-high'
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>

                {summary && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 p-6 rounded-3xl border border-amber-200 relative"
                  >
                    <button 
                      onClick={() => setSummary(null)}
                      className="absolute top-4 right-4 text-amber-500 hover:text-amber-700"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-amber-500 mt-1" />
                      <div>
                        <p className="font-bold text-amber-900 mb-1">Jumu Ai's Summary</p>
                        <p className="text-amber-800 leading-relaxed">{summary}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
            
            <div className="relative group">
              <div className="absolute -inset-8 bg-primary/5 rounded-3xl blur-3xl -z-10 opacity-50" />
              <div 
                className={`tracking-tight transition-all ${isChunked ? 'space-y-4' : ''} ${
                  theme === 'dark' ? 'text-stone-300' : 'text-on-surface'
                }`}
                style={{ 
                  fontSize: `${fontSize}px`,
                  lineHeight: lineSpacing,
                  fontFamily: isDyslexic ? 'OpenDyslexic, sans-serif' : 'Inter, sans-serif'
                }}
              >
                {words.map((word, i) => {
                  const isCurrent = i === currentWordIndex;
                  
                  // Bionic Reading Formatter
                  const renderBionic = (w: string) => {
                    if (!isBionic || isCurrent) return w;
                    const mid = Math.ceil(w.length / 2);
                    return (
                      <>
                        <span className="font-black opacity-100">{w.slice(0, mid)}</span>
                        <span className="opacity-60">{w.slice(mid)}</span>
                      </>
                    );
                  };

                  return (
                    <span 
                      key={i}
                      onClick={() => handleWordClick(word)}
                      className={`inline-block cursor-pointer rounded px-1 transition-all ${
                        isCurrent 
                          ? 'bg-primary text-white shadow-lg scale-110' 
                          : isBionic ? 'hover:bg-primary/5' : 'hover:bg-primary/10'
                      } ${isChunked && i % 5 === 0 ? 'mr-4' : 'mr-1.5'}`}
                    >
                      {renderBionic(word)}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Pagination Actions */}
            {pages.length > 1 && (
              <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-surface-container-highest shadow-sm mt-8">
                <button 
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-primary disabled:opacity-30 hover:bg-primary/5 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>
                <div className="text-sm font-bold text-on-surface-variant">
                  {currentPage + 1} / {pages.length}
                </div>
                <button 
                  onClick={handleNextPage}
                  disabled={currentPage === pages.length - 1}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-primary text-white disabled:opacity-30 shadow-lg shadow-primary/10 active:scale-95 transition-all"
                >
                  Next Page
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Focus Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => setIsChunked(!isChunked)}
                className={`px-8 py-4 rounded-full flex items-center gap-3 transition-all active:scale-95 ${isChunked ? 'bg-primary text-white' : 'bg-surface-container-low text-primary'}`}
              >
                <Wand2 className="w-5 h-5" />
                <span className="font-headline font-semibold">{isChunked ? 'Unchunk text' : 'Chunk text'}</span>
              </button>
              <button 
                onClick={generateQuiz}
                disabled={!text || text.length < 50}
                className="bg-primary/10 text-primary px-8 py-4 rounded-full flex items-center gap-3 hover:bg-primary/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <Brain className="w-5 h-5" />
                <span className="font-headline font-semibold">Check Understanding</span>
              </button>
              <button 
                onClick={() => {
                  setText('');
                  setCurrentCharIndex(0);
                  setCurrentWordIndex(-1);
                  window.speechSynthesis.cancel();
                }}
                className="bg-surface-container-low text-on-surface-variant px-8 py-4 rounded-full flex items-center gap-3 hover:bg-surface-container-high transition-colors active:scale-95"
              >
                Clear
              </button>
            </div>
          </>
        )}
      </section>
    )}

    {/* Quiz Modal */}
        <AnimatePresence>
          {showQuiz && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-headline text-2xl font-bold text-primary flex items-center gap-3">
                      <Brain className="w-6 h-6" />
                      Understanding Check
                    </h3>
                    <button 
                      onClick={() => setShowQuiz(false)}
                      className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
                    >
                      <XCircle className="w-6 h-6 text-stone-400" />
                    </button>
                  </div>

                  {isGeneratingQuiz ? (
                    <div className="py-20 text-center">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                      <p className="font-headline font-bold text-primary">Creating your quiz...</p>
                    </div>
                  ) : quizFinished ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h4 className="text-3xl font-headline font-bold mb-2">
                        {quizScore === quizQuestions.length ? 'Perfect Score!' : quizScore >= quizQuestions.length / 2 ? 'Great Job!' : 'Keep Practicing!'}
                      </h4>
                      <p className="text-on-surface-variant text-lg mb-2">You scored {quizScore} out of {quizQuestions.length}</p>
                      <p className="text-primary font-medium mb-8">
                        {quizScore === quizQuestions.length 
                          ? "Excellent! You understood everything perfectly." 
                          : quizScore >= quizQuestions.length / 2 
                            ? "Good job! You have a solid grasp of the material."
                            : "Keep going! Re-reading the text might help clarify some parts."}
                      </p>
                      <button 
                        onClick={() => setShowQuiz(false)}
                        className="bg-primary text-white px-10 py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all"
                      >
                        Back to Reading
                      </button>
                    </div>
                  ) : quizQuestions.length > 0 ? (
                    <div>
                      <div className="mb-8">
                        <div className="flex justify-between text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                          <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
                          <span>Score: {quizScore}</span>
                        </div>
                        <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                          />
                        </div>
                      </div>

                      <h4 className="text-2xl font-medium text-on-surface mb-8 leading-relaxed">
                        {quizQuestions[currentQuestionIndex].question}
                      </h4>

                      <div className="grid grid-cols-1 gap-3 mb-8">
                        {quizQuestions[currentQuestionIndex].options.map((option, i) => (
                          <button 
                            key={i}
                            onClick={() => handleAnswer(i)}
                            disabled={selectedOption !== null}
                            className={`p-6 rounded-2xl border-2 text-left font-medium transition-all ${
                              selectedOption === i 
                                ? i === quizQuestions[currentQuestionIndex].correctAnswer 
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                                  : 'bg-error/5 border-error text-error'
                                : selectedOption !== null && i === quizQuestions[currentQuestionIndex].correctAnswer
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                  : 'bg-surface-container-low border-transparent hover:border-surface-container-highest'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span>{option}</span>
                              {selectedOption !== null && i === quizQuestions[currentQuestionIndex].correctAnswer && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              )}
                              {selectedOption === i && i !== quizQuestions[currentQuestionIndex].correctAnswer && (
                                <XCircle className="w-5 h-5 text-error" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>

                      {showExplanation && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-6 rounded-2xl mb-8 ${
                            selectedOption === quizQuestions[currentQuestionIndex].correctAnswer 
                              ? 'bg-emerald-50 text-emerald-800' 
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 mt-0.5" />
                            <p className="font-medium">{quizQuestions[currentQuestionIndex].explanation}</p>
                          </div>
                        </motion.div>
                      )}

                      {selectedOption !== null && (
                        <button 
                          onClick={nextQuestion}
                          className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'See Results'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-on-surface-variant">Something went wrong. Please try again.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Word Definition Modal */}
        <AnimatePresence>
          {selectedWord && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/20 backdrop-blur-sm"
              onClick={() => setSelectedWord(null)}
            >
              <div 
                className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4 text-primary">
                  <Info className="w-6 h-6" />
                  <h3 className="text-2xl font-headline font-bold capitalize">{selectedWord}</h3>
                </div>
                <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
                  {isDefining ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Finding definition...
                    </span>
                  ) : wordDefinition ? (
                    wordDefinition
                  ) : (
                    "Loading definition..."
                  )}
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleSaveToGlossary}
                    disabled={isSavingWord || wordSaved || isDefining || !wordDefinition}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      wordSaved 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    } disabled:opacity-50`}
                  >
                    {isSavingWord ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : wordSaved ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Saved to Glossary
                      </>
                    ) : (
                      <>
                        <BookMarked className="w-5 h-5" />
                        Add to Glossary
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => setSelectedWord(null)}
                    className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Accessibility Controls Overlay */}
        <div className="fixed bottom-0 left-0 w-full z-[100] px-4 pb-8 pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto">
            <AnimatePresence>
              {isControlsExpanded ? (
                <motion.div 
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="bg-surface/90 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-surface-container-highest/30 relative"
                >
                  <button 
                    onClick={() => setIsControlsExpanded(false)}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 bg-surface border border-surface-container-highest rounded-full p-2 shadow-lg hover:bg-surface-container-high transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </button>

                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-surface-container-highest">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={handlePlayPause}
                        disabled={isTtsLoading}
                        className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-50"
                      >
                        {isTtsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : isReading ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                      </button>
                      <div>
                        <div className="font-bold text-on-surface leading-tight">Reading Aloud</div>
                        <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black">Natural Voice</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex flex-col gap-1">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Pitch</label>
                        <input 
                          type="range" min="0.5" max="2" step="0.1" value={pitch}
                          onChange={e => setPitch(Number(e.target.value))}
                          className="w-20 h-1 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Speed</label>
                        <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1 rounded-full">
                          <button onClick={() => setSpeed(s => Math.max(0.5, s - 0.25))}><Minus className="w-3 h-3" /></button>
                          <span className="text-xs font-bold text-primary w-8 text-center">{speed}x</span>
                          <button onClick={() => setSpeed(s => Math.min(2, s + 0.25))}><Plus className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Theme</label>
                      <div className="flex flex-wrap gap-2">
                        {(['light', 'cream', 'green', 'dark'] as const).map(t => (
                          <button 
                            key={t}
                            onClick={() => setTheme(t)}
                            className={`h-8 w-8 rounded-full border-2 transition-all ${
                              theme === t ? 'border-primary scale-110' : 'border-transparent'
                            } ${
                              t === 'light' ? 'bg-white' : 
                              t === 'cream' ? 'bg-[#fcf8ef]' : 
                              t === 'green' ? 'bg-[#f0f7f0]' : 
                              'bg-stone-900'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Tools</label>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => setIsLineFocus(!isLineFocus)}
                          className={`w-full py-2 text-[10px] font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                            isLineFocus ? 'bg-primary text-white border-primary' : 'bg-white text-stone-500 border-surface-container-highest hover:bg-surface-container-high'
                          }`}
                        >
                          {isLineFocus ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          Focus
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Reading</label>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => setIsChunked(!isChunked)}
                          className={`w-full py-2 text-[10px] font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                            isChunked ? 'bg-primary text-white border-primary' : 'bg-white text-stone-500 border-surface-container-highest hover:bg-surface-container-high'
                          }`}
                        >
                          <Wand2 className="w-3 h-3" />
                          Chunking
                        </button>
                        <button 
                          onClick={() => setIsBionic(!isBionic)}
                          className={`w-full py-2 text-[10px] font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                            isBionic ? 'bg-primary text-white border-primary' : 'bg-white text-stone-500 border-surface-container-highest hover:bg-surface-container-high'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          Bionic
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Text</label>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => setIsDyslexic(!isDyslexic)}
                          className={`w-full py-2 text-[10px] font-bold rounded-xl border ${isDyslexic ? 'bg-primary text-white border-primary' : 'bg-white text-stone-500 border-surface-container-highest'}`}
                        >
                          Dyslexic
                        </button>
                        <div className="flex items-center gap-3 bg-surface-container-low px-3 h-8 rounded-xl w-full">
                          <button onClick={() => setFontSize(s => Math.max(12, s - 2))}><Minus className="w-3 h-3 text-stone-500" /></button>
                          <span className="text-[10px] font-bold flex-1 text-center">{fontSize}</span>
                          <button onClick={() => setFontSize(s => Math.min(72, s + 2))}><Plus className="w-3 h-3 text-stone-500" /></button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Voice</label>
                      <button className="w-full flex items-center justify-between bg-surface-container-low px-4 h-10 rounded-xl text-[10px] font-bold">
                        <span className="capitalize">{language === 'en' ? 'English' : language === 'sw' ? 'Swahili' : 'Spanish'}</span>
                        <Volume2 className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="flex justify-center"
                >
                  <button 
                    onClick={() => setIsControlsExpanded(true)}
                    className="bg-primary text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 font-headline font-bold active:scale-95 transition-all"
                  >
                    <BookMarked className="w-5 h-5" />
                    Reader Settings
                    <ChevronRight className="w-5 h-5 -rotate-90" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        </div>
      </div>
    </Layout>
  );
}
