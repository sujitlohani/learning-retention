// src/features/classroom/components/QuestionPanel.tsx
'use client';

import { cn } from '@/src/lib/utils';
import { ClassroomQuestion, Difficulty } from '@/src/lib/classroom-question-bank';
import { ClassroomProgress } from '../services/classroom.service';
import { CheckCircle2, Tag } from 'lucide-react';

const difficultyStyle: Record<Difficulty, { text: string; bg: string }> = {
  easy: { text: 'text-[var(--success)]', bg: 'bg-[var(--success)]/10' },
  medium: { text: 'text-[var(--warning)]', bg: 'bg-[var(--warning)]/10' },
  hard: { text: 'text-[var(--danger)]', bg: 'bg-[var(--danger)]/10' },
};

interface QuestionPanelProps {
  question: ClassroomQuestion;
  progress: ClassroomProgress;
}

export function QuestionPanel({ question, progress }: QuestionPanelProps) {
  const isSolved = progress.solvedIds.includes(question.id);
  const style = difficultyStyle[question.difficulty];

  // Very basic markdown-ish renderer: bold, code, code blocks
  const renderDescription = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Code block
      if (line.startsWith('```')) return null;
      if (line.startsWith('    ') && !line.trim().startsWith('Input') && !line.trim().startsWith('Output') && !line.trim().startsWith('Explanation')) {
        return (
          <pre key={i} className="font-mono text-[12px] px-3 py-2 rounded-lg my-1" style={{ background: '#0E0E16', color: '#7EC8A0' }}>
            {line.trim()}
          </pre>
        );
      }

      // Bold **text**
      const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
      const rendered = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} style={{ color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={j} className="px-1 py-0.5 rounded font-mono text-[12px]" style={{ background: 'var(--bg-raised)', color: 'var(--accent)' }}>
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      if (!line.trim()) return <br key={i} />;

      return (
        <p key={i} className="leading-relaxed text-sm" style={{ color: 'var(--text-secondary)' }}>
          {rendered}
        </p>
      );
    });
  };

  // Detect code blocks
  const renderWithCodeBlocks = (text: string) => {
    const blocks = text.split(/(```[\s\S]*?```)/g);
    return blocks.map((block, i) => {
      if (block.startsWith('```') && block.endsWith('```')) {
        const lines = block.slice(3, -3).split('\n');
        const lang = lines[0];
        const code = lines.slice(1).join('\n');
        return (
          <pre key={i} className="my-3 p-4 rounded-xl overflow-x-auto font-mono text-[12px] leading-[1.7]" style={{ background: '#0A0A10', color: '#c8c5d9', border: '1px solid #1E1D30' }}>
            {code}
          </pre>
        );
      }
      return <div key={i} className="space-y-1">{renderDescription(block)}</div>;
    });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize", style.text, style.bg)}>
                {question.difficulty}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)' }}>
                {question.category}
              </span>
              {isSolved && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--success)]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                </span>
              )}
            </div>
            <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
              {question.title}
            </h2>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {question.tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)' }}>
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="px-6 py-5 flex-1 space-y-2">
        {renderWithCodeBlocks(question.description)}
      </div>

      {/* Explanation (always shown at bottom) */}
      <div className="px-6 pb-6">
        <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-raised)' }}>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--accent)' }}>Approach</div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{question.explanation}</p>
        </div>
      </div>
    </div>
  );
}