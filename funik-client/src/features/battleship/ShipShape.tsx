import React from 'react'
import { cn } from '@/lib/utils'
import { shipSize, type Orientation, type ShipId } from './fleet'

type ShipShapeProps = {
    id: ShipId
    orientation: Orientation
    cellSize: number
    tone?: 'own' | 'sunk' | 'invalid'
    className?: string
}

/** A ship drawn as a hull spanning `size` cells, with a turret per segment. */
const ShipShape: React.FC<ShipShapeProps> = ({ id, orientation, cellSize, tone = 'own', className }) => {
    const size = shipSize(id)
    const horizontal = orientation === 'h'
    const inset = Math.max(2, cellSize * 0.1)

    return (
        <div
            className={cn('relative', className)}
            style={{ width: (horizontal ? size : 1) * cellSize, height: (horizontal ? 1 : size) * cellSize }}
        >
            <div
                className={cn(
                    'absolute flex items-center justify-around rounded-full border-2 transition-colors',
                    horizontal ? 'flex-row' : 'flex-col',
                    tone === 'own' && 'border-player-o/80 bg-gradient-to-br from-accent to-secondary/80 shadow-[0_0_14px_-4px_var(--player-o)]',
                    tone === 'sunk' && 'border-error/70 bg-error/25',
                    tone === 'invalid' && 'border-error bg-error/40',
                )}
                style={{ inset }}
            >
                {Array.from({ length: size }, (_, i) => (
                    <span
                        key={i}
                        className={cn('rounded-full', tone === 'sunk' ? 'bg-error/50' : 'bg-foreground/70')}
                        style={{ width: cellSize * 0.22, height: cellSize * 0.22 }}
                    />
                ))}
            </div>
        </div>
    )
}

export default ShipShape
