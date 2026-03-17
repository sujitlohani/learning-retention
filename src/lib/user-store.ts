// src/lib/user-store.ts
let currentUserId = 'anonymous';

export const setUserId = (id: string) => {
    currentUserId = id;
};

export const getUserId = () => currentUserId;
