import { createContext, useContext } from 'react';
import type { PublicUser } from '@/lib/api';

export type AuthContextValue = {
    user: PublicUser | null
    /** True while a saved login is being checked with the server on page load. */
    loading: boolean
    login: (username: string, password: string) => Promise<void>
    register: (username: string, password: string) => Promise<void>
    logout: () => void
    /** Re-fetches the current user (e.g. to pick up new stats). */
    refresh: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
    const value = useContext(AuthContext);
    if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
    return value;
};
