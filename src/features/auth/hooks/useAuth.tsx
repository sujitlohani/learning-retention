'use client';

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { setUserId } from '@/src/lib/user-store';

interface AuthContextType {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    login: () => { },
    logout: () => { },
    isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

function isDemoActive(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('memora-demo-active') === 'true';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const pathname = usePathname();

    // Read demo state synchronously — no useState lag
    const isDemoUser = isDemoActive();
    const isAuthenticated = !!user || isDemoUser;
    const isLoading = !isLoaded;

    // Set userId for localStorage scoping
    useEffect(() => {
        if (!isLoaded) return;
        if (user?.id) {
            setUserId(user.id);
        } else if (isDemoUser) {
            setUserId('demo');
        } else {
            setUserId('anonymous');
        }
    }, [isLoaded, user, isDemoUser]);

    // Minimal redirect logic — only redirect demo/authed users away from /login
    useEffect(() => {
        if (isLoading) return;

        if (isAuthenticated && pathname === '/login') {
            router.push('/');
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    const login = () => {
        router.push('/login');
    };

    const logout = useCallback(async () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('memora-demo-active');
        }
        if (user) {
            await signOut({ redirectUrl: '/' });
        } else {
            // Demo user — just reload to landing
            router.push('/');
            router.refresh();
        }
    }, [user, signOut, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
