'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/src/features/auth/services/auth.service';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated && pathname !== '/login' && pathname !== '/') {
            router.push('/login');
        } else if (isAuthenticated) {
            const hasCompletedOnboarding = authService.hasCompletedOnboarding();

            if (pathname === '/login') {
                router.push(hasCompletedOnboarding ? '/' : '/onboarding');
            } else if (pathname === '/onboarding' && hasCompletedOnboarding) {
                router.push('/');
            } else if (pathname !== '/onboarding' && !hasCompletedOnboarding) {
                router.push('/onboarding');
            }
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    const login = () => {
        setIsAuthenticated(true);
        router.push('/');
    };

    const logout = () => {
        setIsAuthenticated(false);
        router.push('/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
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
