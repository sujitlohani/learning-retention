// auth.service.ts — Auth state management
// Currently: localStorage flag. Later: Supabase Auth.

const ONBOARDING_KEY = 'learning_loop_onboarding_completed';

export const authService = {
    hasCompletedOnboarding: (): boolean => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(ONBOARDING_KEY) === 'true';
    },

    completeOnboarding: (): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(ONBOARDING_KEY, 'true');
    },

    resetOnboarding: (): void => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(ONBOARDING_KEY);
    },
};
