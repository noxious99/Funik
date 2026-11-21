import React, { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/auth/auth_context';
import { ApiError } from '@/lib/api';

type AuthMode = 'login' | 'register';

const inputClass = 'h-11 w-full rounded-md border border-input bg-background/60 px-3 text-base placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none';

/** Only allow redirecting back into this app, never to another site. */
const safeRedirect = (next: string | null) => (next && next.startsWith('/') && !next.startsWith('//') ? next : '/');

const Auth: React.FC = () => {
    const { user, login, register } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectTo = safeRedirect(searchParams.get('next'));

    const [mode, setMode] = useState<AuthMode>(searchParams.get('mode') === 'register' ? 'register' : 'login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (user && !submitting) {
        return <Navigate to={redirectTo} replace />;
    }

    const switchMode = (next: AuthMode) => {
        setMode(next);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (mode === 'register' && password !== confirmPassword) {
            setError("Passwords don't match.");
            return;
        }

        setSubmitting(true);
        try {
            await (mode === 'login' ? login : register)(username.trim(), password);
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Something went wrong.');
            setSubmitting(false);
        }
    };

    const isRegister = mode === 'register';

    return (
        <div className='mx-auto flex w-full max-w-sm flex-col gap-6'>
            <div className='text-center'>
                <h1 className='text-2xl font-black tracking-wide'>
                    {isRegister ? 'Create account' : 'Welcome back'}
                </h1>
                <p className='mt-2 text-sm text-muted-foreground'>
                    {isRegister
                        ? 'Track your wins and climb the leaderboard.'
                        : 'Log in to keep your stats and rank.'}
                </p>
            </div>

            <div role='tablist' className='grid grid-cols-2 rounded-xl border bg-card/60 p-1'>
                {(['login', 'register'] as const).map((tab) => (
                    <button
                        key={tab}
                        type='button'
                        role='tab'
                        aria-selected={mode === tab}
                        onClick={() => switchMode(tab)}
                        className={cn(
                            'rounded-lg py-2 text-sm font-semibold transition',
                            mode === tab ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {tab === 'login' ? 'Log in' : 'Sign up'}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className='flex flex-col gap-4 rounded-2xl border bg-card/80 p-5 sm:p-6' noValidate>
                <label className='flex flex-col gap-1.5 text-sm font-medium'>
                    Username
                    <input
                        className={inputClass}
                        type='text'
                        autoComplete='username'
                        autoCapitalize='none'
                        spellCheck={false}
                        maxLength={20}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    {isRegister && (
                        <span className='text-xs font-normal text-muted-foreground'>3-20 letters, numbers or underscores.</span>
                    )}
                </label>
                <label className='flex flex-col gap-1.5 text-sm font-medium'>
                    Password
                    <input
                        className={inputClass}
                        type='password'
                        autoComplete={isRegister ? 'new-password' : 'current-password'}
                        maxLength={72}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {isRegister && (
                        <span className='text-xs font-normal text-muted-foreground'>At least 8 characters.</span>
                    )}
                </label>
                {isRegister && (
                    <label className='flex flex-col gap-1.5 text-sm font-medium'>
                        Confirm password
                        <input
                            className={inputClass}
                            type='password'
                            autoComplete='new-password'
                            maxLength={72}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </label>
                )}

                {error && (
                    <p role='alert' className='rounded-md bg-error/15 px-3 py-2 text-sm text-error'>{error}</p>
                )}

                <Button type='submit' size='lg' disabled={submitting || !username.trim() || !password}>
                    {submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}
                </Button>
            </form>

            <p className='text-center text-xs text-muted-foreground'>
                No account needed to play. Guests just don't appear on the leaderboard.
            </p>
        </div>
    );
};

export default Auth;
