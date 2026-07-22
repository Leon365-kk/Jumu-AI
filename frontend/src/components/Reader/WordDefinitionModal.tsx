import { motion, AnimatePresence } from 'motion/react';
import { Info, Loader2, CheckCircle2, BookMarked } from 'lucide-react';

interface WordDefinitionModalProps {
  selectedWord: string | null;
  isDefining: boolean;
  wordDefinition: string | null;
  isSavingWord: boolean;
  wordSaved: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function WordDefinitionModal({
  selectedWord,
  isDefining,
  wordDefinition,
  isSavingWord,
  wordSaved,
  onClose,
  onSave
}: WordDefinitionModalProps) {
  if (!selectedWord) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4 text-red-600">
            <Info className="w-6 h-6" />
            <h3 className="text-2xl font-headline font-bold capitalize">{selectedWord}</h3>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
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
              onClick={onSave}
              disabled={isSavingWord || wordSaved || isDefining || !wordDefinition}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                wordSaved 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                  : 'bg-red-600/10 text-red-600 hover:bg-red-600/20'
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
              onClick={onClose}
              className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-600/90 transition-all active:scale-95"
            >
              Got it
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}