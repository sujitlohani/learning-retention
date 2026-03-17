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

interface StepErrors {
    keyIdea: string | null;
    example: string | null;
    miniCheck: string | null;
}

interface DeepDiveState {
    step: 1 | 2 | 3 | 4;
    keyIdea: KeyIdeaData | null;
    example: ExampleLine[] | null;
    miniCheck: MiniCheckQuestion[] | null;
    miniCheckAnswers: Record<number, number>;
    currentMiniQ: number;
    stepReady: StepReady;
    stepErrors: StepErrors;
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
        stepErrors: { keyIdea: null, example: null, miniCheck: null },
        loading: true,
        error: null
    });

    const topic = topicId ? topicsService.getTopicById(topicId) : null;
    const unit = topic && unitId ? topic.units.find(u => u.id === unitId) : null;
    const topicName = topic?.name || '';
    const unitName = unit?.text || '';

    const fetchKeyIdea = useCallback(async () => {
        if (!topicId || !unitId || !unitName || !topicName) return null;
        setState(prev => ({ ...prev, loading: true, stepErrors: { ...prev.stepErrors, keyIdea: null } }));
        const kiResult = await callLearnApi('key-idea', { unitName, topicName });
        
        if (!kiResult.success || !kiResult.data) {
            setState(prev => ({ ...prev, stepErrors: { ...prev.stepErrors, keyIdea: kiResult.error || 'Failed to load key idea' }, loading: false }));
            return null;
        }

        const keyIdea = kiResult.data as KeyIdeaData;
        const hasCode = !!(keyIdea.codeSnippet && typeof keyIdea.codeSnippet.code === 'string' && keyIdea.codeSnippet.code.length > 0);
        const codeLines = hasCode ? keyIdea.codeSnippet?.code?.split('\n').filter((l: string) => l.trim().length > 0).length || 0 : 0;
        const shouldRunExample = hasCode && codeLines >= 3;

        setState(prev => ({
            ...prev,
            keyIdea,
            loading: false,
            stepReady: { ...prev.stepReady, keyIdea: true, example: !shouldRunExample } // example ready if skipped
        }));
        
        return { keyIdea, shouldRunExample };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topicId, unitId, unitName, topicName]);

    const fetchExample = useCallback(async (code: string) => {
        if (!topicId || !unitId || !unitName || !topicName) return;
        setState(prev => ({ ...prev, stepErrors: { ...prev.stepErrors, example: null }, stepReady: { ...prev.stepReady, example: false } }));
        const res = await callLearnApi('example', { unitName, topicName, code });
        if (res.success && res.data?.lines) {
            setState(prev => ({ ...prev, example: res.data.lines, stepReady: { ...prev.stepReady, example: true } }));
        } else {
            setState(prev => ({ ...prev, stepErrors: { ...prev.stepErrors, example: res.error || 'Failed to parse' } }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topicId, unitId, unitName, topicName]);

    const fetchMiniCheck = useCallback(async (title: string) => {
        if (!topicId || !unitId || !unitName || !topicName) return;
        setState(prev => ({ ...prev, stepErrors: { ...prev.stepErrors, miniCheck: null }, stepReady: { ...prev.stepReady, miniCheck: false } }));
        const res = await callLearnApi('mini-check', { unitName, topicName, title });
        if (res.success && res.data?.questions) {
            setState(prev => ({ ...prev, miniCheck: res.data.questions, stepReady: { ...prev.stepReady, miniCheck: true } }));
        } else {
            setState(prev => ({ ...prev, stepErrors: { ...prev.stepErrors, miniCheck: res.error || 'Failed to parse' } }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topicId, unitId, unitName, topicName]);

    // ── Prefetch: fire key-idea on mount → then example + mini-check in parallel ──
    useEffect(() => {
        let cancelled = false;

        (async () => {
            const kiData = await fetchKeyIdea();
            if (cancelled || !kiData) return;

            const promises: Promise<void>[] = [];
            if (kiData.shouldRunExample) {
                promises.push(fetchExample(kiData.keyIdea.codeSnippet!.code));
            }
            promises.push(fetchMiniCheck(kiData.keyIdea.title));

            await Promise.all(promises);
        })();

        return () => { cancelled = true; };
    }, [fetchKeyIdea, fetchExample, fetchMiniCheck]);

    // ── Step navigation ──
    const advanceToStep2 = useCallback(() => {
        if (!state.keyIdea) return;
        const hasCode = !!(state.keyIdea.codeSnippet && state.keyIdea.codeSnippet.code);
        const codeLines = hasCode ? state.keyIdea.codeSnippet!.code.split('\n').filter(l => l.trim().length > 0).length : 0;
        
        if (!hasCode || codeLines < 3) {
            // No code or too short → skip step 2 entirely
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

    const retryStep = useCallback(async (targetStep: 'keyIdea' | 'example' | 'miniCheck') => {
        if (targetStep === 'keyIdea') {
            const kiData = await fetchKeyIdea();
            if (kiData) {
                if (kiData.shouldRunExample) fetchExample(kiData.keyIdea.codeSnippet!.code);
                fetchMiniCheck(kiData.keyIdea.title);
            }
        } else if (targetStep === 'example') {
            if (state.keyIdea?.codeSnippet?.code) fetchExample(state.keyIdea.codeSnippet.code);
        } else if (targetStep === 'miniCheck') {
            if (state.keyIdea?.title) fetchMiniCheck(state.keyIdea.title);
        }
    }, [fetchKeyIdea, fetchExample, fetchMiniCheck, state.keyIdea]);

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
        fetchAlternateExplanation,
        retryStep
    };
}
