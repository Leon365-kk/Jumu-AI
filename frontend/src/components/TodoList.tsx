import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, Trash2, ListTodo, Circle, Loader2, ChevronRight, Timer } from 'lucide-react';
import { TapEffect } from './TapEffect';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/lib/AppContext';

export interface Todo {
  id: string;
  text: string;
  description?: string;
  completed: boolean;
  status: 'pending' | 'in-progress' | 'completed';
  focusTime: number;
  user_id?: string;
  created_at?: string;
}

const TODO_STORAGE_KEY = 'jumu_todos';

interface TodoListProps {
  onTaskSelect?: (task: Todo) => void;
  selectedTaskId?: string | null;
}

export function TodoList({ onTaskSelect, selectedTaskId }: TodoListProps) {
  const { user, addXP } = useApp();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [descriptionValue, setDescriptionValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadLocalTodos = useCallback(() => {
    const saved = localStorage.getItem(TODO_STORAGE_KEY);
    if (!saved) {
      setTodos([]);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      setTodos(parsed.map((t: any) => ({
        ...t,
        status: t.status || (t.completed ? 'completed' : 'pending'),
        focusTime: t.focusTime || 0
      })));
    } catch (e) {
      console.error('Failed to parse todos', e);
    }
  }, []);

  const fetchTodos = useCallback(async () => {
    if (user && user.id !== 'guest-user') {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Todos table may not exist, falling back to local storage', error);
          loadLocalTodos();
        } else if (data) {
          const normalized = data.map((t: any) => ({
            id: t.id,
            text: t.text || 'Untitled Task',
            description: t.description || '',
            completed: t.completed || false,
            status: t.status || (t.completed ? 'completed' : 'pending'),
            focusTime: t.focusTime || 0,
            user_id: t.user_id,
            created_at: t.created_at
          }));
          setTodos(normalized);
        }
      } catch (e) {
        console.error('Failed to fetch todos from Supabase', e);
        loadLocalTodos();
      } finally {
        setIsLoading(false);
      }
    } else {
      loadLocalTodos();
    }
  }, [loadLocalTodos, user]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  useEffect(() => {
    if (user && user.id !== 'guest-user') {
      const channel = supabase
        .channel(`todos_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'todos',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchTodos();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === TODO_STORAGE_KEY) {
        loadLocalTodos();
      }
    };

    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, [fetchTodos, loadLocalTodos, user]);

  useEffect(() => {
    if (!user || user.id === 'guest-user') {
      localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos, user]);

  const addTodo = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      description: descriptionValue.trim(),
      completed: false,
      status: 'pending',
      focusTime: 0,
      user_id: user?.id !== 'guest-user' ? user?.id : undefined,
      created_at: new Date().toISOString(),
    };

    setTodos((prev) => [newTodo, ...prev]);
    setInputValue('');
    setDescriptionValue('');

    if (user && user.id !== 'guest-user') {
      try {
        const { error } = await supabase
          .from('todos')
          .insert([
            { 
              id: newTodo.id, 
              text: newTodo.text, 
              description: newTodo.description,
              completed: newTodo.completed,
              status: newTodo.status,
              focusTime: newTodo.focusTime,
              user_id: user.id 
            }
          ]);
        
        if (error) throw error;
      } catch (e) {
        console.error('Failed to sync new todo to Supabase', e);
      }
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo))
    );

    if (user && user.id !== 'guest-user') {
      try {
        const { error } = await supabase
          .from('todos')
          .update(updates)
          .eq('id', id);
        
        if (error) throw error;
      } catch (e) {
        console.error('Failed to update todo in Supabase', e);
      }
    }
  };

  const deleteTodo = async (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));

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

  const toggleStatus = (todo: Todo) => {
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
    updateTodo(todo.id, { 
      status: newStatus, 
      completed: newStatus === 'completed' 
    });
  };

  const completedCount = todos.filter(t => t.status === 'completed').length;

  return (
    <>
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

        <form onSubmit={addTodo} className="space-y-2 mb-6">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What's your focus today?"
            className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl px-4 py-4 text-sm font-bold outline-none transition-all placeholder:text-stone-400"
          />
          <input
            type="text"
            value={descriptionValue}
            onChange={(e) => setDescriptionValue(e.target.value)}
            placeholder="Add details (optional)"
            className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl px-4 py-3 text-xs font-medium outline-none transition-all placeholder:text-stone-400"
          />
          <TapEffect>
            <button 
              type="submit"
              disabled={!inputValue.trim()}
              className="w-full bg-primary text-white rounded-2xl py-3 disabled:opacity-50 disabled:grayscale transition-all hover:scale-[1.01] active:scale-95 font-bold flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Task
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
                onClick={() => onTaskSelect?.(todo)}
                className={`group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  todo.status === 'completed'
                    ? 'bg-emerald-50/50 border-emerald-100 opacity-75' 
                    : todo.status === 'in-progress'
                      ? 'bg-blue-50/50 border-blue-100'
                      : 'bg-white border-surface-container-high hover:border-primary/30 hover:shadow-md'
                } ${selectedTaskId === todo.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              >
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStatus(todo);
                    }}
                    className={`shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                      todo.status === 'completed' 
                        ? 'bg-emerald-500 text-white' 
                        : todo.status === 'in-progress'
                          ? 'bg-blue-500 text-white'
                          : 'bg-surface-container-highest text-stone-300 group-hover:text-primary/50'
                    }`}
                  >
                    {todo.status === 'completed' ? <Check className="w-4 h-4 stroke-[3px]" /> : <Circle className="w-4 h-4" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <span className={`block text-sm font-bold truncate ${
                      todo.status === 'completed' ? 'text-stone-400 line-through' : 'text-on-surface'
                    }`}>
                      {todo.text}
                    </span>
                    {todo.description && (
                      <span className="block text-xs text-stone-400 truncate mt-0.5">
                        {todo.description}
                      </span>
                    )}
                    {todo.focusTime > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 mt-1">
                        <Timer className="w-3 h-3" />
                        {Math.floor(todo.focusTime / 60)}m {todo.focusTime % 60}s focused
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskSelect?.(todo);
                      }}
                      className="p-2 text-stone-300 hover:text-primary hover:bg-primary/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTodo(todo.id);
                      }}
                      className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
    </>
  );
}
