import { Activity } from 'lucide-react';
import { ConceptCardLocked } from '@/src/shared/components/ConceptCardLocked';

// TODO: replace with real data hook
const RECOMMENDED_CONCEPTS = [
    {
        id: 'binary-trees',
        topicLabel: 'Data Structures',
        difficultyLabel: 'Intermediate',
        conceptName: 'Binary Trees',
        description: 'Master the fundamentals of hierarchical data structures and traversal algorithms.',
        iconName: 'Network'
    },
    {
        id: 'decorators',
        topicLabel: 'Python',
        difficultyLabel: 'Intermediate',
        conceptName: 'Decorators in Python',
        description: 'Learn how to extend the behavior of functions or classes dynamically.',
        iconName: 'Code'
    },
    {
        id: 'random-forest',
        topicLabel: 'ML',
        difficultyLabel: 'Advanced',
        conceptName: 'Random Forest',
        description: 'Understand ensemble learning methods for robust classification and regression.',
        iconName: 'Database'
    },
    {
        id: 'recursion',
        topicLabel: 'CS Fundamentals',
        difficultyLabel: 'Beginner',
        conceptName: 'Recursion',
        description: 'Master the art of solving complex problems by breaking them into simpler sub-problems.',
        iconName: 'RefreshCw'
    }
];

export function RecommendedConcepts() {
    return (
        <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Activity className="w-6 h-6 text-primary" />
                    ✦ Recommended Concepts
                </h2>
                <button className="text-sm font-semibold text-primary hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {RECOMMENDED_CONCEPTS.map((concept) => (
                    <ConceptCardLocked
                        key={concept.id}
                        id={concept.id}
                        topicLabel={concept.topicLabel}
                        difficultyLabel={concept.difficultyLabel}
                        conceptName={concept.conceptName}
                        description={concept.description}
                    />
                ))}
            </div>
        </section>
    );
}
