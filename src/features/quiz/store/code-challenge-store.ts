import { QuizQuestion } from '@/src/types';

let challengeQuestions: any[] | null = null;

export const codeChallengeStore = {
    setQuestions: (questions: any[]) => {
        challengeQuestions = questions;
    },
    getQuestions: () => {
        return challengeQuestions;
    },
    clear: () => {
        challengeQuestions = null;
    }
};
