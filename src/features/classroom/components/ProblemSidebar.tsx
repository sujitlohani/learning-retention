// src/features/classroom/components/ProblemSidebar.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ClassroomQuestion, ClassroomDifficulty } from '@/src/lib/classroom-question-bank';
import { ClassroomProgress } from '@/src/types/classroom';

const DIFF_COLOR: Record<ClassroomDifficulty, string> = {
  easy:   'var(--success)',
  medium: 'var(--warning)',
  hard:   'var(--danger)',
};

interface ProblemSidebarProps {
  open: boolean;
  onClose: () => void;
  questions: ClassroomQuestion[];
  currentIdx: number;
  progress: ClassroomProgress;
  onSelect: (idx: number) => void;
}

export function ProblemSidebar({ open, onClose, questions, currentIdx, progress, onSelect }: ProblemSidebarProps) {
  const solved = questions.filter(q => progress.solvedIds.includes(q.id)).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30"
            style={{ background: 'rgba(0,0,0,0.3)' }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
            className="fixed left-0 top-0 h-screen w-[300px] z-40 flex flex-col border-r"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-raised)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Problem List</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {solved} / {questions.length} solved
                </p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-raised)] transition-colors">
                <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            {/* Progress bar */}
            <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                <span>Progress</span>
                <span>{questions.length > 0 ? Math.round((solved / questions.length) * 100) : 0}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${questions.length > 0 ? (solved / questions.length) * 100 : 0}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'var(--success)' }}
                />
              </div>
            </div>

            {/* Question list */}
            <div className="flex-1 overflow-y-auto">
              {questions.map((q, idx) => {
                const isSolved = progress.solvedIds.includes(q.id);
                const isAttempted = progress.attemptedIds.includes(q.id);
                const isCurrent = idx === currentIdx;

                return (
                  <button
                    key={q.id}
                    onClick={() => { onSelect(idx); onClose(); }}
                    className={cn(
                      "w-full text-left px-5 py-4 border-b flex items-start gap-3 transition-all hover:bg-[var(--bg-raised)]",
                      isCurrent && "border-l-2"
                    )}
                    style={{
                      borderBottomColor: 'var(--border)',
                      borderLeftColor: isCurrent ? 'var(--accent)' : undefined,
                      background: isCurrent ? 'color-mix(in srgb, var(--accent) 6%, transparent)' : undefined,
                    }}
                  >
                    {/* Status dot */}
                    <div className="mt-0.5 shrink-0">
                      {isSolved ? (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--success)' }}>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : isAttempted ? (
                        <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: 'var(--warning)' }} />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: 'var(--border)' }} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>{idx + 1}.</span>
                        <span className="text-sm font-bold truncate" style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-primary)' }}>
                          {q.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold capitalize"
                          style={{ color: DIFF_COLOR[q.difficulty] }}>
                          {q.difficulty}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{q.category}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}