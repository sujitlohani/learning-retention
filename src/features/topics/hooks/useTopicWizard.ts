'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { topicsService } from '@/src/features/topics/services/topics.service';
import { scheduleService } from '@/src/features/schedule/services/schedule.service';
import { questionsService } from '@/src/features/quiz/services/questions.service';
import { timeframeToDays } from '@/src/lib/schedule-calculator';
import { Topic, Concept } from '@/src/types';

export type WizardStep = 'capture' | 'level' | 'timeframe' | 'commitment' | 'source' | 'confirmation' | 'generating' | 'exit';

export const sources = [
    { id: 'book', label: 'Book' },
    { id: 'article', label: 'Article' },
    { id: 'video', label: 'Video' },
    { id: 'course', label: 'Course' },
    { id: 'web', label: 'Web' },
    { id: 'other', label: 'Other' },
];

export const timeframeOptions = [
    { value: '1 week', label: '1 Week', desc: 'Intensive, daily practice' },
    { value: '2 weeks', label: '2 Weeks', desc: 'Focused learning' },
    { value: '3 weeks', label: '3 Weeks', desc: 'Balanced pace' },
    { value: '1 month', label: '1 Month', desc: 'Relaxed, thorough' },
    { value: '3 months', label: '3 Months', desc: 'Long-term mastery' },
];

export const commitmentOptions = [
    { value: 5, label: '5 min', desc: 'Quick reviews, 2-3 questions' },
    { value: 10, label: '10 min', desc: 'Standard session, 5-7 questions' },
    { value: 15, label: '15 min', desc: 'Focused session, 8-10 questions' },
    { value: 30, label: '30 min', desc: 'Deep practice, 15-20 questions' },
    { value: 60, label: '1 hour', desc: 'Intensive study, 30+ questions' },
];

export interface SubConcept {
    id: string;
    name: string;
    checked: boolean;
}

export function useTopicWizard() {
    const router = useRouter();

    // Step tracking
    const [currentStep, setCurrentStep] = useState<WizardStep>('capture');
    const [direction, setDirection] = useState(0);

    // Form state
    const [topicName, setTopicName] = useState('');
    const [level, setLevel] = useState<'beginner' | 'intermediate' | 'expert' | null>(null);
    const [source, setSource] = useState<string | null>(null);
    const [selectedTimeframe, setSelectedTimeframe] = useState<string | null>(null);
    const [dailyCommitment, setDailyCommitment] = useState<number | null>(null);

    // Concepts
    const [subConcepts, setSubConcepts] = useState<SubConcept[]>([]);
    const [newConceptInput, setNewConceptInput] = useState('');

    // Level concept previews — fetched for all 3 levels on topic entry
    const [levelPreviews, setLevelPreviews] = useState<Record<string, string[]>>({});
    const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);

    // Duplicate detection
    const [duplicateTopic, setDuplicateTopic] = useState<Topic | null>(null);
    const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

    // Generation
    const [createdTopicId, setCreatedTopicId] = useState<string | null>(null);
    const [generationStatus, setGenerationStatus] = useState('');
    const [generationProgress, setGenerationProgress] = useState(0);

    // Navigation
    const goToStep = useCallback((next: WizardStep) => {
        setDirection(1);
        setCurrentStep(next);
    }, []);

    const goBack = useCallback(() => {
        setDirection(-1);
        const stepOrder: WizardStep[] = ['capture', 'level', 'timeframe', 'commitment', 'source', 'confirmation'];
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(stepOrder[currentIndex - 1]);
        }
    }, [currentStep]);

    // Step 1: Capture — check for duplicates, then pre-fetch concepts
    const handleCaptureContinue = useCallback(async () => {
        if (!topicName.trim()) return;

        const isDuplicate = topicsService.checkDuplicateName(topicName.trim());
        if (isDuplicate) {
            const topics = topicsService.getTopics();
            const dup = topics.find(t => t.name.toLowerCase() === topicName.trim().toLowerCase());
            if (dup) {
                setDuplicateTopic(dup);
                setShowDuplicateDialog(true);
                return;
            }
        }

        goToStep('level');

        // Pre-fetch concepts for all 3 levels in parallel
        setIsLoadingPreviews(true);
        const levels: ('beginner' | 'intermediate' | 'expert')[] = ['beginner', 'intermediate', 'expert'];
        const results: Record<string, string[]> = {};

        await Promise.all(levels.map(async (lvl) => {
            try {
                const response = await fetch('/api/ai/generate-concepts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic: topicName.trim(), level: lvl }),
                });
                const data = await response.json();
                if (data.success && data.concepts.length > 0) {
                    results[lvl] = data.concepts;
                }
            } catch {
                // silent — fallback text stays
            }
        }));

        setLevelPreviews(results);
        setIsLoadingPreviews(false);
    }, [topicName, goToStep]);

    // Step 2: Level — toggle accordion
    const toggleLevelSelect = useCallback((selectedLevel: 'beginner' | 'intermediate' | 'expert') => {
        if (level === selectedLevel) {
            setLevel(null);
        } else {
            setLevel(selectedLevel);
        }

        const previewConcepts = levelPreviews[selectedLevel];
        if (previewConcepts && previewConcepts.length > 0) {
            setSubConcepts(previewConcepts.map((c, i) => ({
                id: `ai-${i}`,
                name: c,
                checked: false,
            })));
        } else if (!isLoadingPreviews) {
            setSubConcepts([
                { id: 'fallback-0', name: `Core ${topicName} principles`, checked: false },
                { id: 'fallback-1', name: `${topicName} fundamentals`, checked: false },
                { id: 'fallback-2', name: `Applied ${topicName}`, checked: false },
                { id: 'fallback-3', name: `${topicName} best practices`, checked: false },
            ]);
        }
    }, [level, levelPreviews, isLoadingPreviews, topicName]);

    const handleContinueFromLevel = useCallback(() => {
        if (!level) return;
        goToStep('timeframe');
    }, [level, goToStep]);

    // Concept management
    const toggleSubConcept = useCallback((id: string) => {
        setSubConcepts(prev => prev.map(c =>
            c.id === id ? { ...c, checked: !c.checked } : c
        ));
    }, []);

    const addSubConcept = useCallback(() => {
        if (!newConceptInput.trim()) return;
        const newId = Math.random().toString(36).substr(2, 9);
        setSubConcepts(prev => [...prev, { id: newId, name: newConceptInput.trim(), checked: false }]);
        setNewConceptInput('');
    }, [newConceptInput]);

    // Step 3: Timeframe
    const handleTimeframeSelect = useCallback((value: string) => {
        setSelectedTimeframe(value);
        setTimeout(() => goToStep('commitment'), 600);
    }, [goToStep]);

    // Step 4: Commitment
    const handleCommitmentSelect = useCallback((value: number) => {
        setDailyCommitment(value);
        setTimeout(() => goToStep('source'), 600);
    }, [goToStep]);

    // Step 5: Source
    const handleSourceSelect = useCallback((id: string) => {
        setSource(id);
        setTimeout(() => goToStep('confirmation'), 800);
    }, [goToStep]);

    // Duplicate handling
    const handleContinueExisting = useCallback(() => {
        if (duplicateTopic) {
            router.push(`/learn/${duplicateTopic.id}`);
        }
    }, [duplicateTopic, router]);

    const handleStartFresh = useCallback(() => {
        if (duplicateTopic) {
            topicsService.deleteTopic(duplicateTopic.id);
            scheduleService.deleteSchedule(duplicateTopic.id);
            questionsService.deleteQuestionsForTopic(duplicateTopic.id);
            setDuplicateTopic(null);
            setShowDuplicateDialog(false);
            setLevel(null);
            setSubConcepts([]);
            setSource(null);
            setCreatedTopicId(null);
            setSelectedTimeframe(null);
            setDailyCommitment(null);
            goToStep('level');
        }
    }, [duplicateTopic, goToStep]);

    // Submit — create topic, generate schedule + quiz
    const submitTopic = useCallback(async () => {
        if (!topicName || !level || !selectedTimeframe || !dailyCommitment) return;

        goToStep('generating');
        setGenerationStatus('Creating your study plan...');
        setGenerationProgress(10);

        const selectedConcepts = subConcepts.filter(sc => sc.checked);
        if (selectedConcepts.length === 0) {
            subConcepts.forEach(sc => sc.checked = true);
        }
        const conceptsToUse = subConcepts.filter(sc => sc.checked).length > 0
            ? subConcepts.filter(sc => sc.checked)
            : subConcepts;

        const initialConcepts: Concept[] = conceptsToUse.map(sc => ({
            id: sc.id,
            text: sc.name,
            status: 'neutral' as const,
            familiar: sc.checked,
            aiGenerated: sc.id.startsWith('ai-'),
        }));

        const timeframeDays = timeframeToDays(selectedTimeframe);
        const newTopic = topicsService.createTopic(topicName, level);
        newTopic.memoryScore = 0;
        newTopic.concepts = initialConcepts;
        newTopic.studyPlan = {
            selectedTimeframe,
            timeframeDays,
            dailyMinutes: dailyCommitment,
            targetDate: new Date(Date.now() + timeframeDays * 24 * 60 * 60 * 1000).toISOString(),
            questionsPerSession: 5,
        };
        topicsService.saveTopic(newTopic);
        setCreatedTopicId(newTopic.id);
        setGenerationProgress(25);

        // Generate schedule
        try {
            setGenerationStatus('Generating study schedule...');
            const scheduleResponse = await fetch('/api/ai/generate-schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topicId: newTopic.id,
                    concepts: initialConcepts.map(c => ({ id: c.id, name: c.text })),
                    timeframeDays,
                    dailyMinutes: dailyCommitment,
                }),
            });
            const scheduleData = await scheduleResponse.json();

            if (scheduleData.success && scheduleData.schedule) {
                scheduleService.saveSchedule(scheduleData.schedule);
                newTopic.scheduleId = scheduleData.schedule.id;
                newTopic.studyPlan!.questionsPerSession = scheduleData.schedule.sessions[0]?.questionCount || 5;
                topicsService.saveTopic(newTopic);
            }
        } catch (e) {
            console.error('Schedule generation failed:', e);
        }
        setGenerationProgress(50);

        // Generate quiz questions for each concept
        setGenerationStatus('Generating quiz questions...');
        for (let i = 0; i < initialConcepts.length; i++) {
            const c = initialConcepts[i];
            const progress = 50 + Math.round(((i + 1) / initialConcepts.length) * 45);
            setGenerationStatus(`Generating questions for "${c.text}"... (${i + 1}/${initialConcepts.length})`);

            try {
                const quizResponse = await fetch('/api/ai/generate-quiz', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        topic: topicName,
                        concept: c.text,
                        conceptId: c.id,
                        topicId: newTopic.id,
                        level,
                        count: 10,
                    }),
                });
                const quizData = await quizResponse.json();

                if (quizData.success && quizData.questions.length > 0) {
                    questionsService.saveQuestions(quizData.questions);
                }
            } catch (e) {
                console.error(`Quiz generation failed for ${c.text}:`, e);
            }
            setGenerationProgress(progress);
        }

        setGenerationProgress(100);
        setGenerationStatus('All done!');
        setTimeout(() => goToStep('exit'), 800);
    }, [topicName, level, selectedTimeframe, dailyCommitment, subConcepts, goToStep]);

    const handleStartQuiz = useCallback(() => {
        if (createdTopicId) {
            router.push(`/learn/${createdTopicId}`);
        } else {
            router.push('/');
        }
    }, [createdTopicId, router]);

    const handleGoHome = useCallback(() => {
        router.push('/');
    }, [router]);

    return {
        // Step state
        currentStep,
        direction,

        // Form fields
        topicName,
        setTopicName,
        level,
        source,
        selectedTimeframe,
        dailyCommitment,

        // Concepts
        subConcepts,
        newConceptInput,
        setNewConceptInput,
        levelPreviews,
        isLoadingPreviews,

        // Duplicate
        duplicateTopic,
        showDuplicateDialog,
        setShowDuplicateDialog,

        // Generation
        createdTopicId,
        generationStatus,
        generationProgress,

        // Actions
        goToStep,
        goBack,
        handleCaptureContinue,
        toggleLevelSelect,
        handleContinueFromLevel,
        toggleSubConcept,
        addSubConcept,
        handleTimeframeSelect,
        handleCommitmentSelect,
        handleSourceSelect,
        handleContinueExisting,
        handleStartFresh,
        submitTopic,
        handleStartQuiz,
        handleGoHome,
    };
}
