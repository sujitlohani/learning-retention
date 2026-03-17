// auth.service.ts — Auth state management
// Currently: localStorage flag. Later: Supabase Auth.
// Currently: localStorage flag. Later: Supabase Auth.
import { getUserId } from '@/src/lib/user-store';

const getOnboardingKey = () => `learning_loop_onboarding_completed-${getUserId()}`;

export const authService = {
    hasCompletedOnboarding: (): boolean => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(getOnboardingKey()) === 'true';
    },

    completeOnboarding: (): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(getOnboardingKey(), 'true');
    },

    resetOnboarding: (): void => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(getOnboardingKey());
    },
};
