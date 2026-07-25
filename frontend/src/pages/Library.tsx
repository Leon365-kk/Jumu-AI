import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Book, Loader2, Search, ChevronRight, Library, BookOpen, BarChart3, ArrowRight, Star } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { cn } from '@/lib/utils';
import SEO from '@/lib/SEO';
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

export default function LibraryPage() {
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
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const response = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(q)}&languages=${selectedLanguage}`, { signal: controller.signal });
      clearTimeout(timeout);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      setLibraryBooks(data.results || []);
    } catch (error) {
      console.error("Library Error:", error);
      setLibraryBooks([]);
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
      searchBooks('children');
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
      <SEO
        title="Free Books Library — Jumu AI"
        description="Browse thousands of free classic books from Project Gutenberg in the Jumu AI Library. Accessible reading with text-to-speech for all ages and abilities."
        canonical="https://jumu.ai/library"
        ogType="website"
      />
      <div className="max-w-6xl mx-auto px-6 pb-32">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-600/10 rounded-lg flex items-center justify-center">
              <Library className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="font-headline text-4xl font-extrabold text-red-600">Classic Library</h2>
          </div>
          <p className="text-gray-600 text-lg bg-gray-100/50 p-4 rounded-xl border border-gray-300/30">
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
                    ? "bg-red-600 border-red-600 text-white scale-105" 
                    : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200"
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
            <h3 className="font-headline text-2xl font-bold text-gray-900 mb-6">Continue Reading</h3>
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
                          className="flex bg-white rounded-lg p-4 border border-gray-300 transition-all hover:shadow-xl group"
                        >
                          <div className="w-20 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                            {book.cover_url ? (
                              <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-red-600/5">
                                <BookOpen className="w-8 h-8 text-red-600/30" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4 flex-1 flex flex-col justify-between py-1">
                            <div>
                              <h4 className="font-bold text-gray-900 line-clamp-2 leading-snug mb-1">{book.title}</h4>
                              <div className="text-xs font-bold text-red-600 uppercase tracking-widest">{percent >= 100 ? 'Completed' : `${Math.round(percent)}% Read`}</div>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-3">
                              <div className="h-full bg-red-600 rounded-full transition-all" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        </Link>
                      </TapEffect>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
                <Book className="w-10 h-10 text-stone-200 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Select a book below to start your journey!</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-8 border border-gray-300 shadow-sm flex flex-col h-full">
            <h3 className="font-headline text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-600" />
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
                <div className="mt-4 pt-4 border-t border-gray-300 text-center">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Pages Read by Book</p>
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
            <h3 className="font-headline text-2xl font-bold text-red-600 mb-6 flex items-center gap-2">
              <Star className="w-6 h-6" />
              Editor's Top Picks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredBooks.map((book) => (
                <motion.div 
                  key={`featured-${book.id}`}
                  whileHover={{ y: -5 }}
                  className="bg-red-600/5 rounded-xl p-6 border-2 border-red-600/20 flex flex-col items-center text-center group cursor-pointer"
                  onClick={() => readBookInternal(book)}
                >
                  <div className="w-full aspect-[3/4] bg-white rounded-lg mb-4 shadow-xl overflow-hidden">
                    {book.formats['image/jpeg'] ? (
                      <img src={book.formats['image/jpeg']} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-red-600/5">
                        <Book className="w-12 h-12 text-red-600/20" />
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-red-600 line-clamp-1 mb-1">{book.title}</h4>
                  <p className="text-xs font-medium text-red-600/60 mb-4">{book.authors[0]?.name || 'Unknown'}</p>
                  <button className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-xs">
                    Read Now
                  </button>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <div className="space-y-8">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-300">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600/60 w-5 h-5" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchBooks()}
                  placeholder="Search titles or authors..."
                  className="w-full bg-gray-100 border-none rounded-lg pl-12 pr-6 py-4 text-lg font-medium"
                />
              </div>
              <div className="flex gap-4">
                <select 
                  value={selectedLanguage}
                  onChange={e => setSelectedLanguage(e.target.value)}
                  className="bg-gray-100 border-none rounded-lg px-6 py-4 font-bold text-red-600 focus:ring-0"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
                <button 
                  onClick={() => searchBooks()}
                  disabled={isLibraryLoading}
                  className="bg-red-600 text-white px-8 py-4 rounded-lg font-bold flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
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
                className="bg-white border border-gray-300/50 rounded-xl p-6 flex gap-6 hover:shadow-xl transition-all group"
              >
                <div className="w-24 h-32 bg-gray-100 rounded-xl flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0">
                  {book.formats['image/jpeg'] ? (
                    <img src={book.formats['image/jpeg']} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <Book className="w-8 h-8 text-stone-300" />
                  )}
                </div>
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h4 className="font-bold text-lg line-clamp-2 mb-1 group-hover:text-red-600 transition-colors">{book.title}</h4>
                    <p className="text-gray-600 font-medium text-sm">{book.authors[0]?.name || 'Unknown Author'}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{book.download_count.toLocaleString()} reads</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => readBookInternal(book)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-600/90 transition-all shadow-sm active:scale-95"
                      >
                        <BookOpen className="w-3 h-3" />
                        Read
                      </button>
                      <a 
                        href={book.formats['text/html'] || book.formats['text/plain'] || `https://www.gutenberg.org/ebooks/${book.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-red-600/10 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
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
            <div className="text-center py-20 bg-gray-100/30 rounded-xl border-2 border-dashed border-gray-300/50">
              <Library className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No results found. Try a different search term!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
