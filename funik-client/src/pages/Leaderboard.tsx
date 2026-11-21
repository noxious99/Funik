import React from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/auth/auth_context';
import type { PublicUser } from '@/lib/api';
import { cn } from '@/lib/utils';
import StatusPanel from '@/common-components/StatusPanel';
import { IoTrophy } from 'react-icons/io5';

type LeaderboardEntry = PublicUser & { rank: number, winRate: number };

const MEDAL_COLORS = ['text-warning', 'text-zinc-300', 'text-orange-400'];

const Leaderboard: React.FC = () => {
    const { user } = useAuth();
    const { data, error, loading, reload } = useApi<{ players: LeaderboardEntry[] }>('/api/leaderboard');

    return (
        <div className='mx-auto flex w-full max-w-2xl flex-col gap-6'>
            <div className='text-center'>
                <h1 className='text-2xl font-black tracking-wide sm:text-3xl'>
                    <span className='text-gradient'>LEADERBOARD</span>
                </h1>
                <p className='mt-2 text-sm text-muted-foreground'>Top players by wins across all ranked matches.</p>
            </div>

            {loading && !data ? (
                <StatusPanel message='Loading leaderboard…' />
            ) : error ? (
                <StatusPanel message={error.message} onRetry={reload} />
            ) : !data?.players.length ? (
                <StatusPanel message='No ranked matches yet. Log in, invite a friend who has an account, and claim the top spot!' />
            ) : (
                <div className='overflow-hidden rounded-2xl border bg-card/80'>
                    <div className='grid grid-cols-[2.5rem_1fr_3.5rem_3.5rem] gap-2 border-b px-4 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase sm:grid-cols-[3rem_1fr_4rem_4rem_4rem_4rem]'>
                        <span>#</span>
                        <span>Player</span>
                        <span className='text-right'>Wins</span>
                        <span className='hidden text-right sm:block'>Losses</span>
                        <span className='hidden text-right sm:block'>Played</span>
                        <span className='text-right'>Win %</span>
                    </div>
                    <ol>
                        {data.players.map((player) => {
                            const isMe = player.id === user?.id;
                            return (
                                <li key={player.id}>
                                    <Link
                                        to={`/u/${player.username}`}
                                        className={cn(
                                            'grid grid-cols-[2.5rem_1fr_3.5rem_3.5rem] items-center gap-2 border-b border-border/40 px-4 py-3 text-sm transition last:border-b-0 hover:bg-primary/10 sm:grid-cols-[3rem_1fr_4rem_4rem_4rem_4rem]',
                                            isMe && 'bg-primary/10'
                                        )}
                                    >
                                        <span className='flex items-center font-display font-bold'>
                                            {player.rank <= 3
                                                ? <IoTrophy className={cn('size-5', MEDAL_COLORS[player.rank - 1])} aria-label={`Rank ${player.rank}`} />
                                                : player.rank}
                                        </span>
                                        <span className='truncate font-semibold'>
                                            {player.username}
                                            {isMe && <span className='ml-2 text-xs font-normal text-primary'>(you)</span>}
                                        </span>
                                        <span className='text-right font-bold tabular-nums'>{player.stats.wins}</span>
                                        <span className='hidden text-right tabular-nums text-muted-foreground sm:block'>{player.stats.losses}</span>
                                        <span className='hidden text-right tabular-nums text-muted-foreground sm:block'>{player.stats.played}</span>
                                        <span className='text-right tabular-nums'>{player.winRate}%</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
