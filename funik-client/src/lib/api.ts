import { SERVER_URL } from '@/config';

const TOKEN_KEY = 'funik.token';

// Storage can throw (private mode, blocked site data), so every access is guarded.
export const getToken = (): string | null => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

export const setToken = (token: string | null) => {
    try {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        else localStorage.removeItem(TOKEN_KEY);
    } catch {
        // Login still works for this page load; it just won't survive a refresh.
    }
};

export class ApiError extends Error {
    readonly status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

export async function apiFetch<T>(path: string, options: { method?: string, body?: unknown } = {}): Promise<T> {
    const token = getToken();
    let res: Response;
    try {
        res = await fetch(`${SERVER_URL}${path}`, {
            method: options.method ?? 'GET',
            headers: {
                ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        });
    } catch {
        throw new ApiError(0, "Can't reach the server. It may be waking up, so try again in a moment.");
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new ApiError(res.status, data.error ?? 'Something went wrong.');
    }
    return data as T;
}

export type UserStats = {
    played: number
    wins: number
    losses: number
    draws: number
}

export type PublicUser = {
    id: string
    username: string
    stats: UserStats
    createdAt: string
}
