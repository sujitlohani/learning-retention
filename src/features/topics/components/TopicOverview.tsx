'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Topic } from '@/src/types';
import { quizHistoryService } from '@/src/features/quiz/services/quiz-history.service';
import { topicsService } from '@/src/features/topics/services/topics.service';
import { QuizButton } from './QuizButton';
import { useQuizSession } from '@/src/features/quiz/hooks/useQuizSession';
import { Loader2 } from 'lucide-react';

interface TopicOverviewProps {
    topic: Topic;
}

export function TopicOverview({ topic }: TopicOverviewProps) {
    const { startQuiz } = useQuizSession();

    const [performanceData, setPerformanceData] = useState<{ date: string; score: number }[]>([]);
    const [practiceDist, setPracticeDist] = useState<{ unitId: string; unitName: string; count: number }[]>([]);
    const [description, setDescription] = useState<string>(topic.description || '');
    const [useCases, setUseCases] = useState<{ title: string; description: string; tag: string }[]>(topic.useCases || []);
    const [descLoading, setDescLoading] = useState(!topic.description);
    const [descError, setDescError] = useState(false);

    useEffect(() => {
        setPerformanceData(quizHistoryService.getAccuracyOverTime(topic.id));
        setPracticeDist(quizHistoryService.getPracticeDistribution(topic.id));
    }, [topic.id]);

    // Fix 1 — Generate AI description on mount if missing
    useEffect(() => {
        if (topic.description) return;

        const generateDescription = async () => {
            try {
                const res = await fetch('/api/ai/generate-description', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topicName: topic.name }),
                });
                const data = await res.json();
                if (data.success && data.description) {
                    setDescription(data.description);
                    setUseCases(data.useCases || []);
                    // Persist to localStorage
                    const updatedTopic = { ...topic, description: data.description, useCases: data.useCases || [] };
                    topicsService.updateTopic(updatedTopic);
                } else {
                    setDescError(true);
                }
            } catch {
                setDescError(true);
            } finally {
                setDescLoading(false);
            }
        };

        generateDescription();
    }, [topic]);

    const { units } = topic;
    const strongUnits = units.filter(u => u.status === 'strong');
    const weakUnits = units.filter(u => u.status === 'weak');
    const practicedUnits = units.filter(u => u.status !== 'neutral');
    const unattemptedUnits = units.filter(u => u.status === 'neutral');

    // Fix 3 — Unit accuracy data for horizontal bars
    const unitAccuracies = units.map(u => {
        const stats = quizHistoryService.getUnitStats(u.id);
        return { ...u, accuracy: stats.accuracy };
    }).sort((a, b) => b.accuracy - a.accuracy); // descending

    const handleStartUnit = (unitId: string) => {
        startQuiz({ type: 'unit-test', topicId: topic.id, targetUnitId: unitId });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-10">
                {/* What Is It? (Fix 1) */}
                <section>
                    <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>What Is It?</h2>
                    <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-resting)]">
                        {descLoading ? (
                            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating description...
                            </div>
                        ) : descError ? (
                            <p className="text-sm text-[var(--text-muted)]">Unable to generate description</p>
                        ) : (
                            <>
                                <p className="text-sm leading-relaxed text-[var(--text-muted)]">{description}</p>
                                {useCases.length > 0 && (
                                    <div className="mt-5 space-y-3">
                                        {useCases.map((uc, i) => (
                                            <div key={i} className="flex items-start justify-between gap-4 py-2 border-t border-[var(--border)]">
                                                <div>
                                                    <div className="font-bold text-sm">{uc.title}</div>
                                                    <div className="text-xs text-[var(--text-muted)] mt-0.5">{uc.description}</div>
                                                </div>
                                                <span className="shrink-0 rounded-full text-xs px-2 py-0.5" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                                                    {uc.tag}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>

                {/* Unit Progress Overview */}
                <section>
                    <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Unit Progress</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="Practiced" value={practicedUnits.length} total={units.length} color="var(--text-primary)" />
                        <StatCard label="Strong" value={strongUnits.length} total={units.length} color="var(--success)" />
                        <StatCard label="Weak" value={weakUnits.length} total={units.length} color="var(--danger)" />
                        <StatCard label="Unattempted" value={unattemptedUnits.length} total={units.length} color="var(--text-muted)" />
                    </div>
                </section>

                {/* Needs Practice */}
                <section>
                    <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--danger)' }}>Needs Practice</h2>
                    <div className="space-y-4">
                        {weakUnits.length === 0 ? (
                            <div className="p-8 text-center border border-dashed border-[var(--border)] rounded-lg text-[var(--text-muted)] font-medium">
                                All units are in good shape
                            </div>
                        ) : (
                            weakUnits.map(unit => (
                                <div key={unit.id} className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] shadow-[var(--shadow-resting)] border-l-4 border-l-[var(--danger)]">
                                    <span className="font-semibold text-[15px]">{unit.text}</span>
                                    <QuizButton onStart={() => handleStartUnit(unit.id)} />
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* Right Column: Analytics */}
            <div className="lg:col-span-5 space-y-6">
                {/* Fix 5 — Performance Trend: Interactive SVG Chart */}
                <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-resting)]">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest mb-6" style={{ color: 'var(--text-muted)' }}>Performance Trend</h3>
                    <InteractiveLineChart data={performanceData} />
                </div>

                {/* Fix 3 — Unit Strength: Individual horizontal bars */}
                <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-resting)]">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Unit Strength</h3>
                    {unitAccuracies.length === 0 ? (
                        <p className="text-sm text-[var(--text-muted)] text-center py-4">No units yet</p>
                    ) : (
                        <div className="space-y-3">
                            {unitAccuracies.map(unit => {
                                let barColor = 'var(--danger)';
                                if (unit.accuracy >= 75) barColor = 'var(--success)';
                                else if (unit.accuracy >= 50) barColor = 'var(--warning)';
                                return (
                                    <div key={unit.id} className="space-y-1">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="truncate pr-4">{unit.text}</span>
                                            <span style={{ color: barColor }} className="font-bold shrink-0">{unit.accuracy}%</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-[var(--bg-raised)] overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(2, unit.accuracy)}%`, background: barColor }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Fix 4 — Practice Frequency (renamed from Practice Distribution) */}
                <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-resting)]">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Practice Frequency</h3>
                    {practiceDist.length === 0 ? (
                        <p className="text-sm text-[var(--text-muted)] text-center py-4">No practice data yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {practiceDist.map((dist, i) => {
                                const maxCount = practiceDist[0].count;
                                const pct = Math.max(5, (dist.count / maxCount) * 100);
                                return (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="truncate pr-4 text-[var(--text-primary)]">{dist.unitName}</span>
                                            <span className="text-[var(--text-muted)] shrink-0">{dist.count} session{dist.count !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-[var(--bg-raised)] overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
    return (
        <div className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] shadow-[var(--shadow-resting)] flex flex-col items-center justify-center">
            <div className="text-2xl font-black" style={{ color }}>{value}</div>
            <div className="text-xs font-medium text-[var(--text-muted)] mt-1">{label}</div>
            {total > 0 && <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{Math.round((value / total) * 100)}%</div>}
        </div>
    );
}

// Fix 5 — Interactive SVG line chart with hover tooltip
function InteractiveLineChart({ data }: { data: { date: string; score: number }[] }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // All hooks must be declared before any early returns
    const handleMouseMove = useCallback((e: React.MouseEvent<SVGRectElement>) => {
        const svg = svgRef.current;
        if (!svg || data.length < 2) return;

        const padding = { top: 10, right: 10, bottom: 5, left: 10 };
        const svgWidth = 300;
        const chartW = svgWidth - padding.left - padding.right;
        const chartH = 160 - padding.top - padding.bottom;

        const points = data.map((d, i) => ({
            x: padding.left + (i / (data.length - 1)) * chartW,
            y: padding.top + chartH - (d.score / 100) * chartH,
        }));

        const rect = svg.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;

        let nearestIdx = 0;
        let nearestDist = Infinity;
        points.forEach((p, i) => {
            const dist = Math.abs(p.x - mouseX);
            if (dist < nearestDist) { nearestDist = dist; nearestIdx = i; }
        });
        setHoveredIndex(nearestIdx);
    }, [data]);

    const handleMouseLeave = useCallback(() => {
        setHoveredIndex(null);
    }, []);

    if (data.length === 0) {
        return <div className="h-40 flex items-center justify-center text-sm text-[var(--text-muted)] font-medium">No quiz history yet</div>;
    }

    if (data.length === 1) {
        return (
            <div className="h-40 flex flex-col items-center justify-center text-center">
                <div className="text-3xl font-black text-[var(--accent)]">{data[0].score}%</div>
                <div className="text-xs text-[var(--text-muted)] mt-2 font-medium">
                    {new Date(data[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1 font-medium">Keep practicing to build your trend</div>
            </div>
        );
    }

    const padding = { top: 10, right: 10, bottom: 5, left: 10 };
    const svgWidth = 300;
    const svgHeight = 160;
    const chartW = svgWidth - padding.left - padding.right;
    const chartH = svgHeight - padding.top - padding.bottom;

    const points = data.map((d, i) => {
        const x = padding.left + (i / (data.length - 1)) * chartW;
        const y = padding.top + chartH - (d.score / 100) * chartH;
        return { x, y, ...d };
    });

    // Build smooth cubic bezier path
    let pathD = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const cp1x = points[i].x + (points[i + 1].x - points[i].x) / 3;
        const cp1y = points[i].y;
        const cp2x = points[i + 1].x - (points[i + 1].x - points[i].x) / 3;
        const cp2y = points[i + 1].y;
        pathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${points[i + 1].x},${points[i + 1].y}`;
    }

    // Fill area beneath
    const areaD = pathD + ` L ${points[points.length - 1].x},${padding.top + chartH} L ${points[0].x},${padding.top + chartH} Z`;

    const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

    return (
        <div className="w-full">
            <svg ref={svgRef} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-40 overflow-visible">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(v => {
                    const y = padding.top + chartH - (v / 100) * chartH;
                    return <line key={v} x1={padding.left} y1={y} x2={svgWidth - padding.right} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4" />;
                })}

                {/* Fill area */}
                <path d={areaD} fill="var(--accent)" fillOpacity="0.12" />

                {/* Line */}
                <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Data points */}
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r={hoveredIndex === i ? 5 : 3} fill="var(--accent)" stroke="var(--bg-surface)" strokeWidth="2" />
                ))}

                {/* Hover vertical line */}
                {hoveredPoint && (
                    <line x1={hoveredPoint.x} y1={padding.top} x2={hoveredPoint.x} y2={padding.top + chartH} stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
                )}

                {/* Hover tooltip */}
                {hoveredPoint && (
                    <g>
                        <rect x={hoveredPoint.x - 35} y={hoveredPoint.y - 42} width="70" height="34" rx="4" fill="var(--bg-surface)" stroke="var(--border)" strokeWidth="1" />
                        <text x={hoveredPoint.x} y={hoveredPoint.y - 28} fontSize="10" fontWeight="700" fill="var(--text-primary)" textAnchor="middle" dominantBaseline="middle">
                            {new Date(hoveredPoint.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </text>
                        <text x={hoveredPoint.x} y={hoveredPoint.y - 14} fontSize="11" fontWeight="800" fill="var(--accent)" textAnchor="middle" dominantBaseline="middle">
                            {hoveredPoint.score}%
                        </text>
                    </g>
                )}

                {/* Transparent overlay to capture mouse events */}
                <rect x={padding.left} y={padding.top} width={chartW} height={chartH} fill="transparent" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
            </svg>
            <div className="flex justify-between text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1 px-2">
                <span>{new Date(data[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                <span>{new Date(data[data.length - 1].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
        </div>
    );
}
