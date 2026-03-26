// src/features/classroom/components/QuestionList.tsx
'use client';

import { Search } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ClassroomQuestion, CATEGORIES, DIFFICULTIES, Difficulty } from '@/src/lib/classroom-question-bank';
import { ClassroomProgress } from '../services/classroom.service';

const difficultyColor: Record<Difficulty, string> = {
  easy: 'text-[var(--success)] bg-[var(--success)]/10',
  medium: 'text-[var(--warning)] bg-[var(--warning)]/10',
  hard: 'text-[var(--danger)] bg-[var(--danger)]/10',
};

interface QuestionListProps {
  questions: ClassroomQuestion[];
  selected: ClassroomQuestion | null;
  progress: ClassroomProgress;
  onSelect: (q: ClassroomQuestion) => void;
  filterDifficulty: string;
  setFilterDifficulty: (v: string) => void;
  filterCategory: string;
  setFilterCategory: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
}

export function QuestionList({
  questions,
  selected,
  progress,
  onSelect,
  filterDifficulty,
  setFilterDifficulty,
  filterCategory,
  setFilterCategory,
  searchQuery,
  setSearchQuery,
}: QuestionListProps) {
  const solved = progress.solvedIds.length;
  const attempted = progress.attemptedIds.length;

  return (
    <div className="flex flex-col h-full">
      {/* Stats bar */}
      <div className="px-4 py-3 border-b grid grid-cols-3 gap-2 text-center" style={{ borderColor: 'var(--border)' }}>
        <div>
          <div className="text-lg font-black" style={{ color: 'var(--success)' }}>{solved}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Solved</div>
        </div>
        <div>
          <div className="text-lg font-black" style={{ color: 'var(--warning)' }}>{attempted - solved}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Attempted</div>
        </div>
        <div>
          <div className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{questions.length}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Total</div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none border"
            style={{
              background: 'var(--bg-raised)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-3 py-2 border-b space-y-2" style={{ borderColor: 'var(--border)' }}>
        {/* Difficulty */}
        <div className="flex gap-1 flex-wrap">
          {['all', ...DIFFICULTIES].map(d => (
            <button
              key={d}
              onClick={() => setFilterDifficulty(d)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-bold capitalize transition-all",
                filterDifficulty === d
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              )}
            >
              {d}
            </button>
          ))}
        </div>
        {/* Category */}
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="w-full px-2.5 py-1.5 rounded-lg text-xs font-bold outline-none border"
          style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Question List */}
      <div className="flex-1 overflow-y-auto">
        {questions.length === 0 ? (
          <div className="p-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            No questions match your filters
          </div>
        ) : (
          questions.map((q, idx) => {
            const isSolved = progress.solvedIds.includes(q.id);
            const isAttempted = progress.attemptedIds.includes(q.id);
            const isSelected = selected?.id === q.id;

            return (
              <button
                key={q.id}
                onClick={() => onSelect(q)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b transition-all hover:bg-[var(--bg-raised)]",
                  isSelected && "bg-[var(--accent)]/10 border-l-2 border-l-[var(--accent)]"
                )}
                style={{ borderBottomColor: 'var(--border)' }}
              >
                <div className="flex items-start gap-2">
                  {/* Status indicator */}
                  <div className="mt-0.5 shrink-0">
                    {isSolved ? (
                      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--success)' }}>
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : isAttempted ? (
                      <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: 'var(--warning)' }} />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: 'var(--border)' }} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>{idx + 1}.</span>
                      <span className="text-sm font-bold truncate" style={{ color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                        {q.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold capitalize", difficultyColor[q.difficulty])}>
                        {q.difficulty}
                      </span>
                      <span className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                        {q.category}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}