// src/features/classroom/components/ResultScreen.tsx
'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, BookOpen } from 'lucide-react';
import { ClassroomQuestion } from '@/src/lib/classroom-question-bank';
import { ClassroomLanguage } from '@/src/types/classroom';

interface ResultScreenProps {
  question: ClassroomQuestion;
  language: ClassroomLanguage;
  passed: boolean;
  testsPassed: number;
  testsTotal: number;
  onNext: () => void;
  onRetry: () => void;
  hasNext: boolean;
}

export function ResultScreen({ question, language, passed, testsPassed, testsTotal, onNext, onRetry, hasNext }: ResultScreenProps) {
  const score = Math.round((testsPassed / testsTotal) * 100);

  const messages = {
    perfect: ['Excellent work!', 'You nailed it!', 'Perfect solution!'],
    good:    ['Good effort!', 'Almost there!', 'Keep going!'],
    fail:    ['Keep trying!', "Don't give up!", 'Practice makes perfect!'],
  };
  const bucket = passed ? (score === 100 ? 'perfect' : 'good') : 'fail';
  const message = messages[bucket][Math.floor(Math.random() * 3)];

  // Related topics from question tags
  const relatedTopics = question.tags.slice(0, 3);

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: passed ? 'color-mix(in srgb, var(--success) 15%, transparent)' : 'color-mix(in srgb, var(--danger) 15%, transparent)' }}
        >
          {passed
            ? <CheckCircle2 className="w-10 h-10" style={{ color: 'var(--success)' }} />
            : <XCircle className="w-10 h-10" style={{ color: 'var(--danger)' }} />}
        </motion.div>

        {/* Score */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="text-6xl font-black mb-1" style={{ color: passed ? 'var(--success)' : 'var(--danger)' }}>
            {score}%
          </div>
          <p className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{message}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {testsPassed} of {testsTotal} test cases passed · {language}
          </p>
        </motion.div>

        {/* Question info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="w-full mt-8 p-4 rounded-2xl border text-left"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
        >
          <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Problem</div>
          <div className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{question.title}</div>
          <div className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-muted)' }}>{question.category} · {question.difficulty}</div>
        </motion.div>

        {/* Related topics */}
        {relatedTopics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="w-full mt-3 p-4 rounded-2xl border text-left"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                Related topics in Knowledge Base
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {relatedTopics.map(tag => (
                <span key={tag} className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)' }}>
                  #{tag}
                </span>
              ))}
            </div>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Review these concepts in your Knowledge Base to strengthen your understanding.
            </p>
          </motion.div>
        )}

        {/* Approach reminder */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="w-full mt-3 p-4 rounded-2xl border text-left"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
        >
          <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>Approach</div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{question.explanation}</p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="w-full mt-6 flex flex-col gap-3"
        >
          {!passed && (
            <button onClick={onRetry}
              className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all hover:bg-[var(--bg-raised)]"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          )}
          {hasNext ? (
            <button onClick={onNext}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: 'var(--accent)' }}>
              Next Problem <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={onNext}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: 'var(--accent)' }}>
              Back to Problems
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}