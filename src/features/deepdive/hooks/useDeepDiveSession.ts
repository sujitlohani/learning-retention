import { useState, useEffect, useCallback } from 'react';
import { topicsService } from '@/src/features/topics/services/topics.service';

export interface KeyIdeaData {
    title: string;
    explanation: string;
    codeSnippet: { language: string; code: string; resultLine: string } | null;
}

export interface ExampleLine {
    code: string;
    explanation: string;
}

export interface MiniCheckQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

interface StepReady {
    keyIdea: boolean;
    example: boolean;  // true if loaded OR skipped (no code snippet)
    miniCheck: boolean;
}

interface DeepDiveState {
    step: 1 | 2 | 3 | 4;
    keyIdea: KeyIdeaData | null;
    example: ExampleLine[] | null;
    miniCheck: MiniCheckQuestion[] | null;
    miniCheckAnswers: Record<number, number>;
    currentMiniQ: number;
    stepReady: StepReady;
    loading: boolean;
    error: string | null;
}

async function callLearnApi(step: string, ctx: Record<string, string>): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const res = await fetch('/api/ai/learn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ step, ...ctx })
        });
        const json = await res.json();
        if (json.success && json.data) return { success: true, data: json.data };
        return { success: false, error: json.error || 'AI response failed' };
    } catch {
        return { success: false, error: 'Network error' };
    }
}

export function useDeepDiveSession(topicId: string | null, unitId: string | null) {
    const [state, setState] = useState<DeepDiveState>({
        step: 1,
        keyIdea: null,
        example: null,
        miniCheck: null,
        miniCheckAnswers: {},
        currentMiniQ: 0,
        stepReady: { keyIdea: false, example: false, miniCheck: false },
        loading: true,
        error: null
    });

    const topic = topicId ? topicsService.getTopicById(topicId) : null;
    const unit = topic && unitId ? topic.units.find(u => u.id === unitId) : null;
    const topicName = topic?.name || '';
    const unitName = unit?.text || '';

    // ── Prefetch: fire key-idea on mount → then example + mini-check in parallel ──
    useEffect(() => {
        if (!topicId || !unitId || !unitName || !topicName) return;
        let cancelled = false;

        (async () => {
            // Phase 1: Key Idea
            const kiResult = await callLearnApi('key-idea', { unitName, topicName });
            if (cancelled) return;

            if (!kiResult.success || !kiResult.data) {
                setState(prev => ({ ...prev, error: kiResult.error || 'Failed to load key idea', loading: false }));
                return;
            }

            const keyIdea = kiResult.data as KeyIdeaData;
            const hasCode = keyIdea.codeSnippet !== null;

            setState(prev => ({
                ...prev,
                keyIdea,
                loading: false,
                stepReady: { ...prev.stepReady, keyIdea: true, example: !hasCode }  // example ready if skipped
            }));

            // Phase 2: fire example + mini-check in parallel
            const promises: Promise<void>[] = [];

            if (hasCode) {
                promises.push(
                    callLearnApi('example', { unitName, topicName, code: keyIdea.codeSnippet!.code }).then(res => {
                        if (cancelled) return;
                        if (res.success && res.data?.lines) {
                            setState(prev => ({ ...prev, example: res.data.lines, stepReady: { ...prev.stepReady, example: true } }));
                        } else {
                            // Mark as ready even on failure so the flow isn't blocked
                            setState(prev => ({ ...prev, stepReady: { ...prev.stepReady, example: true } }));
                        }
                    })
                );
            }

            promises.push(
                callLearnApi('mini-check', { unitName, topicName, title: keyIdea.title }).then(res => {
                    if (cancelled) return;
                    if (res.success && res.data?.questions) {
                        setState(prev => ({ ...prev, miniCheck: res.data.questions, stepReady: { ...prev.stepReady, miniCheck: true } }));
                    } else {
                        setState(prev => ({ ...prev, stepReady: { ...prev.stepReady, miniCheck: true } }));
                    }
                })
            );

            await Promise.all(promises);
        })();

        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topicId, unitId]);

    // ── Step navigation ──
    const advanceToStep2 = useCallback(() => {
        if (!state.keyIdea) return;
        if (!state.keyIdea.codeSnippet) {
            // No code → skip step 2 entirely
            setState(prev => ({ ...prev, step: 3 }));
            return;
        }
        setState(prev => ({ ...prev, step: 2 }));
    }, [state.keyIdea]);

    const advanceToStep3 = useCallback(() => {
        setState(prev => ({ ...prev, step: 3 }));
    }, []);

    const advanceToStep4 = useCallback(() => {
        setState(prev => ({ ...prev, step: 4 }));
    }, []);

    const recordMiniCheckAnswer = useCallback((questionIndex: number, answerIndex: number) => {
        setState(prev => ({ ...prev, miniCheckAnswers: { ...prev.miniCheckAnswers, [questionIndex]: answerIndex } }));
    }, []);

    const advanceMiniQ = useCallback(() => {
        setState(prev => ({ ...prev, currentMiniQ: prev.currentMiniQ + 1 }));
    }, []);

    const fetchAlternateExplanation = useCallback(async (): Promise<string | null> => {
        const title = state.keyIdea?.title || unitName;
        const result = await callLearnApi('alternate', { unitName, topicName, title });
        if (result.success && result.data?.explanation) return result.data.explanation;
        return null;
    }, [state.keyIdea?.title, unitName, topicName]);

    return {
        topicId: topicId || '',
        unitId: unitId || '',
        topicName,
        unitName,
        ...state,
        advanceToStep2,
        advanceToStep3,
        advanceToStep4,
        recordMiniCheckAnswer,
        advanceMiniQ,
        fetchAlternateExplanation
    };
}
