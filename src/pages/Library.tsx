import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Book, Loader2, Search, ChevronRight, Library, BookOpen, Sparkles, BarChart3, ArrowRight } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { TapEffect } from '@/components/TapEffect';
import { rewards } from '@/lib/gamification';

interface GutenbergBook {
  id: number;
  title: string;
  authors: { name: string }[];
  subjects: string[];
  languages: string[];
  formats: { [key: string]: string };
  download_count: number;
}

export default function Writer() {
  const { language, t, user, addXP } = useApp();
  
  // Recent Reading State
  const [recentBooks, setRecentBooks] = useState<any[]>([]);

  // Library State
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryBooks, setLibraryBooks] = useState<GutenbergBook[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const childrenCategories = [
    { name: 'Fairy Tales', query: 'fairy tales' },
    { name: 'Adventures', query: 'adventure children' },
    { name: 'Animal Stories', query: 'animals children' },
    { name: 'Poetry', query: 'poetry children' },
  ];

  const searchBooks = async (customQuery?: string) => {
    setIsLibraryLoading(true);
    const q = customQuery || searchQuery;
    try {
      const response = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(q)}&languages=${selectedLanguage}`);
      const data = await response.json();
      setLibraryBooks(data.results || []);
    } catch (error) {
      console.error("Library Error:", error);
    } finally {
      setIsLibraryLoading(false);
    }
  };

  const navigate = useNavigate();

  const readBookInternal = async (book: GutenbergBook) => {
    const textUrl = book.formats['text/plain; charset=utf-8'] || book.formats['text/plain'] || book.formats['text/html'];
    if (!textUrl) {
      window.open(`https://www.gutenberg.org/ebooks/${book.id}`, '_blank');
      return;
    }

    try {
      setIsLibraryLoading(true);
      addXP(rewards.USE_TOOL, "Exploring new book", [{ id: '4', increment: 1 }]);
      // We use a proxy or direct fetch if CORS allows, Gutendex/Gutenberg usually needs a proxy for raw text
      // For this demo, we'll navigate to reader and let it handle the fetch or use a snippet
      navigate('/reader', { 
        state: { 
          bookTitle: book.title, 
          bookId: book.id, 
          bookUrl: textUrl,
          bookCover: book.formats['image/jpeg'] || null
        } 
      });
    } catch (error) {
      console.error("Fetch book error:", error);
    } finally {
      setIsLibraryLoading(false);
    }
  };

  const fetchRecentBooks = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_books')
      .select('*')
      .eq('user_id', user.id)
      .order('last_read', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recent books:', error);
    } else if (data) {
      setRecentBooks(data);
    }
  };

  useEffect(() => {
    if (libraryBooks.length === 0 && !searchQuery) {
      searchBooks('children'); // Default search for children's books
    }
    
    if (user) {
      fetchRecentBooks();
      
      const channel = supabase
        .channel('library_recent_books')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'user_books',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchRecentBooks();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const featuredBooks = libraryBooks.slice(0, 3);
  const remainingBooks = libraryBooks.slice(3);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 pb-32">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Library className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-headline text-4xl font-extrabold text-primary">Classic Library</h2>
          </div>
          <p className="text-on-surface-variant text-lg bg-surface-container-low/50 p-4 rounded-xl border border-surface-container-high/30">
            Open a digital world of classic stories. Explore thousands of free children's books and historical favorites.
          </p>

          <div className="flex flex-wrap gap-2 mt-8">
            {childrenCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setSearchQuery(cat.query);
                  searchBooks(cat.query);
                }}
                className={cn(
                  "px-6 py-3 rounded-xl font-bold transition-all border-2",
                  searchQuery === cat.query 
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105" 
                    : "bg-surface-container-low border-transparent text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Continue Reading & Progress Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <h3 className="font-headline text-2xl font-bold text-on-surface mb-6">Continue Reading</h3>
            {recentBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {recentBooks.map((book) => {
                  const percent = Math.min((book.pages_read / (book.total_pages || 1)) * 100, 100);
                  return (
                    <div key={book.book_id}>
                      <TapEffect>
                        <Link 
                          to="/reader" 
                          state={{ bookTitle: book.title, bookId: book.book_id, bookUrl: book.book_url, bookCover: book.cover_url }}
                          className="flex bg-white rounded-2xl p-4 border border-surface-container-high transition-all hover:shadow-xl group"
                        >
                          <div className="w-20 h-28 bg-surface-container-low rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                            {book.cover_url ? (
                              <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-300">
                                <BookOpen className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4 flex-1 flex flex-col justify-between py-1">
                            <div>
                              <h4 className="font-bold text-on-surface line-clamp-2 leading-snug mb-1">{book.title}</h4>
                              <div className="text-xs font-bold text-primary uppercase tracking-widest">{percent >= 100 ? 'Completed' : `${Math.round(percent)}% Read`}</div>
                            </div>
                            <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden mt-3">
                              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        </Link>
                      </TapEffect>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-surface-container-highest">
                <Book className="w-10 h-10 text-stone-200 mx-auto mb-4" />
                <p className="text-on-surface-variant font-medium">Select a book below to start your journey!</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-8 border border-surface-container-high shadow-sm flex flex-col h-full">
            <h3 className="font-headline text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Reading Progress
            </h3>
            {recentBooks.length > 0 ? (
              <>
                <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recentBooks.slice(0, 5).map(b => ({ name: b.title, pages: b.pages_read }))} layout="vertical" margin={{ left: 0, right: 30 }}>
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={80} 
                        fontSize={10} 
                        tick={{ fill: '#78716c', fontWeight: 600 }}
                        tickFormatter={(val) => val.length > 10 ? val.substring(0, 10) + '...' : val}
                      />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="pages" radius={[0, 4, 4, 0]} barSize={20}>
                        {recentBooks.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#4A6267' : '#9EBABF'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 pt-4 border-t border-surface-container-highest text-center">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Pages Read by Book</p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-30">
                <BarChart3 className="w-12 h-12 mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">No Progress Yet</p>
              </div>
            )}
          </div>
        </section>

        {/* Featured Section */}
        {featuredBooks.length > 0 && !searchQuery && (
          <section className="mb-12">
            <h3 className="font-headline text-2xl font-bold text-primary mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Editor's Top Picks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredBooks.map((book) => (
                <motion.div 
                  key={`featured-${book.id}`}
                  whileHover={{ y: -5 }}
                  className="bg-primary/5 rounded-3xl p-6 border-2 border-primary/20 flex flex-col items-center text-center group cursor-pointer"
                  onClick={() => readBookInternal(book)}
                >
                  <div className="w-full aspect-[3/4] bg-white rounded-2xl mb-4 shadow-xl overflow-hidden">
                    {book.formats['image/jpeg'] ? (
                      <img src={book.formats['image/jpeg']} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <Book className="w-12 h-12 text-primary/20" />
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-primary line-clamp-1 mb-1">{book.title}</h4>
                  <p className="text-xs font-medium text-primary/60 mb-4">{book.authors[0]?.name || 'Unknown'}</p>
                  <button className="w-full py-3 bg-primary text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20">
                    Read Now
                  </button>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-surface-container-highest">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 w-5 h-5" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchBooks()}
                  placeholder="Search titles or authors..."
                  className="w-full bg-surface-container-low border-none rounded-2xl pl-12 pr-6 py-4 text-lg font-medium"
                />
              </div>
              <div className="flex gap-4">
                <select 
                  value={selectedLanguage}
                  onChange={e => setSelectedLanguage(e.target.value)}
                  className="bg-surface-container-low border-none rounded-2xl px-6 py-4 font-bold text-primary focus:ring-0"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
                <button 
                  onClick={() => searchBooks()}
                  disabled={isLibraryLoading}
                  className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isLibraryLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(searchQuery ? libraryBooks : remainingBooks).map((book) => (
              <motion.div 
                key={book.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-surface-container-high/50 rounded-3xl p-6 flex gap-6 hover:shadow-xl transition-all group"
              >
                <div className="w-24 h-32 bg-surface-container-low rounded-xl flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0">
                  {book.formats['image/jpeg'] ? (
                    <img src={book.formats['image/jpeg']} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <Book className="w-8 h-8 text-stone-300" />
                  )}
                </div>
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h4 className="font-bold text-lg line-clamp-2 mb-1 group-hover:text-primary transition-colors">{book.title}</h4>
                    <p className="text-on-surface-variant font-medium text-sm">{book.authors[0]?.name || 'Unknown Author'}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{book.download_count.toLocaleString()} reads</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => readBookInternal(book)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary/90 transition-all shadow-sm active:scale-95"
                      >
                        <BookOpen className="w-3 h-3" />
                        Read
                      </button>
                      <a 
                        href={book.formats['text/html'] || book.formats['text/plain'] || `https://www.gutenberg.org/ebooks/${book.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {libraryBooks.length === 0 && !isLibraryLoading && (
            <div className="text-center py-20 bg-surface-container-low/30 rounded-3xl border-2 border-dashed border-surface-container-high/50">
              <Library className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <p className="text-on-surface-variant font-medium">No results found. Try a different search term!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
