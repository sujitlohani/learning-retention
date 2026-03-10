import { ConceptLocked } from '@/src/features/concepts/components/ConceptLocked';
import { ConceptUnlocked } from '@/src/features/concepts/components/ConceptUnlocked';

export default async function ConceptPageRoute({ params }: { params: Promise<{ id: string }> }) {
    // TODO: replace with real data hook
    const resolvedParams = await params;
    const isUnlocked = resolvedParams.id === 'unlocked-demo';

    if (!isUnlocked) {
        return <ConceptLocked id={resolvedParams.id} />;
    }

    return <ConceptUnlocked id={resolvedParams.id} />;
}
