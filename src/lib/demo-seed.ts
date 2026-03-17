// src/lib/demo-seed.ts
import { topicsService } from '@/src/features/topics/services/topics.service';
import { Topic, Unit } from '@/src/types';
import { quizHistoryService } from '@/src/features/quiz/services/quiz-history.service';
import { QuizAttempt } from '@/src/types/ai';
import { authService } from '@/src/features/auth/services/auth.service';

export function seedDemoData() {
    if (typeof window === 'undefined') return;

    // Only seed if empty
    const existingTopics = topicsService.getTopics();
    if (existingTopics.length > 0) return;

    authService.completeOnboarding();

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Create 2 topics
    const topic1: Topic = {
        id: 'demo-topic-1',
        name: 'Binary Trees',
        memoryScore: 78,
        level: 'beginner',
        lastPracticed: yesterday,
        nextReviewDate: new Date(now.getTime() + 86400000),
        totalAttempts: 2,
        units: [
            { id: 'u1', text: 'Definition and root nodes', status: 'strong' },
            { id: 'u2', text: 'Left and right children', status: 'strong' },
            { id: 'u3', text: 'Leaf nodes', status: 'strong' },
            { id: 'u4', text: 'Binary Search Tree property', status: 'weak' },
            { id: 'u5', text: 'In-order traversal', status: 'weak' },
            { id: 'u6', text: 'Time complexity of search', status: 'neutral' }
        ]
    };

    const topic2: Topic = {
        id: 'demo-topic-2',
        name: 'React Hooks',
        memoryScore: 45,
        level: 'intermediate',
        lastPracticed: yesterday,
        nextReviewDate: new Date(now.getTime() + 86400000),
        totalAttempts: 1,
        units: [
            { id: 'u7', text: 'useState basics', status: 'strong' },
            { id: 'u8', text: 'useEffect dependencies', status: 'weak' },
            { id: 'u9', text: 'useContext for global state', status: 'neutral' },
            { id: 'u10', text: 'useMemo for performance', status: 'weak' }
        ]
    };

    topicsService._saveTopics([topic1, topic2]);

    // Seed some quiz history
    const history: QuizAttempt[] = [
        {
            id: 'h1',
            topicId: 'demo-topic-1',
            type: 'daily',
            completedAt: twoDaysAgo.toISOString(),
            score: 60,
            correctCount: 3,
            totalCount: 5,
            unitBreakdown: [
                { unitId: 'u1', correctCount: 1, totalCount: 1, score: 100 },
                { unitId: 'u2', correctCount: 1, totalCount: 1, score: 100 },
                { unitId: 'u3', correctCount: 1, totalCount: 1, score: 100 },
                { unitId: 'u4', correctCount: 0, totalCount: 1, score: 0 },
                { unitId: 'u5', correctCount: 0, totalCount: 1, score: 0 }
            ],
            questions: []
        },
        {
            id: 'h2',
            topicId: 'demo-topic-1',
            type: 'weak-area',
            completedAt: yesterday.toISOString(),
            score: 80,
            correctCount: 4,
            totalCount: 5,
            unitBreakdown: [
                { unitId: 'u1', correctCount: 1, totalCount: 1, score: 100 },
                { unitId: 'u2', correctCount: 1, totalCount: 1, score: 100 },
                { unitId: 'u3', correctCount: 1, totalCount: 1, score: 100 },
                { unitId: 'u4', correctCount: 0, totalCount: 1, score: 0 },
                { unitId: 'u5', correctCount: 1, totalCount: 1, score: 100 }
            ],
            questions: []
        },
        {
            id: 'h3',
            topicId: 'demo-topic-2',
            type: 'daily',
            completedAt: yesterday.toISOString(),
            score: 40,
            correctCount: 2,
            totalCount: 5,
            unitBreakdown: [
                { unitId: 'u7', correctCount: 1, totalCount: 1, score: 100 },
                { unitId: 'u8', correctCount: 0, totalCount: 2, score: 0 },
                { unitId: 'u10', correctCount: 0, totalCount: 2, score: 0 }
            ],
            questions: []
        }
    ];

    history.forEach(h => quizHistoryService.saveAttempt(h));
}
