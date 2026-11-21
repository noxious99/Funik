import { useCallback, useEffect, useState } from 'react';
import { ApiError, apiFetch } from '@/lib/api';

type ApiState<T> = {
    data: T | null
    error: ApiError | null
    loading: boolean
    reload: () => void
}

/** Fetches a GET endpoint on mount and whenever `path` changes. */
export function useApi<T>(path: string): ApiState<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<ApiError | null>(null);
    const [loading, setLoading] = useState(true);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        apiFetch<T>(path)
            .then((result) => { if (!cancelled) setData(result); })
            .catch((err) => { if (!cancelled) setError(err instanceof ApiError ? err : new ApiError(0, 'Something went wrong.')); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [path, attempt]);

    const reload = useCallback(() => setAttempt((n) => n + 1), []);

    return { data, error, loading, reload };
}
