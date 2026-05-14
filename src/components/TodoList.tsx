import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, Trash2, ListTodo, Circle, Loader2 } from 'lucide-react';
import { TapEffect } from './TapEffect';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/AppContext';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  user_id?: string;
  created_at?: string;
}

export function TodoList() {
  const { user } = useApp();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load from Supabase (or localStorage fallback)
  useEffect(() => {
    const fetchTodos = async () => {
      if (user && user.id !== 'guest-user') {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            // Table might not exist yet, fallback to localStorage
            console.warn('Todos table may not exist, falling back to local storage', error);
            loadLocal();
          } else if (data) {
            setTodos(data);
          }
        } catch (e) {
          console.error('Failed to fetch todos from Supabase', e);
          loadLocal();
        } finally {
          setIsLoading(false);
        }
      } else {
        loadLocal();
      }
    };

    const loadLocal = () => {
      const saved = localStorage.getItem('jumu_todos');
      if (saved) {
        try {
          setTodos(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse todos', e);
        }
      }
    };

    fetchTodos();
  }, [user]);

  // Save to localStorage whenever todos change (as backup and for guests)
  useEffect(() => {
    if (!user || user.id === 'guest-user') {
      localStorage.setItem('jumu_todos', JSON.stringify(todos));
    }
  }, [todos, user]);

  const addTodo = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      user_id: user?.id !== 'guest-user' ? user?.id : undefined,
      created_at: new Date().toISOString(),
    };

    // Optimistic Update
    setTodos([newTodo, ...todos]);
    setInputValue('');

    if (user && user.id !== 'guest-user') {
      try {
        const { error } = await supabase
          .from('todos')
          .insert([
            { 
              id: newTodo.id, 
              text: newTodo.text, 
              completed: newTodo.completed, 
              user_id: user.id 
            }
          ]);
        
        if (error) throw error;
      } catch (e) {
        console.error('Failed to sync new todo to Supabase', e);
        // Rollback or notify user? For now just keep local
      }
    }
  };

  const toggleTodo = async (id: string) => {
    const todoToToggle = todos.find(t => t.id === id);
    if (!todoToToggle) return;

    const newStatus = !todoToToggle.completed;

    // Optimistic Update
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: newStatus } : todo
    ));

    if (user && user.id !== 'guest-user') {
      try {
        const { error } = await supabase
          .from('todos')
          .update({ completed: newStatus })
          .eq('id', id);
        
        if (error) throw error;
      } catch (e) {
        console.error('Failed to sync todo status to Supabase', e);
      }
    }
  };

  const deleteTodo = async (id: string) => {
    // Optimistic Update
    setTodos(todos.filter(todo => todo.id !== id));

    if (user && user.id !== 'guest-user') {
      try {
        const { error } = await supabase
          .from('todos')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } catch (e) {
        console.error('Failed to delete todo from Supabase', e);
      }
    }
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="bg-white rounded-[32px] p-8 border border-surface-container-high shadow-sm flex flex-col h-full min-h-[450px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-headline text-xl font-black text-on-surface flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-primary" />
          My Tasks
        </h3>
        <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
          {completedCount}/{todos.length} Done
        </span>
      </div>

      <form onSubmit={addTodo} className="flex gap-2 mb-6">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="What's your focus today?"
          className="flex-1 bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl px-4 py-4 text-sm font-bold outline-none transition-all placeholder:text-stone-400"
        />
        <TapEffect>
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
          >
            <Plus className="w-8 h-8" />
          </button>
        </TapEffect>
      </form>

      <div className="flex-1 overflow-y-auto max-h-[350px] space-y-3 pr-2 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Loading Tasks...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {todos.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                className={`group flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  todo.completed 
                    ? 'bg-surface-container-lowest border-transparent opacity-60' 
                    : 'bg-white border-surface-container-high hover:border-primary/30 hover:shadow-md'
                }`}
                onClick={() => toggleTodo(todo.id)}
              >
                <div className={`shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                  todo.completed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-surface-container-highest text-stone-300 group-hover:text-primary/50'
                }`}>
                  {todo.completed ? <Check className="w-4 h-4 stroke-[3px]" /> : <Circle className="w-4 h-4" />}
                </div>
                
                <span className={`flex-1 text-base font-bold transition-all ${
                  todo.completed ? 'text-stone-400 line-through' : 'text-on-surface'
                }`}>
                  {todo.text}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTodo(todo.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!isLoading && todos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-surface-container-low/30 rounded-[32px] border-2 border-dashed border-stone-100">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-stone-200 mb-4 shadow-sm">
               <ListTodo className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-stone-400 italic">No tasks yet.<br />Ready to start something new?</p>
          </div>
        )}
      </div>
    </div>
  );
}

