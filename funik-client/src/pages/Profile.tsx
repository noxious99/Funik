import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/auth/auth_context';
import type { PublicUser } from '@/lib/api';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import StatusPanel from '@/common-components/StatusPanel';
import NotFound from './NotFound';
import { GAME_MODE_INFO, type GameMode } from '@/features/tic_tac_toe/types';
import { MATCH_GAME_NAMES } from '@/utils/const';

type MatchSummary = {
    id: string
    game: string
    mode: GameMode
    symbol: 'X' | 'O' | null
    opponent: string
    outcome: 'win' | 'loss' | 'draw'
    playedAt: string
}

type ProfileResponse = {
    user: PublicUser & { winRate: number }
    matches: MatchSummary[]
}

const OUTCOME_STYLES: Record<MatchSummary['outcome'], { label: string, className: string }> = {
    win: { label: 'Win', className: 'bg-success/15 text-success' },
    loss: { label: 'Loss', className: 'bg-error/15 text-error' },
    draw: { label: 'Draw', className: 'bg-muted text-muted-foreground' },
};

const dateFormatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const joinedFormatter = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });

const StatTile: React.FC<{ label: string, value: string | number, highlight?: boolean }> = ({ label, value, highlight }) => (
    <div className={cn('flex flex-col gap-1 rounded-xl border bg-card/80 p-3 sm:p-4', highlight && 'border-primary/60')}>
        <span className='text-[11px] tracking-wider text-muted-foreground uppercase'>{label}</span>
        <span className={cn('text-2xl font-bold tabular-nums sm:text-3xl', highlight && 'text-primary')}>{value}</span>
    </div>
);

const Profile: React.FC = () => {
    const { username = '' } = useParams();
    const { user: me } = useAuth();
    const { data, error, loading, reload } = useApi<ProfileResponse>(`/api/users/${encodeURIComponent(username)}`);

    if (error?.status === 404) {
        return <NotFound />;
    }
    if (loading && !data) {
        return <div className='mx-auto max-w-2xl'><StatusPanel message='Loading profile…' /></div>;
    }
    if (error || !data) {
        return <div className='mx-auto max-w-2xl'><StatusPanel message={error?.message ?? 'Something went wrong.'} onRetry={reload} /></div>;
    }

    const { user, matches } = data;
    const isMe = me?.id === user.id;

    return (
        <div className='mx-auto flex w-full max-w-2xl flex-col gap-6'>
            <header className='flex items-center gap-4'>
                <span className='grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary font-display text-2xl font-black uppercase shadow-[0_0_24px_-6px_var(--primary)] sm:size-16'>
                    {user.username[0]}
                </span>
                <div className='min-w-0'>
                    <h1 className='truncate text-xl font-black tracking-wide sm:text-2xl'>{user.username}</h1>
                    <p className='text-sm text-muted-foreground'>
                        {isMe ? 'Your profile · ' : ''}Joined {joinedFormatter.format(new Date(user.createdAt))}
                    </p>
                </div>
            </header>

            <section aria-label='Stats' className='grid grid-cols-2 gap-3 sm:grid-cols-5'>
                <StatTile label='Played' value={user.stats.played} />
                <StatTile label='Wins' value={user.stats.wins} />
                <StatTile label='Losses' value={user.stats.losses} />
                <StatTile label='Draws' value={user.stats.draws} />
                <div className='col-span-2 sm:col-span-1'>
                    <StatTile label='Win rate' value={`${user.winRate}%`} highlight />
                </div>
            </section>

            <section className='flex flex-col gap-3'>
                <h2 className='text-sm font-bold tracking-wider uppercase'>Recent matches</h2>
                {matches.length === 0 ? (
                    <div className='flex flex-col items-center gap-4 rounded-2xl border bg-card/60 p-8 text-center text-sm text-muted-foreground'>
                        <p>{isMe ? "You haven't played a ranked match yet." : 'No ranked matches yet.'}</p>
                        {isMe && (
                            <Link to='/' className={buttonVariants({ size: 'sm' })}>
                                Pick a game
                            </Link>
                        )}
                    </div>
                ) : (
                    <ul className='overflow-hidden rounded-2xl border bg-card/80'>
                        {matches.map((match) => {
                            const outcome = OUTCOME_STYLES[match.outcome];
                            return (
                                <li key={match.id} className='flex items-center gap-3 border-b border-border/40 px-4 py-3 last:border-b-0'>
                                    <span className={cn('w-14 shrink-0 rounded-full py-1 text-center text-xs font-bold', outcome.className)}>
                                        {outcome.label}
                                    </span>
                                    <div className='min-w-0 flex-1'>
                                        <p className='truncate text-sm'>
                                            vs{' '}
                                            <Link to={`/u/${match.opponent}`} className='font-semibold hover:text-primary hover:underline'>
                                                {match.opponent}
                                            </Link>
                                        </p>
                                        <p className='text-xs text-muted-foreground'>
                                            {MATCH_GAME_NAMES[match.game] ?? match.game}
                                            {match.game === 'tic_tac_toe' && ` · ${GAME_MODE_INFO[match.mode]?.label ?? match.mode}`}
                                            {match.symbol && (
                                                <> · as <span className={cn('font-bold', match.symbol === 'X' ? 'text-player-x' : 'text-player-o')}>{match.symbol}</span></>
                                            )}
                                        </p>
                                    </div>
                                    <time dateTime={match.playedAt} className='shrink-0 text-xs text-muted-foreground'>
                                        {dateFormatter.format(new Date(match.playedAt))}
                                    </time>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default Profile;
