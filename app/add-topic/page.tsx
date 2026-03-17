import { Suspense } from 'react';
import { AddTopicPage } from '@/src/features/topics/components/AddTopicPage';

export default function AddTopicRoute() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}><div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>}>
            <AddTopicPage />
        </Suspense>
    );
}
