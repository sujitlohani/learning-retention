import { XPTransaction, XPEarnEvent } from '../types';

const BALANCE_KEY = 'xp_balance_v1';
const HISTORY_KEY = 'xp_history_v1';

const EARN_AMOUNTS: Record<XPEarnEvent, number> = {
    correct_answer: 5,
    quiz_completed: 20,
    perfect_quiz: 40,
    concept_mastered: 25,
    daily_streak: 10
};

export const xpService = {
    getBalance: (): number => {
        if (typeof window === 'undefined') return 0;
        const bal = localStorage.getItem(BALANCE_KEY);
        return bal ? parseInt(bal, 10) : 0;
    },

    getHistory: (): XPTransaction[] => {
        if (typeof window === 'undefined') return [];
        const hist = localStorage.getItem(HISTORY_KEY);
        return hist ? JSON.parse(hist) : [];
    },

    _saveBalance: (balance: number) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(BALANCE_KEY, balance.toString());
        }
    },

    _saveHistory: (history: XPTransaction[]) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        }
    },

    earn: (event: XPEarnEvent): void => {
        const amount = EARN_AMOUNTS[event];
        if (!amount) return;

        const currentBalance = xpService.getBalance();
        const history = xpService.getHistory();

        const transaction: XPTransaction = {
            id: crypto.randomUUID(),
            type: 'earn',
            amount,
            event,
            timestamp: new Date().toISOString()
        };

        history.push(transaction);
        xpService._saveBalance(currentBalance + amount);
        xpService._saveHistory(history);
    },

    canAfford: (amount: number): boolean => {
        return xpService.getBalance() >= amount;
    },

    spend: (amount: number): boolean => {
        const currentBalance = xpService.getBalance();
        if (currentBalance < amount) return false;

        const history = xpService.getHistory();
        const transaction: XPTransaction = {
            id: crypto.randomUUID(),
            type: 'spend',
            amount,
            timestamp: new Date().toISOString()
        };

        history.push(transaction);
        xpService._saveBalance(currentBalance - amount);
        xpService._saveHistory(history);
        return true;
    }
};
