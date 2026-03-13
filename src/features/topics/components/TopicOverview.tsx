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
    onNavigateToUnits: (filter: 'all' | 'strong' | 'weak' | 'unattempted') => void;
}

export function TopicOverview({ topic, onNavigateToUnits }: TopicOverviewProps) {
    const { startQuiz } = useQuizSession();

    const [performanceData, setPerformanceData] = useState<{ date: string; score: number }[]>([]);
    const [practiceDist, setPracticeDist] = useState<{ unitId: string; unitName: string; count: number }[]>([]);
    const [description, setDescription] = useState<string>(topic.description || '');
    const [useCases, setUseCases] = useState<{ title: string; description: string; tag: string }[]>(topic.useCases || []);
    const [descLoading, setDescLoading] = useState(!topic.description);
    const [descError, setDescError] = useState(false);

    // Ref for the Needs Practice slider
    const sliderRef = useRef<number | null>(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isHoveringSlider, setIsHoveringSlider] = useState(false);

    useEffect(() => {
        setPerformanceData(quizHistoryService.getAccuracyOverTime(topic.id));
    }, [topic.id]);

    // Fix 1 — Generate AI description on mount if missing
    useEffect(() => {
        if (topic.description) return;

        const generateDescription = async () => {
            try {
                const res = await fetch('/api/ai/generate-description', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topicName: topic.name, level: topic.level }),
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
        const accuracy = quizHistoryService.computeUnitAccuracy(topic.id, u.id);
        const stats = quizHistoryService.getUnitStats(u.id);
        return { ...u, accuracy, attempts: stats.attempts };
    }).sort((a, b) => b.accuracy - a.accuracy); // descending

    // Slider units
    const weakestUnits = [...unitAccuracies].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);
    
    // Auto advance timer
    useEffect(() => {
        if (weakestUnits.length <= 1) return;
        
        if (!isHoveringSlider) {
            sliderRef.current = window.setInterval(() => {
                setCurrentSlideIndex(prev => (prev + 1) % weakestUnits.length);
            }, 8000);
        }

        return () => {
            if (sliderRef.current) window.clearInterval(sliderRef.current);
        };
    }, [weakestUnits.length, isHoveringSlider]);

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
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-resting)] overflow-hidden">
                        {descLoading ? (
                            <div className="p-5 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating description...
                            </div>
                        ) : descError ? (
                            <div className="p-5">
                                <p className="text-sm text-[var(--text-muted)]">Unable to generate description</p>
                            </div>
                        ) : (
                            <>
                                {/* Concept Section */}
                                <div className="p-5">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] mb-3">Concept</h3>
                                    <p className="text-[15px] leading-relaxed text-[var(--text-primary)]">{description}</p>
                                </div>
                                
                                {/* Commonly Used In Section */}
                                {useCases.length > 0 && (
                                    <div className="p-5 border-t border-[var(--border)]">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] mb-4">Commonly Used In</h3>
                                        <div className="space-y-4">
                                            {useCases.map((uc, i) => (
                                                <div key={i} className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                                                        <div className="font-bold text-[15px] tracking-tight text-[var(--text-primary)]">{uc.title}</div>
                                                    </div>
                                                    <div className="text-[14px] leading-relaxed text-[var(--text-muted)] pl-3.5">{uc.description}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>

                {/* Commonly Used In is now inside the What Is It card above */}

                {/* Unit Progress Overview */}
                <section>
                    <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Unit Progress</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="Practiced" value={practicedUnits.length} total={units.length} color="var(--text-primary)" onClick={() => onNavigateToUnits('all')} />
                        <StatCard label="Strong" value={strongUnits.length} total={units.length} color="var(--success)" onClick={() => onNavigateToUnits('strong')} />
                        <StatCard label="Weak" value={weakUnits.length} total={units.length} color="var(--danger)" onClick={() => onNavigateToUnits('weak')} />
                        <StatCard label="Unattempted" value={unattemptedUnits.length} total={units.length} color="var(--text-muted)" onClick={() => onNavigateToUnits('unattempted')} />
                    </div>
                </section>
            </div>

            {/* Right Column: Analytics */}
            <div className="lg:col-span-5 space-y-6">
                
                {/* Needs Practice Slider */}
                {weakestUnits.length > 0 && (
                    <div 
                        className="rounded-xl overflow-hidden relative"
                        style={{ 
                            background: 'linear-gradient(135deg, #3730A3 0%, #4338CA 40%, #5B4FE8 100%)',
                            border: '1px solid rgba(104,96,240,.5)',
                            boxShadow: '0 4px 24px rgba(104,96,240,.25), 0 1px 4px rgba(0,0,0,.4)'
                        }}
                        onMouseEnter={() => setIsHoveringSlider(true)}
                        onMouseLeave={() => setIsHoveringSlider(false)}
                    >
                        {/* Header Row */}
                        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 flex items-center gap-1.5">
                                <span className="text-[12px]">⚠</span> NEEDS PRACTICE
                            </span>
                            {/* Dots */}
                            {weakestUnits.length > 1 && (
                                <div className="flex gap-1.5">
                                    {weakestUnits.map((_, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => {
                                                setCurrentSlideIndex(i);
                                                // Reset interval on manual click
                                                if (sliderRef.current) window.clearInterval(sliderRef.current);
                                                if (!isHoveringSlider) {
                                                    sliderRef.current = window.setInterval(() => {
                                                        setCurrentSlideIndex(prev => (prev + 1) % weakestUnits.length);
                                                    }, 8000);
                                                }
                                            }}
                                            className="h-1.5 rounded-full transition-all"
                                            style={{ 
                                                width: currentSlideIndex === i ? '12px' : '6px',
                                                background: currentSlideIndex === i ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.25)' 
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Viewport clips height to ~100px to avoid jumpy resizing */}
                        <div className="overflow-hidden relative" style={{ height: '110px' }}>
                            <div 
                                className="absolute top-0 left-0 h-full flex" 
                                style={{ 
                                    width: `${weakestUnits.length * 100}%`,
                                    transform: `translateX(-${(currentSlideIndex / weakestUnits.length) * 100}%)`,
                                    transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                {weakestUnits.map((unit, i) => (
                                    <div key={i} className="flex flex-col justify-between px-5 pb-5 h-full" style={{ width: `${100 / weakestUnits.length}%` }}>
                                        <div className="flex items-start justify-between gap-4">
                                            <h3 className="text-white font-bold text-[15px] leading-tight line-clamp-2">
                                                {unit.text}
                                            </h3>
                                            <div className="shrink-0 pt-0.5">
                                                <button
                                                    onClick={() => handleStartUnit(unit.id)}
                                                    className="bg-white text-[var(--accent)] text-xs font-bold px-3 py-1.5 rounded-md hover:bg-white/90 transition-colors shadow-sm"
                                                >
                                                    Start
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 flex items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[11px] font-medium text-white/75 uppercase tracking-wide">
                                                        {unit.attempts === 0 ? "0% — Never practiced" : `${unit.accuracy}% Mastery`}
                                                    </span>
                                                </div>
                                                <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-white/85 rounded-full" 
                                                        style={{ width: `${Math.max(0, unit.accuracy)}%` }} 
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-white/45 font-bold tabular-nums self-end">
                                                {i + 1} of {weakestUnits.length}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Fix 5 — Performance Trend: Interactive SVG Chart */}
                <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-resting)]">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest mb-6" style={{ color: 'var(--text-muted)' }}>Performance Trend</h3>
                    <InteractiveLineChart data={performanceData} />
                </div>

                {/* Fix 3 — Unit Health: Individual horizontal bars */}
                <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-resting)]">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Unit Health</h3>
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

            </div>
        </div>
    );
}

function StatCard({ label, value, total, color, onClick }: { label: string; value: number; total: number; color: string; onClick?: () => void }) {
    return (
        <button 
            onClick={onClick}
            className="w-full relative group p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] shadow-[var(--shadow-resting)] flex flex-col items-center justify-center transition-all hover:-translate-y-[1px]"
            style={{ 
                '--hover-bg': `${color}0A`, // Very light transparent tint
            } as React.CSSProperties}
        >
            <div className="absolute inset-0 rounded-lg group-hover:bg-[var(--hover-bg)] transition-colors" />
            
            {/* View Arrow Hint */}
            <div 
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold tracking-wider"
                style={{ color }}
            >
                View →
            </div>

            <div className="relative text-2xl font-black transition-colors group-hover:drop-shadow-sm" style={{ color }}>{value}</div>
            <div className="relative text-xs font-medium text-[var(--text-muted)] mt-1">{label}</div>
            {total > 0 && <div className="relative text-[10px] text-[var(--text-muted)] mt-0.5">{Math.round((value / total) * 100)}%</div>}
            
            <style jsx>{`
                button:hover {
                    border-color: ${color}40; /* 25% opacity border */
                }
            `}</style>
        </button>
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
