'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { topicsService } from '@/src/features/topics/services/topics.service';
import { scheduleService } from '@/src/features/schedule/services/schedule.service';
import { questionsService } from '@/src/features/quiz/services/questions.service';
import { timeframeToDays } from '@/src/lib/schedule-calculator';
import { Topic, Unit } from '@/src/types';

export type WizardStep = 'capture' | 'level' | 'familiarity' | 'source' | 'confirmation' | 'generating' | 'exit';

export const sources = [
    { id: 'book', label: 'Book' },
    { id: 'article', label: 'Article' },
    { id: 'video', label: 'Video' },
    { id: 'course', label: 'Course' },
    { id: 'web', label: 'Web' },
    { id: 'other', label: 'Other' },
];



export interface SubUnit {
    id: string;
    name: string;
    description?: string;
    order?: number;
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

    // Units
    const [subUnits, setSubUnits] = useState<SubUnit[]>([]);
    const [newUnitInput, setNewUnitInput] = useState('');

    // Level unit previews — fetched for all 3 levels on topic entry
    const [levelPreviews, setLevelPreviews] = useState<Record<string, { name: string, description: string, order: number }[]>>({});
    const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);

    // Familiarity Check
    const [familiarityStatements, setFamiliarityStatements] = useState<string[]>([]);
    const [checkedStatements, setCheckedStatements] = useState<string[]>([]);
    const [isLoadingFamiliarity, setIsLoadingFamiliarity] = useState(false);

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
        const stepOrder: WizardStep[] = ['capture', 'level', 'familiarity', 'source', 'confirmation'];
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

        // Pre-fetch units for all 3 levels in parallel
        setIsLoadingPreviews(true);
        const levels: ('beginner' | 'intermediate' | 'expert')[] = ['beginner', 'intermediate', 'expert'];
        const results: Record<string, { name: string, description: string, order: number }[]> = {};

        await Promise.all(levels.map(async (lvl) => {
            try {
                const response = await fetch('/api/ai/generate-units', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic: topicName.trim(), level: lvl }),
                });
                const data = await response.json();
                if (data.success && data.units.length > 0) {
                    results[lvl] = data.units;
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

        const previewUnits = levelPreviews[selectedLevel];
        if (previewUnits && previewUnits.length > 0) {
            setSubUnits(previewUnits.map((u, i) => ({
                id: `ai-${i}`,
                name: u.name,
                description: u.description,
                order: u.order,
            })));
        } else if (!isLoadingPreviews) {
            setSubUnits([
                { id: 'fallback-0', name: `Core ${topicName} principles`, description: 'Core principles', order: 1 },
                { id: 'fallback-1', name: `${topicName} fundamentals`, description: 'Fundamentals', order: 2 },
                { id: 'fallback-2', name: `Applied ${topicName}`, description: 'Applied concepts', order: 3 },
                { id: 'fallback-3', name: `${topicName} best practices`, description: 'Best practices', order: 4 },
            ]);
        }
    }, [level, levelPreviews, isLoadingPreviews, topicName]);

    const handleContinueFromLevel = useCallback(async () => {
        if (!level) return;
        goToStep('familiarity');

        if (familiarityStatements.length > 0) return; // already fetched

        setIsLoadingFamiliarity(true);
        try {
            const response = await fetch('/api/ai/generate-familiarity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: topicName, level }),
            });
            const data = await response.json();
            if (data.success && data.statements) {
                setFamiliarityStatements(data.statements);
            } else {
                setFamiliarityStatements([
                    "I understand the basic definition of this.",
                    "I know the main use cases for this.",
                    "I have tried applying this before.",
                    "I can explain this to someone else."
                ]);
            }
        } catch (e) {
            setFamiliarityStatements([
                "I understand the basic definition of this.",
                "I know the main use cases for this.",
                "I have tried applying this before.",
                "I can explain this to someone else."
            ]);
        }
        setIsLoadingFamiliarity(false);
    }, [level, topicName, familiarityStatements, goToStep]);

    // Familiarity Check
    const toggleFamiliarityStatement = useCallback((statement: string) => {
        setCheckedStatements(prev =>
            prev.includes(statement) ? prev.filter(s => s !== statement) : [...prev, statement]
        );
    }, []);

    const handleContinueFromFamiliarity = useCallback(() => {
        goToStep('source');
    }, [goToStep]); // Step 5: Source
    const addSubUnit = useCallback(() => {
        if (!newUnitInput.trim()) return;
        const newId = Math.random().toString(36).substr(2, 9);
        const maxOrder = subUnits.length > 0 ? Math.max(...subUnits.map(u => u.order || 0)) : 0;
        setSubUnits(prev => [...prev, { id: newId, name: newUnitInput.trim(), order: maxOrder + 1 }]);
        setNewUnitInput('');
    }, [newUnitInput, subUnits]);



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
            setSubUnits([]);
            setSource(null);
            setCreatedTopicId(null);
            setFamiliarityStatements([]);
            setCheckedStatements([]);
            goToStep('level');
        }
    }, [duplicateTopic, goToStep]);

    const submitTopic = useCallback(async () => {
        if (!topicName || !level) return;

        goToStep('generating');
        setGenerationStatus('Creating your study plan...');
        setGenerationProgress(10);

        const initialUnits: Unit[] = subUnits.map(su => ({
            id: su.id,
            text: su.name,
            description: su.description,
            order: su.order,
            status: 'neutral' as const,
            familiar: false,
            aiGenerated: su.id.startsWith('ai-'),
        })).sort((a, b) => (a.order || 0) - (b.order || 0));

        const newTopic = topicsService.createTopic(topicName, level);

        let subLevel = 1;
        const total = familiarityStatements.length;
        const checkedCount = checkedStatements.length;

        if (total > 0) {
            if (checkedCount <= 1) subLevel = 1;
            else if (checkedCount === 2) subLevel = 2;
            else if (checkedCount === 3) subLevel = 3;
            else if (checkedCount === 4) subLevel = 4;
            else subLevel = 5;
        }

        const knowledgeGaps = familiarityStatements.filter(s => !checkedStatements.includes(s));

        newTopic.memoryScore = 0;
        newTopic.units = initialUnits;
        newTopic.subLevel = subLevel;
        newTopic.knowledgeGaps = knowledgeGaps;

        topicsService.saveTopic(newTopic);
        setCreatedTopicId(newTopic.id);
        setGenerationProgress(50);

        // Generate quiz questions for each unit
        setGenerationStatus('Generating quiz questions...');
        for (let i = 0; i < initialUnits.length; i++) {
            const u = initialUnits[i];
            const progress = 50 + Math.round(((i + 1) / initialUnits.length) * 45);
            setGenerationStatus(`Generating questions for "${u.text}"... (${i + 1}/${initialUnits.length})`);

            try {
                const quizResponse = await fetch('/api/ai/generate-quiz', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        topic: topicName,
                        unit: u.text,
                        unitId: u.id,
                        topicId: newTopic.id,
                        level,
                        subLevel,
                        knowledgeGaps,
                        count: 10,
                    }),
                });
                const quizData = await quizResponse.json();

                if (quizData.success && quizData.questions.length > 0) {
                    questionsService.saveQuestions(quizData.questions);
                }
            } catch (e) {
                console.error(`Quiz generation failed for ${u.text}:`, e);
            }
            setGenerationProgress(progress);
        }

        setGenerationProgress(100);
        setGenerationStatus('All done!');
        setTimeout(() => goToStep('exit'), 800);
    }, [topicName, level, subUnits, goToStep]);

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

        // Units
        subUnits,
        newUnitInput,
        setNewUnitInput,
        levelPreviews,
        isLoadingPreviews,

        familiarityStatements,
        checkedStatements,
        isLoadingFamiliarity,

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
        toggleFamiliarityStatement,
        handleContinueFromFamiliarity,
        addSubUnit,
        handleSourceSelect,
        handleContinueExisting,
        handleStartFresh,
        submitTopic,
        handleStartQuiz,
        handleGoHome,
    };
}
