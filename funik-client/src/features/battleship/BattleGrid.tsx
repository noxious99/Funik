import React from 'react'
import { cn } from '@/lib/utils'
import ShipShape from './ShipShape'
import { useCellSize } from './useCellSize'
import { BOARD_SIZE, type PlacedShip, type Shot } from './fleet'

type BattleGridProps = {
    label: string
    ships: PlacedShip[]
    shipTone: 'own' | 'sunk'
    shots: Shot[]
    /** Enables firing: called with the target cell. */
    onFire?: (row: number, col: number) => void
    /** Highlights the cells of these ships as sunk. */
    sunkShips?: PlacedShip[]
    className?: string
}

const COLUMN_LABELS = 'ABCDEFGHIJ'

const BattleGrid: React.FC<BattleGridProps> = ({ label, ships, shipTone, shots, onFire, sunkShips = [], className }) => {
    const { ref, cellSize } = useCellSize<HTMLDivElement>()
    const shotAt = new Map(shots.map((shot) => [`${shot.row},${shot.col}`, shot]))
    const lastShot = shots[shots.length - 1]
    const sunkIds = new Set(sunkShips.map((ship) => ship.id))

    return (
        <div className={cn('rounded-2xl border bg-card/50 p-1.5 sm:p-2', className)}>
            <div ref={ref} role='grid' aria-label={label} className='relative grid aspect-square w-full grid-cols-10 overflow-hidden rounded-xl bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--accent)_30%,transparent),transparent_75%)]'>
                {ships.map((ship) => (
                    <div key={ship.id} className='pointer-events-none absolute' style={{ top: ship.row * cellSize, left: ship.col * cellSize }}>
                        <ShipShape
                            id={ship.id}
                            orientation={ship.orientation}
                            cellSize={cellSize}
                            tone={shipTone === 'sunk' || sunkIds.has(ship.id) ? 'sunk' : 'own'}
                        />
                    </div>
                ))}

                {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
                    const row = Math.floor(index / BOARD_SIZE)
                    const col = index % BOARD_SIZE
                    const shot = shotAt.get(`${row},${col}`)
                    const isLast = lastShot && lastShot.row === row && lastShot.col === col
                    const canFire = Boolean(onFire) && !shot
                    const coordinate = `${COLUMN_LABELS[col]}${row + 1}`

                    return (
                        <button
                            key={index}
                            type='button'
                            role='gridcell'
                            aria-label={`${coordinate}${shot ? (shot.hit ? ', hit' : ', miss') : ''}`}
                            disabled={!canFire}
                            onClick={() => onFire?.(row, col)}
                            className={cn(
                                'relative grid place-items-center border-r border-b border-border/40 transition-colors',
                                canFire && 'cursor-crosshair hover:bg-primary/25',
                                isLast && 'ring-2 ring-warning ring-inset',
                            )}
                        >
                            {shot?.hit && (
                                <span className='relative grid size-[62%] place-items-center'>
                                    {isLast && <span className='absolute inset-0 animate-ping rounded-full bg-error/60' />}
                                    <span className='relative size-full rounded-full bg-error shadow-[0_0_10px_var(--error)]' />
                                    <span className='absolute leading-none font-black text-background' style={{ fontSize: cellSize * 0.32 }}>✕</span>
                                </span>
                            )}
                            {shot && !shot.hit && (
                                <span className='size-[26%] rounded-full bg-player-o/60' />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default BattleGrid
