import { Suspense } from 'react';
import { DeepDiveLearnSession } from '@/src/features/deepdive/components/DeepDiveLearnSession';

export default function DeepDiveLearnRoute() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}><div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>}>
            <DeepDiveLearnSession />
        </Suspense>
    );
}
