'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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
        // Check if we are already logged in (persistence logic if needed, 
        // but USER explicitly said "reset on refresh is acceptable", so we default to false).
        // However, to make development less painful, I'll use sessionStorage so a simple refresh keeps you logged in,
        // but closing tab kills it.

        // User Update: "Ensure session resets on refresh (acceptable for MVP)"
        // Okay, strictly following instructions: NO persistence.
        // BUT, that makes the "redirect to login if no session" rule trigger constantly on dev reload.
        // I will stick to React State = Reset on Refresh.

        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!isLoading && !isAuthenticated && pathname !== '/login') {
            router.push('/login');
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

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
