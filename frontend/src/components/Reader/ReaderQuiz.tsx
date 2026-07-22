import { motion, AnimatePresence } from 'motion/react';
import { Brain, CheckCircle2, XCircle, Info, Loader2 } from 'lucide-react';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ReaderQuizProps {
  showQuiz: boolean;
  isGeneratingQuiz: boolean;
  quizQuestions: QuizQuestion[];
  currentQuestionIndex: number;
  quizScore: number;
  quizFinished: boolean;
  selectedOption: number | null;
  showExplanation: boolean;
  onClose: () => void;
  onAnswer: (index: number) => void;
  onNext: () => void;
}

export function ReaderQuiz({
  showQuiz,
  isGeneratingQuiz,
  quizQuestions,
  currentQuestionIndex,
  quizScore,
  quizFinished,
  selectedOption,
  showExplanation,
  onClose,
  onAnswer,
  onNext
}: ReaderQuizProps) {
  return (
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
            className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-headline text-2xl font-bold text-red-600 flex items-center gap-3">
                  <Brain className="w-6 h-6" />
                  Understanding Check
                </h3>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <XCircle className="w-6 h-6 text-stone-400" />
                </button>
              </div>

              {isGeneratingQuiz ? (
                <div className="py-20 text-center">
                  <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                  <p className="font-headline font-bold text-red-600">Creating your quiz...</p>
                </div>
              ) : quizFinished ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-red-600/10 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-3xl font-headline font-bold mb-2">
                    {quizScore === quizQuestions.length ? 'Perfect Score!' : quizScore >= quizQuestions.length / 2 ? 'Great Job!' : 'Keep Practicing!'}
                  </h4>
                  <p className="text-gray-600 text-lg mb-2">You scored {quizScore} out of {quizQuestions.length}</p>
                  <p className="text-red-600 font-medium mb-8">
                    {quizScore === quizQuestions.length 
                      ? "Excellent! You understood everything perfectly." 
                      : quizScore >= quizQuestions.length / 2 
                        ? "Good job! You have a solid grasp of the material."
                        : "Keep going! Re-reading the text might help clarify some parts."}
                  </p>
                  <button 
                    onClick={onClose}
                    className="bg-red-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all"
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
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-red-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  <h4 className="text-2xl font-medium text-gray-900 mb-8 leading-relaxed">
                    {quizQuestions[currentQuestionIndex].question}
                  </h4>

                  <div className="grid grid-cols-1 gap-3 mb-8">
                    {quizQuestions[currentQuestionIndex].options.map((option, i) => (
                      <button 
                        key={i}
                        onClick={() => onAnswer(i)}
                        disabled={selectedOption !== null}
                        className={`p-6 rounded-lg border-2 text-left font-medium transition-all ${
                          selectedOption === i 
                            ? i === quizQuestions[currentQuestionIndex].correctAnswer 
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                              : 'bg-error/5 border-error text-error'
                            : selectedOption !== null && i === quizQuestions[currentQuestionIndex].correctAnswer
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                              : 'bg-gray-100 border-transparent hover:border-gray-300'
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
                      className={`p-6 rounded-lg mb-8 ${
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
                      onClick={onNext}
                      className="w-full bg-red-600 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'See Results'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">Something went wrong. Please try again.</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}