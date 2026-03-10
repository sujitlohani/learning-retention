'use client';

import { useState, useEffect, useCallback } from 'react';
import { XPTransaction, XPEarnEvent } from '../types';
import { xpService } from '../services/xp.service';

export function useXP() {
    const [balance, setBalance] = useState<number>(0);
    const [history, setHistory] = useState<XPTransaction[]>([]);

    const loadXP = useCallback(() => {
        setBalance(xpService.getBalance());
        setHistory(xpService.getHistory());
    }, []);

    useEffect(() => {
        loadXP();

        // Listen for storage events to sync across tabs/components
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'xp_balance_v1' || e.key === 'xp_history_v1') {
                loadXP();
            }
        };

        // Custom event for same-tab updates
        const handleLocalUpdate = () => loadXP();

        window.addEventListener('storage', handleStorage);
        window.addEventListener('xp_updated', handleLocalUpdate);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('xp_updated', handleLocalUpdate);
        };
    }, [loadXP]);

    const earn = useCallback((event: XPEarnEvent) => {
        xpService.earn(event);
        window.dispatchEvent(new Event('xp_updated')); // Trigger local sync
        loadXP();
    }, [loadXP]);

    const spend = useCallback((amount: number): boolean => {
        const success = xpService.spend(amount);
        if (success) {
            window.dispatchEvent(new Event('xp_updated')); // Trigger local sync
            loadXP();
        }
        return success;
    }, [loadXP]);

    const canAfford = useCallback((amount: number): boolean => {
        return xpService.canAfford(amount);
    }, []);

    return {
        balance,
        history,
        earn,
        spend,
        canAfford
    };
}
