import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, CheckCircle2, Circle, Edit3, Trash2, Play, Pause, Timer } from 'lucide-react';
import { Todo } from './TodoList';

interface TaskDetailModalProps {
  task: Todo | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  focusTime: number;
  isFocusRunning: boolean;
  onToggleFocus: () => void;
  onResetFocus: () => void;
}

export function TaskDetailModal({ 
  task, 
  isOpen, 
  onClose, 
  onUpdate, 
  onDelete,
  focusTime,
  isFocusRunning,
  onToggleFocus,
  onResetFocus
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [localFocusTime, setLocalFocusTime] = useState(focusTime);

  useEffect(() => {
    if (isOpen && task) {
      setEditText(task.text);
      setEditDescription(task.description || '');
      setLocalFocusTime(task.focusTime || 0);
    }
    setIsEditing(false);
  }, [isOpen, task]);

  useEffect(() => {
    setLocalFocusTime(focusTime);
  }, [focusTime]);

  const handleSave = () => {
    if (!task) return;
    onUpdate(task.id, { 
      text: editText.trim() || task.text,
      description: editDescription 
    });
    setIsEditing(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-stone-600 bg-stone-50 border-stone-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'in-progress': return <Timer className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  if (!task) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm px-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[2rem] p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getStatusColor(task.status || 'pending')}`}>
                  {getStatusIcon(task.status || 'pending')}
                  {task.status === 'in-progress' ? 'In Progress' : task.status === 'completed' ? 'Completed' : 'Pending'}
                </span>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full text-2xl font-headline font-black text-on-surface border-2 border-surface-container rounded-xl px-4 py-3 outline-none focus:border-primary"
                    placeholder="Task name"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                    className="w-full text-base text-on-surface border-2 border-surface-container rounded-xl px-4 py-3 outline-none focus:border-primary resize-none"
                    placeholder="Add a description..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-all"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 border-2 border-surface-container rounded-xl font-bold text-stone-600 hover:bg-surface-container-low transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-headline font-black text-on-surface mb-2">
                    {task.text}
                  </h2>
                  {task.description && (
                    <p className="text-on-surface-variant leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Focus Timer Section */}
            <div className="bg-gradient-to-br from-primary/5 to-tertiary/5 rounded-2xl p-6 border border-primary/10 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                    <Timer className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-muted uppercase tracking-widest">Focus Time</p>
                    <p className="text-2xl font-headline font-black text-on-surface tabular-nums">
                      {formatTime(localFocusTime)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onToggleFocus}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isFocusRunning
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    {isFocusRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>
                  <button
                    onClick={onResetFocus}
                    className="w-12 h-12 rounded-full bg-surface-container text-stone-600 flex items-center justify-center hover:bg-surface-container-high transition-all"
                  >
                    <Timer className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="w-full h-2 bg-surface-container-high/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full transition-all"
                  style={{ width: `${Math.min((localFocusTime / (25 * 60)) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-on-surface-muted mt-2 text-right">
                {Math.round((localFocusTime / (25 * 60)) * 100)}% of 25 min goal
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-surface-container rounded-xl font-bold text-stone-600 hover:bg-surface-container-low transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              )}
              <button
                onClick={() => {
                  onUpdate(task.id, { 
                    status: task.status === 'completed' ? 'pending' : 'completed' 
                  });
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                  task.status === 'completed'
                    ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {task.status === 'completed' ? 'Mark Pending' : 'Mark Complete'}
              </button>
              <button
                onClick={() => {
                  onDelete(task.id);
                  onClose();
                }}
                className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
