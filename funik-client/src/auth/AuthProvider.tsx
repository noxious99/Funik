import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, apiFetch, getToken, setToken, type PublicUser } from '@/lib/api';
import { reconnectSocket } from '@/socket';
import { AuthContext, type AuthContextValue } from './auth_context';

type AuthResponse = { token: string, user: PublicUser };

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<PublicUser | null>(null);
    const [loading, setLoading] = useState(() => Boolean(getToken()));

    const refresh = useCallback(async () => {
        if (!getToken()) return;
        try {
            const { user } = await apiFetch<{ user: PublicUser }>('/api/auth/me');
            setUser(user);
        } catch (err) {
            // Only a rejected token logs you out; a sleeping server shouldn't.
            if (err instanceof ApiError && err.status === 401) {
                setToken(null);
                setUser(null);
                reconnectSocket();
            }
        }
    }, []);

    useEffect(() => {
        refresh().finally(() => setLoading(false));
    }, [refresh]);

    const startSession = useCallback(({ token, user }: AuthResponse) => {
        setToken(token);
        setUser(user);
        reconnectSocket();
    }, []);

    const value = useMemo<AuthContextValue>(() => ({
        user,
        loading,
        refresh,
        login: async (username, password) => {
            startSession(await apiFetch<AuthResponse>('/api/auth/login', { method: 'POST', body: { username, password } }));
        },
        register: async (username, password) => {
            startSession(await apiFetch<AuthResponse>('/api/auth/register', { method: 'POST', body: { username, password } }));
        },
        logout: () => {
            setToken(null);
            setUser(null);
            reconnectSocket();
        },
    }), [user, loading, refresh, startSession]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
