import React, { useEffect, useState } from 'react'
import { socket } from '@/socket'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSocketConnected } from '@/hooks/useSocketConnected'
import { GAME_KEYS } from '@/utils/const'
import InviteButton from '@/common-components/InviteButton'
import CasualNotice from '@/common-components/CasualNotice'
import { IoExitOutline, IoReloadCircleOutline, IoCheckmarkCircle, IoCreateOutline } from 'react-icons/io5'
import PlacementBoard from './PlacementBoard'
import BattleGrid from './BattleGrid'
import { FLEET, findShipAt, isShipSunk, shipName, type PlacedShip, type Shot } from './fleet'
import type { BattleshipView } from './types'

const COLUMN_LABELS = 'ABCDEFGHIJ'
const coordinate = (shot: Shot) => `${COLUMN_LABELS[shot.col]}${shot.row + 1}`

type PlayerCardProps = {
    label: string
    score: number
    present: boolean
    active: boolean
    detail: string
}

const PlayerCard: React.FC<PlayerCardProps> = ({ label, score, present, active, detail }) => (
    <div
        className={cn(
            'flex items-center gap-3 rounded-xl border bg-card/70 p-2.5 transition sm:p-3',
            active && 'border-player-o shadow-[0_0_18px_-6px_var(--player-o)]',
            !present && 'opacity-50'
        )}
    >
        <div className='min-w-0 flex-1'>
            <p className='truncate text-xs text-muted-foreground'>{present ? label : 'Waiting…'}</p>
            <p className='truncate text-[11px] text-muted-foreground/80'>{present ? detail : ' '}</p>
        </div>
        <p className='text-2xl leading-none font-bold tabular-nums'>{score}</p>
    </div>
)

/** Ship-by-ship status, struck through once sunk. */
const FleetTracker: React.FC<{ title: string, fleet: PlacedShip[] | null, shots: Shot[], sunkIds?: Set<string> }> = ({ title, fleet, shots, sunkIds }) => (
    <div className='flex flex-col gap-2'>
        <p className='text-[11px] tracking-wider text-muted-foreground uppercase'>{title}</p>
        <ul className='flex flex-wrap gap-1.5'>
            {FLEET.map(({ id, name, size }) => {
                const ship = fleet?.find((s) => s.id === id)
                const sunk = sunkIds ? sunkIds.has(id) : Boolean(ship && isShipSunk(ship, shots))
                return (
                    <li
                        key={id}
                        className={cn(
                            'flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px]',
                            sunk ? 'border-error/40 text-error line-through opacity-70' : 'border-border'
                        )}
                    >
                        {name}
                        <span className='flex gap-0.5' aria-hidden>
                            {Array.from({ length: size }, (_, i) => (
                                <span key={i} className={cn('size-1.5 rounded-full', sunk ? 'bg-error/60' : 'bg-player-o/70')} />
                            ))}
                        </span>
                    </li>
                )
            })}
        </ul>
    </div>
)

type BattleshipProps = {
    roomId: string
    onLeave: () => void
}

const Battleship: React.FC<BattleshipProps> = ({ roomId, onLeave }) => {
    const connected = useSocketConnected()
    const [view, setView] = useState<BattleshipView | null>(null)
    const [roomFull, setRoomFull] = useState(false)
    const [error, setError] = useState('')
    // Kept across rematches so the last layout can be reused.
    const [localFleet, setLocalFleet] = useState<PlacedShip[]>([])
    // Locks the enemy grid between firing and the server's answer, so a double tap can't send two shots.
    const [shotPending, setShotPending] = useState(false)

    useEffect(() => {
        const handleState = (state: BattleshipView) => {
            setView(state)
            setError('')
            setShotPending(false)
            if (state.myFleet) setLocalFleet(state.myFleet)
        }
        const handleRoomFull = () => setRoomFull(true)
        const handleError = (message: string) => setError(message)
        // Re-join after a reconnect, since the server drops us from the room on disconnect.
        const joinRoom = () => socket.emit('bs_join', roomId)

        socket.on('bs_state', handleState)
        socket.on('bs_room_full', handleRoomFull)
        socket.on('bs_error', handleError)
        socket.on('connect', joinRoom)
        joinRoom()

        return () => {
            socket.off('bs_state', handleState)
            socket.off('bs_room_full', handleRoomFull)
            socket.off('bs_error', handleError)
            socket.off('connect', joinRoom)
            socket.emit('bs_leave', roomId)
        }
    }, [roomId])

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

    const players = view?.players ?? []
    const you = view?.you ?? 0
    const me = players[you]
    const enemy = players[1 - you]
    const waitingForOpponent = players.length < 2
    const phase = view?.phase ?? 'placing'
    const myReady = Boolean(me?.ready)
    const isMyTurn = phase === 'battle' && view?.turn === you
    const myShots = view?.myShots ?? []
    const enemyShots = view?.enemyShots ?? []
    const revealed = view?.revealedEnemyShips ?? []
    const myFleet = view?.myFleet ?? localFleet
    const enemySunk = revealed.filter((ship) => isShipSunk(ship, myShots))
    const enemySunkIds = new Set<string>(enemySunk.map((ship) => ship.id))
    const fleetComplete = localFleet.length === FLEET.length

    const handleReady = () => socket.emit('bs_place', roomId, localFleet)
    const handleEditFleet = () => socket.emit('bs_unready', roomId)
    const handleFire = (row: number, col: number) => {
        if (!isMyTurn || !connected || shotPending) return
        setShotPending(true)
        socket.emit('bs_fire', roomId, row, col)
    }
    const handleRematch = () => socket.emit('bs_rematch', roomId)

    // Narrates the most recent shot, whoever fired it.
    let lastEvent = ''
    if (phase === 'battle') {
        const enemyLast = enemyShots[enemyShots.length - 1]
        const myLast = myShots[myShots.length - 1]
        if (isMyTurn && enemyLast) {
            const ship = enemyLast.hit ? findShipAt(myFleet, enemyLast.row, enemyLast.col) : undefined
            lastEvent = !ship
                ? `Enemy missed at ${coordinate(enemyLast)}.`
                : isShipSunk(ship, enemyShots)
                    ? `Enemy sank your ${shipName(ship.id)}!`
                    : `Enemy hit your ${shipName(ship.id)} at ${coordinate(enemyLast)}!`
        } else if (!isMyTurn && myLast) {
            const sunkShip = myLast.hit ? findShipAt(enemySunk, myLast.row, myLast.col) : undefined
            lastEvent = !myLast.hit
                ? `Miss at ${coordinate(myLast)}.`
                : sunkShip ? `You sank their ${shipName(sunkShip.id)}!` : `Hit at ${coordinate(myLast)}!`
        }
    }

    let status: { text: string, tone: 'muted' | 'primary' | 'win' | 'lose' }
    if (!connected) {
        status = { text: 'Connecting to server… (this can take a moment)', tone: 'muted' }
    } else if (!view) {
        status = { text: 'Joining room…', tone: 'muted' }
    } else if (phase === 'placing') {
        if (myReady) {
            status = { text: waitingForOpponent ? 'Fleet ready. Waiting for an opponent to join…' : 'Fleet ready. Waiting for opponent to deploy…', tone: 'muted' }
        } else if (waitingForOpponent) {
            status = { text: 'Deploy your fleet while you wait for an opponent.', tone: 'primary' }
        } else {
            status = { text: enemy?.ready ? 'Opponent is ready! Deploy your fleet.' : 'Deploy your fleet.', tone: 'primary' }
        }
    } else if (phase === 'finished') {
        status = view.winner === you
            ? { text: 'Victory! You sank the enemy fleet 🏆', tone: 'win' }
            : { text: 'Defeat. Your fleet was sunk.', tone: 'lose' }
    } else {
        status = isMyTurn
            ? { text: 'Your turn: fire at enemy waters', tone: 'primary' }
            : { text: 'Enemy is aiming…', tone: 'muted' }
    }

    const cardDetail = (ready: boolean, mine: boolean) => {
        if (phase === 'placing') return ready ? 'Ready' : 'Deploying…'
        if (phase === 'finished') return ''
        const sunkCount = mine
            ? (view?.myFleet ?? []).filter((ship) => isShipSunk(ship, enemyShots)).length
            : enemySunk.length
        return `${FLEET.length - sunkCount}/${FLEET.length} ships afloat`
    }

    const header = (
        <>
            <div className='flex items-center justify-between gap-3'>
                <div className='min-w-0'>
                    <p className='flex items-center gap-2 text-[11px] tracking-wider text-muted-foreground uppercase'>
                        Room · Battle Ship
                        {!waitingForOpponent && (
                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', view?.ranked ? 'bg-warning/15 text-warning' : 'bg-muted/50')}>
                                {view?.ranked ? 'Ranked' : 'Casual'}
                            </span>
                        )}
                    </p>
                    <p className='truncate font-display text-xl font-bold tracking-widest'>{roomId}</p>
                </div>
                <InviteButton gameKey={GAME_KEYS.BATTLESHIP} gameTitle='Battle Ship' roomId={roomId} />
            </div>

            <div className='grid grid-cols-2 gap-2'>
                <PlayerCard
                    label={me?.username ? `You · ${me.username}` : 'You (guest)'}
                    score={view?.scores[you as 0 | 1] ?? 0}
                    present
                    active={isMyTurn}
                    detail={cardDetail(myReady, true)}
                />
                <PlayerCard
                    label={enemy?.username ?? 'Guest'}
                    score={view?.scores[(1 - you) as 0 | 1] ?? 0}
                    present={!waitingForOpponent}
                    active={phase === 'battle' && !isMyTurn}
                    detail={cardDetail(Boolean(enemy?.ready), false)}
                />
            </div>

            <div className='flex flex-col gap-1'>
                <p
                    role='status'
                    aria-live='polite'
                    className={cn(
                        'rounded-full px-4 py-2 text-center text-sm font-semibold',
                        status.tone === 'muted' && 'bg-muted/40 text-muted-foreground',
                        status.tone === 'primary' && 'bg-player-o/15 text-player-o',
                        status.tone === 'win' && 'bg-success/15 text-success',
                        status.tone === 'lose' && 'bg-error/15 text-error',
                    )}
                >
                    {status.text}
                </p>
                {lastEvent && <p aria-live='polite' className='text-center text-xs text-muted-foreground'>{lastEvent}</p>}
            </div>

            {!waitingForOpponent && view && !view.ranked && <CasualNotice opponentUserId={enemy?.userId} />}
            {error && <p role='alert' className='rounded-md bg-error/15 px-3 py-2 text-center text-sm text-error'>{error}</p>}
        </>
    )

    if (phase === 'placing') {
        return (
            <div className='mx-auto flex w-full max-w-md flex-col gap-4 sm:gap-5'>
                {header}
                <div>
                    <h2 className='text-sm font-bold tracking-wider uppercase'>Deploy your fleet</h2>
                    <p className='mt-1 text-xs text-muted-foreground'>
                        Drag ships onto the grid. Tap a placed ship to rotate it, or tap a docked ship to drop it in the first free spot.
                    </p>
                </div>
                <PlacementBoard fleet={localFleet} onChange={setLocalFleet} locked={myReady} />
                <div className='flex flex-col gap-2 sm:flex-row'>
                    {myReady ? (
                        <Button size='lg' variant='secondary' className='sm:flex-1' onClick={handleEditFleet} disabled={!connected}>
                            <IoCreateOutline /> Edit fleet
                        </Button>
                    ) : (
                        <Button size='lg' className='sm:flex-1' onClick={handleReady} disabled={!connected || !view || !fleetComplete}>
                            <IoCheckmarkCircle />
                            {fleetComplete ? 'Ready for battle' : `Place ${FLEET.length - localFleet.length} more ship${FLEET.length - localFleet.length === 1 ? '' : 's'}`}
                        </Button>
                    )}
                    <Button size='lg' variant='outline' className='sm:flex-1' onClick={onLeave}>
                        <IoExitOutline /> Leave room
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className='mx-auto flex w-full max-w-md flex-col gap-4 sm:gap-5 lg:max-w-4xl'>
            {header}

            <div className='grid gap-6 lg:grid-cols-2 lg:items-start'>
                <section className='flex flex-col gap-3'>
                    <h2 className='text-sm font-bold tracking-wider uppercase'>Enemy waters</h2>
                    <BattleGrid
                        label='Enemy waters'
                        ships={revealed}
                        shipTone='own'
                        sunkShips={enemySunk}
                        shots={myShots}
                        onFire={isMyTurn && connected && !shotPending ? handleFire : undefined}
                        className={cn('transition-shadow', isMyTurn && 'border-player-o shadow-[0_0_28px_-10px_var(--player-o)]')}
                    />
                    <FleetTracker title='Enemy fleet' fleet={revealed} shots={myShots} sunkIds={enemySunkIds} />
                </section>

                <section className='flex flex-col gap-3'>
                    <h2 className='text-sm font-bold tracking-wider uppercase'>Your fleet</h2>
                    <BattleGrid
                        label='Your fleet'
                        ships={myFleet}
                        shipTone='own'
                        sunkShips={myFleet.filter((ship) => isShipSunk(ship, enemyShots))}
                        shots={enemyShots}
                        className='mx-auto w-full max-w-[280px] lg:max-w-none'
                    />
                    <FleetTracker title='Your ships' fleet={myFleet} shots={enemyShots} />
                </section>
            </div>

            <div className='mx-auto flex w-full max-w-md flex-col gap-2 sm:flex-row'>
                {phase === 'finished' && (
                    <Button size='lg' className='sm:flex-1' onClick={handleRematch} disabled={!connected || waitingForOpponent}>
                        <IoReloadCircleOutline /> Rematch
                    </Button>
                )}
                <Button size='lg' variant='outline' className='sm:flex-1' onClick={onLeave}>
                    <IoExitOutline /> Leave room
                </Button>
            </div>
        </div>
    )
}

export default Battleship
