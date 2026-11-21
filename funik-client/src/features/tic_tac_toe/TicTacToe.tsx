import React, { useState, useEffect } from 'react'
import { socket } from '../../socket'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSocketConnected } from '@/hooks/useSocketConnected'
import { GAME_KEYS } from '@/utils/const'
import { IoReloadCircleOutline, IoExitOutline } from "react-icons/io5";
import InviteButton from '@/common-components/InviteButton'
import CasualNotice from '@/common-components/CasualNotice'
import Mark from './Mark'
import ModeSelector from './ModeSelector'
import { GAME_MODE_INFO, VANISHING_MAX_MARKS, type GameMode, type RoomState } from './types'

const SYMBOLS = ["X", "O"] as const;

const createEmptyBoard = (): string[][] => [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
];

const isSamePosition = (a: readonly number[] | undefined, row: number, col: number) =>
    !!a && a[0] === row && a[1] === col;

type PlayerCardProps = {
    label: string
    symbol: string
    score: number
    active: boolean
    present: boolean
}

const PlayerCard: React.FC<PlayerCardProps> = ({ label, symbol, score, active, present }) => (
    <div
        className={cn(
            'flex items-center gap-3 rounded-xl border bg-card/70 p-2.5 transition sm:p-3',
            active && symbol === "X" && 'border-player-x shadow-[0_0_18px_-6px_var(--player-x)]',
            active && symbol === "O" && 'border-player-o shadow-[0_0_18px_-6px_var(--player-o)]',
            !present && 'opacity-50'
        )}
    >
        <Mark symbol={symbol} className='size-8 shrink-0 sm:size-9' />
        <div className='min-w-0 flex-1'>
            <p className='truncate text-xs text-muted-foreground'>{present ? label : 'Waiting…'}</p>
            <p className='text-2xl leading-none font-bold tabular-nums'>{score}</p>
        </div>
    </div>
)

type TicTacToeProps = {
    roomId: string
    /** Mode to create the room with if it doesn't exist yet. */
    initialMode: GameMode
    onLeave: () => void
}

const TicTacToe: React.FC<TicTacToeProps> = ({ roomId, initialMode, onLeave }) => {
    const connected = useSocketConnected()
    const [room, setRoom] = useState<RoomState | null>(null)
    const [roomFull, setRoomFull] = useState(false)

    useEffect(() => {
        const handleRoomState = (state: RoomState) => setRoom(state)
        const handleRoomFull = () => setRoomFull(true)
        // Re-join after a reconnect, since the server drops us from the room on disconnect.
        const joinRoom = () => socket.emit("join_game_one", roomId, initialMode)

        socket.on("room_state", handleRoomState)
        socket.on("room_full", handleRoomFull)
        socket.on("connect", joinRoom)
        joinRoom()

        return () => {
            socket.off("room_state", handleRoomState)
            socket.off("room_full", handleRoomFull)
            socket.off("connect", joinRoom)
            socket.emit("leave_game", roomId)
        }
    }, [roomId, initialMode])

    if (roomFull) {
        return (
            <div className='mx-auto flex max-w-sm flex-col items-center gap-4 rounded-2xl border bg-card/80 p-6 text-center'>
                <h2 className='text-lg font-bold'>Room is full</h2>
                <p className='text-sm text-muted-foreground'>
                    Room <span className='font-display font-bold text-foreground'>{roomId}</span> already has two players.
                </p>
                <Button onClick={onLeave}>Back to lobby</Button>
            </div>
        )
    }

    const players = room?.players ?? []
    const board = room?.board ?? createEmptyBoard()
    const mode = room?.mode ?? initialMode
    const winner = room?.winner ?? null
    const myIndex = players.findIndex((p) => p.id === socket.id)
    const opponentIndex = myIndex === 0 ? 1 : 0
    const mySymbol = SYMBOLS[myIndex] ?? "X"
    const opponentSymbol = SYMBOLS[opponentIndex]
    const me = players[myIndex]
    const opponent = players[opponentIndex]
    const ranked = room?.ranked ?? false
    const waitingForOpponent = players.length < 2
    const isMyTurn = !!room && room.turn === myIndex
    const canPlay = connected && !!room && !winner && !waitingForOpponent && isMyTurn
    const roundInProgress = !winner && !!room && room.moves.some((m) => m.length > 0)

    // In Vanishing mode, the current player's oldest mark disappears on their next move.
    const currentMoves = room?.moves[room.turn as 0 | 1] ?? []
    const vanishingNext = mode === "vanishing" && !winner && currentMoves.length >= VANISHING_MAX_MARKS
        ? currentMoves[0]
        : undefined

    const handleCellClick = (row: number, col: number) => {
        if (!canPlay || board[row][col]) return
        socket.emit("player_move", roomId, row, col)
    }

    const handleNextRound = () => socket.emit("reset_game", roomId)
    const handleModeChange = (newMode: GameMode) => socket.emit("set_mode", roomId, newMode)

    let status: { text: string, tone: 'muted' | 'primary' | 'win' | 'lose' }
    if (!connected) {
        status = { text: "Connecting to server… (this can take a moment)", tone: 'muted' }
    } else if (!room) {
        status = { text: "Joining room…", tone: 'muted' }
    } else if (waitingForOpponent) {
        status = { text: "Waiting for a friend to join. Send them the invite!", tone: 'muted' }
    } else if (winner === "draw") {
        status = { text: "It's a draw!", tone: 'muted' }
    } else if (winner) {
        status = winner === mySymbol
            ? { text: "You win! 🏆", tone: 'win' }
            : { text: "Opponent wins this round", tone: 'lose' }
    } else {
        status = isMyTurn
            ? { text: "Your turn", tone: 'primary' }
            : { text: "Opponent is thinking…", tone: 'muted' }
    }

    return (
        <div className='mx-auto flex w-full max-w-md flex-col gap-4 sm:gap-5'>
            {/* Room header */}
            <div className='flex items-center justify-between gap-3'>
                <div className='min-w-0'>
                    <p className='flex items-center gap-2 text-[11px] tracking-wider text-muted-foreground uppercase'>
                        Room · {GAME_MODE_INFO[mode].label}
                        {!waitingForOpponent && (
                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', ranked ? 'bg-warning/15 text-warning' : 'bg-muted/50')}>
                                {ranked ? 'Ranked' : 'Casual'}
                            </span>
                        )}
                    </p>
                    <p className='truncate font-display text-xl font-bold tracking-widest'>{roomId}</p>
                </div>
                <InviteButton gameKey={GAME_KEYS.TIC_TAC_TOE} gameTitle='Tic-Tac-Toe' roomId={roomId} />
            </div>

            {/* Scoreboard */}
            <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-2'>
                <PlayerCard
                    label={me?.username ? `You · ${me.username}` : 'You (guest)'}
                    symbol={mySymbol}
                    score={room?.scores[myIndex as 0 | 1] ?? 0}
                    active={!!room && !winner && !waitingForOpponent && isMyTurn}
                    present
                />
                <div className='px-1 text-center'>
                    <p className='text-[10px] tracking-wider text-muted-foreground uppercase'>Draws</p>
                    <p className='text-lg font-bold tabular-nums'>{room?.draws ?? 0}</p>
                </div>
                <PlayerCard
                    label={opponent?.username ?? 'Guest'}
                    symbol={opponentSymbol}
                    score={room?.scores[opponentIndex] ?? 0}
                    active={!!room && !winner && !waitingForOpponent && !isMyTurn}
                    present={!waitingForOpponent}
                />
            </div>

            {/* Status */}
            <p
                role='status'
                aria-live='polite'
                className={cn(
                    'rounded-full px-4 py-2 text-center text-sm font-semibold',
                    status.tone === 'muted' && 'bg-muted/40 text-muted-foreground',
                    status.tone === 'primary' && (mySymbol === "X" ? 'bg-player-x/15 text-player-x' : 'bg-player-o/15 text-player-o'),
                    status.tone === 'win' && 'bg-success/15 text-success',
                    status.tone === 'lose' && 'bg-error/15 text-error',
                )}
            >
                {status.text}
            </p>

            {!waitingForOpponent && !ranked && <CasualNotice opponentUserId={opponent?.userId} />}

            {/* Board */}
            <div className='grid aspect-square w-full grid-cols-3 gap-2 rounded-3xl border bg-card/50 p-2 sm:gap-3 sm:p-3'>
                {board.map((row, rowIndex) => row.map((cell, colIndex) => {
                    const isWinningCell = room?.winningLine?.some((p) => isSamePosition(p, rowIndex, colIndex)) ?? false
                    const willVanish = isSamePosition(vanishingNext, rowIndex, colIndex)
                    const clickable = canPlay && !cell
                    return (
                        <button
                            key={`${rowIndex}-${colIndex}`}
                            type='button'
                            aria-label={`Row ${rowIndex + 1}, column ${colIndex + 1}${cell ? `: ${cell}` : ''}${willVanish ? ' (vanishing next)' : ''}`}
                            disabled={!clickable}
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                            className={cn(
                                'group relative grid aspect-square place-items-center rounded-2xl border border-accent/70 bg-background/80 transition',
                                clickable && 'cursor-pointer hover:border-primary hover:bg-primary/10 active:scale-95',
                                isWinningCell && (winner === "X" ? 'animate-win-pulse border-player-x bg-player-x/15' : 'animate-win-pulse border-player-o bg-player-o/15'),
                                winner && !isWinningCell && cell && 'opacity-40',
                            )}
                        >
                            {cell ? (
                                <Mark symbol={cell} className={cn('size-3/4 transition-opacity', willVanish && 'animate-pulse opacity-35')} />
                            ) : clickable && (
                                // Ghost preview of your mark on hover (pointer devices only).
                                <Mark symbol={mySymbol} className='size-3/4 opacity-0 transition-opacity group-hover:opacity-25' />
                            )}
                        </button>
                    )
                }))}
            </div>

            {mode === "vanishing" && !winner && (
                <p className='text-center text-xs text-muted-foreground'>
                    Each player keeps {VANISHING_MAX_MARKS} marks. The faded one disappears on the next move.
                </p>
            )}

            {/* Actions */}
            <div className='flex flex-col gap-2 sm:flex-row'>
                <Button
                    size='lg'
                    onClick={handleNextRound}
                    disabled={!connected || waitingForOpponent || (!winner && !roundInProgress)}
                    className={cn('sm:flex-1', !winner && 'bg-secondary hover:bg-secondary/80')}
                >
                    <IoReloadCircleOutline />
                    {winner ? 'Play next round' : 'Restart round'}
                </Button>
                <Button size='lg' variant='outline' onClick={onLeave} className='sm:flex-1'>
                    <IoExitOutline />
                    Leave room
                </Button>
            </div>

            {!roundInProgress && room && (
                <div className='flex flex-col gap-2'>
                    <p className='text-xs text-muted-foreground'>Game mode (can be changed between rounds)</p>
                    <ModeSelector value={mode} onChange={handleModeChange} disabled={!connected} />
                </div>
            )}
        </div>
    )
}

export default TicTacToe
