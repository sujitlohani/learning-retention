'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { setUserId } from '@/src/lib/user-store';

export function UserInit() {
    const { userId, isLoaded } = useAuth();

    useEffect(() => {
        if (isLoaded) {
            if (userId) {
                setUserId(userId);
            } else {
                const isDemo = typeof window !== 'undefined' ? localStorage.getItem('memora-demo-active') === 'true' : false;
                setUserId(isDemo ? 'demo' : 'anonymous');
            }
        }
    }, [userId, isLoaded]);

    return null;
}
