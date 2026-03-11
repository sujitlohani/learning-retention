'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Zap, BookOpen, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { topicsService } from '@/src/features/topics/services/topics.service';
import { quizHistoryService } from '@/src/features/quiz/services/quiz-history.service';
import { Topic } from '@/src/types';
import { QuizAttempt } from '@/src/types/ai';

type TimeRange = '7d' | '30d' | 'all';

export function CockpitPage() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
    const [timeRange, setTimeRange] = useState<TimeRange>('all');

    useEffect(() => {
        setTopics(topicsService.getTopics());
        setAttempts(quizHistoryService.getAllAttempts());
    }, []);

    // Overall Mastery
    const overallMastery = useMemo(() => {
        if (topics.length === 0) return null;
        return Math.round(topics.reduce((sum, t) => sum + t.memoryScore, 0) / topics.length * 10) / 10;
    }, [topics]);

    const weekChange = useMemo(() => quizHistoryService.getWeekOverWeekChange(), []);

    // Filtered attempts by time range
    const filteredAttempts = useMemo(() => {
        if (timeRange === 'all') return attempts;
        const now = new Date();
        const days = timeRange === '7d' ? 7 : 30;
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        return attempts.filter(a => new Date(a.completedAt) >= cutoff);
    }, [attempts, timeRange]);

    // Accuracy over time
    const accuracyOverTime = useMemo(() => {
        const sorted = [...filteredAttempts].sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
        const daily: Record<string, { total: number; count: number }> = {};
        sorted.forEach(a => {
            const d = new Date(a.completedAt).toISOString().split('T')[0];
            if (!daily[d]) daily[d] = { total: 0, count: 0 };
            daily[d].total += a.score;
            daily[d].count += 1;
        });
        return Object.entries(daily).map(([date, v]) => ({ date, score: Math.round(v.total / v.count) }));
    }, [filteredAttempts]);

    // Weak areas
    const weakAreas = useMemo(() => {
        return topics.flatMap(t => t.units.map(u => ({ ...u, topicName: t.name, topicId: t.id })))
            .filter(u => u.status === 'weak')
            .slice(0, 5);
    }, [topics]);

    // Recent sessions
    const recentSessions = useMemo(() => {
        return [...attempts]
            .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
            .slice(0, 10)
            .map(a => ({
                ...a,
                topicName: topicsService.getTopicById(a.topicId)?.name || 'Unknown Topic',
            }));
    }, [attempts]);


    const hasData = attempts.length > 0;

    return (
        <div className="min-h-screen font-display pb-20" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-8">

                {/* Section 1: Overall Mastery + Chart */}
                <section className="p-6 rounded-lg border bg-[var(--bg-surface)] border-[var(--border)] shadow-[var(--shadow-resting)]">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Overall Mastery</div>
                            <div className="text-4xl font-black">{overallMastery !== null ? `${overallMastery}%` : '—'}</div>
                            {weekChange !== 0 && hasData && (
                                <div className="flex items-center gap-1 text-sm font-bold mt-1" style={{ color: weekChange > 0 ? 'var(--success)' : 'var(--danger)' }}>
                                    {weekChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    {weekChange > 0 ? '+' : ''}{weekChange}% this week
                                </div>
                            )}
                        </div>
                        <div className="flex gap-1 bg-[var(--bg-raised)] p-1 rounded-md border border-[var(--border)]">
                            {(['7d', '30d', 'all'] as const).map(r => (
                                <button key={r} onClick={() => setTimeRange(r)} className="px-3 py-1 text-xs font-bold rounded transition-all" style={timeRange === r ? { background: 'var(--accent)', color: '#fff' } : { color: 'var(--text-muted)' }}>
                                    {r === '7d' ? '7D' : r === '30d' ? '30D' : 'All'}
                                </button>
                            ))}
                        </div>
                    </div>
                    {hasData && accuracyOverTime.length > 0 ? (
                        <CockpitChart data={accuracyOverTime} />
                    ) : (
                        <div className="h-40 flex items-center justify-center text-sm text-[var(--text-muted)] font-medium">Complete quizzes to see your accuracy trend</div>
                    )}
                </section>

                {/* Section 2: Weak Areas */}
                {weakAreas.length > 0 && (
                    <section className="p-6 rounded-lg border bg-[var(--bg-surface)] border-[var(--border)] shadow-[var(--shadow-resting)]">
                        <div className="mb-4">
                            <h2 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Weak Areas</h2>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">Priority units recommended for review</p>
                        </div>
                        <div className="space-y-3">
                            {weakAreas.map(unit => {
                                const stats = quizHistoryService.getUnitStats(unit.id);
                                const tagLabel = stats.accuracy < 40 ? 'Critical Review' : 'Needs Focus';
                                const tagColor = stats.accuracy < 40 ? 'var(--danger)' : 'var(--warning)';
                                return (
                                    <div key={unit.id} className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-raised)] border border-[var(--border)]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--danger)]" />
                                            <div>
                                                <div className="font-semibold text-sm">{unit.text}</div>
                                                <div className="text-xs text-[var(--text-muted)]">{unit.topicName} • {stats.accuracy}%</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="rounded-full text-[10px] font-bold px-2 py-0.5" style={{ background: `color-mix(in srgb, ${tagColor} 12%, transparent)`, color: tagColor }}>{tagLabel}</span>
                                            <Link href={`/topics/${unit.topicId}`} className="text-xs font-bold px-3 py-1.5 rounded-md transition-all hover:-translate-y-0.5" style={{ background: 'var(--accent)', color: '#fff' }}>
                                                Practice →
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Section 3: Recommended Practice */}
                {weakAreas.length > 0 && (() => {
                    const weakest = weakAreas[0];
                    const stats = quizHistoryService.getUnitStats(weakest.id);
                    return (
                        <section className="p-6 rounded-lg border-2" style={{ background: 'var(--accent-light)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>
                            <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Recommended Practice</div>
                            <div className="font-bold text-lg">{weakest.text} <span className="text-[var(--text-muted)] font-medium text-sm">• {weakest.topicName}</span></div>
                            <div className="text-sm text-[var(--text-muted)] mt-1">Mastery: {stats.accuracy}%</div>
                            <Link href={`/topics/${weakest.topicId}`} className="inline-flex items-center gap-1 mt-4 px-5 py-2.5 rounded-md font-bold text-sm text-white transition-all hover:-translate-y-0.5" style={{ background: 'var(--accent)' }}>
                                Practice Now →
                            </Link>
                        </section>
                    );
                })()}

                {/* Section 4 + 5: Split row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Section 4: Topic Mastery */}
                    <section className="p-6 rounded-lg border bg-[var(--bg-surface)] border-[var(--border)] shadow-[var(--shadow-resting)]">
                        <div className="mb-4">
                            <h2 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Topic Mastery</h2>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">{topics.length} topic{topics.length !== 1 ? 's' : ''} tracked</p>
                        </div>
                        {topics.length === 0 ? (
                            <p className="text-sm text-[var(--text-muted)] text-center py-6">No topics yet</p>
                        ) : (
                            <div className="space-y-4">
                                {[...topics].sort((a, b) => b.memoryScore - a.memoryScore).map(t => {
                                    let barColor = 'var(--danger)';
                                    if (t.memoryScore >= 75) barColor = 'var(--success)';
                                    else if (t.memoryScore >= 50) barColor = 'var(--warning)';
                                    return (
                                        <div key={t.id} className="space-y-1.5">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span>{t.name}</span>
                                                <span className="font-bold" style={{ color: barColor }}>{t.memoryScore}%</span>
                                            </div>
                                            <div className="w-full h-2.5 rounded-full bg-[var(--bg-raised)] overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(2, t.memoryScore)}%`, background: barColor }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Section 5: Recent Sessions */}
                    <section className="p-6 rounded-lg border bg-[var(--bg-surface)] border-[var(--border)] shadow-[var(--shadow-resting)]">
                        <h2 className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Recent Sessions</h2>
                        {recentSessions.length === 0 ? (
                            <p className="text-sm text-[var(--text-muted)] text-center py-6">No sessions yet</p>
                        ) : (
                            <div className="space-y-3">
                                {recentSessions.map(s => {
                                    let scoreColor = 'var(--danger)';
                                    if (s.score >= 75) scoreColor = 'var(--success)';
                                    else if (s.score >= 50) scoreColor = 'var(--warning)';
                                    const TypeIcon = s.type === 'unit' ? Target : s.type === 'topic' ? BookOpen : Zap;
                                    const typeLabel = s.type === 'unit' ? 'Unit Test' : s.type === 'topic' ? 'Topic Challenge' : 'Daily';
                                    return (
                                        <div key={s.id} className="p-3 rounded-lg bg-[var(--bg-raised)] border border-[var(--border)]">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-2.5">
                                                    <TypeIcon className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
                                                    <div>
                                                        <div className="text-xs font-bold">{typeLabel}</div>
                                                        <div className="text-xs text-[var(--text-muted)]">{s.topicName}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-sm font-black" style={{ color: scoreColor }}>{s.score}%</div>
                                                    <div className="text-[10px] text-[var(--text-muted)]">{new Date(s.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                                                </div>
                                            </div>
                                            {s.score < 60 && (
                                                <span className="inline-block mt-2 rounded-full text-[10px] font-bold px-2 py-0.5" style={{ background: 'color-mix(in srgb, var(--danger) 12%, transparent)', color: 'var(--danger)' }}>
                                                    NEEDS REVIEW
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>


            </div>
        </div>
    );
}

// ─── Cockpit Chart (reusable interactive SVG) ──────────────────────────
function CockpitChart({ data }: { data: { date: string; score: number }[] }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const padding = { top: 10, right: 10, bottom: 5, left: 10 };
    const svgWidth = 600;
    const svgHeight = 180;
    const chartW = svgWidth - padding.left - padding.right;
    const chartH = svgHeight - padding.top - padding.bottom;

    const points = data.map((d, i) => {
        const x = padding.left + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);
        const y = padding.top + chartH - (d.score / 100) * chartH;
        return { x, y, ...d };
    });

    let pathD = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const cp1x = points[i].x + (points[i + 1].x - points[i].x) / 3;
        const cp2x = points[i + 1].x - (points[i + 1].x - points[i].x) / 3;
        pathD += ` C ${cp1x},${points[i].y} ${cp2x},${points[i + 1].y} ${points[i + 1].x},${points[i + 1].y}`;
    }
    const areaD = pathD + ` L ${points[points.length - 1].x},${padding.top + chartH} L ${points[0].x},${padding.top + chartH} Z`;

    const handleMouseMove = useCallback((e: React.MouseEvent<SVGRectElement>) => {
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;
        let nearestIdx = 0;
        let nearestDist = Infinity;
        points.forEach((p, i) => {
            const dist = Math.abs(p.x - mouseX);
            if (dist < nearestDist) { nearestDist = dist; nearestIdx = i; }
        });
        setHoveredIndex(nearestIdx);
    }, [points]);

    const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

    return (
        <svg ref={svgRef} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44 overflow-visible">
            {[0, 50, 100].map(v => {
                const y = padding.top + chartH - (v / 100) * chartH;
                return <line key={v} x1={padding.left} y1={y} x2={svgWidth - padding.right} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4" />;
            })}
            <path d={areaD} fill="var(--accent)" fillOpacity="0.1" />
            <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={hoveredIndex === i ? 5 : 3} fill="var(--accent)" stroke="var(--bg-surface)" strokeWidth="2" />
            ))}
            {hoveredPoint && (
                <>
                    <line x1={hoveredPoint.x} y1={padding.top} x2={hoveredPoint.x} y2={padding.top + chartH} stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="4" opacity="0.4" />
                    <rect x={hoveredPoint.x - 35} y={hoveredPoint.y - 42} width="70" height="34" rx="4" fill="var(--bg-surface)" stroke="var(--border)" strokeWidth="1" />
                    <text x={hoveredPoint.x} y={hoveredPoint.y - 28} fontSize="10" fontWeight="700" fill="var(--text-primary)" textAnchor="middle" dominantBaseline="middle">
                        {new Date(hoveredPoint.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </text>
                    <text x={hoveredPoint.x} y={hoveredPoint.y - 14} fontSize="11" fontWeight="800" fill="var(--accent)" textAnchor="middle" dominantBaseline="middle">{hoveredPoint.score}%</text>
                </>
            )}
            <rect x={padding.left} y={padding.top} width={chartW} height={chartH} fill="transparent" onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredIndex(null)} />
        </svg>
    );
}

