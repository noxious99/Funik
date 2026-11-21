import React, { useState } from 'react'
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useDraggable,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragMoveEvent,
    type DragStartEvent,
} from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { IoShuffle, IoTrashOutline } from 'react-icons/io5'
import ShipShape from './ShipShape'
import { useCellSize } from './useCellSize'
import {
    BOARD_SIZE,
    FLEET,
    canPlace,
    clampToBoard,
    randomFleet,
    shipCells,
    shipName,
    shipSize,
    type Orientation,
    type PlacedShip,
    type ShipId,
} from './fleet'

type DragData = { id: ShipId, orientation: Orientation }
type Preview = { ship: PlacedShip, valid: boolean }

type PlacementBoardProps = {
    fleet: PlacedShip[]
    onChange: (fleet: PlacedShip[]) => void
    /** Read-only once the player has readied up. */
    locked: boolean
}

const gridBackground: React.CSSProperties = {
    backgroundImage:
        'linear-gradient(to right, color-mix(in oklch, var(--border) 55%, transparent) 1px, transparent 1px),' +
        'linear-gradient(to bottom, color-mix(in oklch, var(--border) 55%, transparent) 1px, transparent 1px)',
    backgroundSize: `${100 / BOARD_SIZE}% ${100 / BOARD_SIZE}%`,
}

/** First free spot for a ship, scanning row by row; used when a docked ship is tapped instead of dragged. */
const findFreeSpot = (id: ShipId, fleet: PlacedShip[]): PlacedShip | null => {
    for (const orientation of ['h', 'v'] as const) {
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const candidate = { id, row, col, orientation }
                if (canPlace(candidate, fleet)) return candidate
            }
        }
    }
    return null
}

type DraggableShipProps = {
    ship: DragData
    cellSize: number
    disabled: boolean
    invalid: boolean
    label: string
    onTap: () => void
    style?: React.CSSProperties
    className?: string
}

const DraggableShip: React.FC<DraggableShipProps> = ({ ship, cellSize, disabled, invalid, label, onTap, style, className }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: ship.id,
        data: ship,
        disabled,
    })

    return (
        <button
            ref={setNodeRef}
            type='button'
            {...attributes}
            {...listeners}
            aria-label={label}
            onClick={onTap}
            disabled={disabled}
            style={style}
            className={cn(
                'touch-none rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60',
                !disabled && 'cursor-grab active:cursor-grabbing',
                isDragging && 'opacity-30',
                className,
            )}
        >
            <ShipShape id={ship.id} orientation={ship.orientation} cellSize={cellSize} tone={invalid ? 'invalid' : 'own'} />
        </button>
    )
}

const PlacementBoard: React.FC<PlacementBoardProps> = ({ fleet, onChange, locked }) => {
    const { ref: boardRef, cellSize } = useCellSize<HTMLDivElement>()
    const [dragging, setDragging] = useState<DragData | null>(null)
    const [preview, setPreview] = useState<Preview | null>(null)
    const [flashId, setFlashId] = useState<ShipId | null>(null)

    // A small movement threshold lets a tap rotate / auto-place instead of starting a drag.
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

    const flashInvalid = (id: ShipId) => {
        setFlashId(id)
        setTimeout(() => setFlashId((current) => (current === id ? null : current)), 450)
    }

    /** Works out where the dragged ship would land, snapping its top-left to the nearest cell. */
    const computePreview = (event: DragMoveEvent | DragEndEvent): Preview | null => {
        const data = event.active.data.current as DragData | undefined
        const rect = event.active.rect.current.translated
        const board = boardRef.current?.getBoundingClientRect()
        if (!data || !rect || !board) return null

        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const overBoard = centerX >= board.left && centerX <= board.right && centerY >= board.top && centerY <= board.bottom
        if (!overBoard) return null

        const ship = clampToBoard({
            id: data.id,
            orientation: data.orientation,
            row: Math.round((rect.top - board.top) / cellSize),
            col: Math.round((rect.left - board.left) / cellSize),
        })
        return { ship, valid: canPlace(ship, fleet) }
    }

    const handleDragStart = (event: DragStartEvent) => {
        setDragging(event.active.data.current as DragData)
    }

    const handleDragMove = (event: DragMoveEvent) => {
        setPreview(computePreview(event))
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const result = computePreview(event)
        const id = (event.active.data.current as DragData).id
        setDragging(null)
        setPreview(null)

        if (!result) {
            // Dropped outside the board: send it back to the dock.
            onChange(fleet.filter((ship) => ship.id !== id))
        } else if (result.valid) {
            onChange([...fleet.filter((ship) => ship.id !== id), result.ship])
        } else {
            flashInvalid(id)
        }
    }

    const handleDragCancel = () => {
        setDragging(null)
        setPreview(null)
    }

    const rotate = (ship: PlacedShip) => {
        const rotated = clampToBoard({ ...ship, orientation: ship.orientation === 'h' ? 'v' : 'h' })
        if (canPlace(rotated, fleet)) {
            onChange(fleet.map((s) => (s.id === ship.id ? rotated : s)))
        } else {
            flashInvalid(ship.id)
        }
    }

    const autoPlace = (id: ShipId) => {
        const spot = findFreeSpot(id, fleet)
        if (spot) onChange([...fleet, spot])
    }

    const docked = FLEET.filter(({ id }) => !fleet.some((ship) => ship.id === id))
    const previewCells = new Set(preview ? shipCells(preview.ship).map(([r, c]) => `${r},${c}`) : [])

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className='flex flex-col gap-4'>
                <div className='rounded-2xl border bg-card/50 p-1.5 sm:p-2'>
                    <div
                        ref={boardRef}
                        className='relative aspect-square w-full overflow-hidden rounded-xl bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--accent)_30%,transparent),transparent_75%)]'
                        style={gridBackground}
                    >
                        {/* Drop preview */}
                        {preview && [...previewCells].map((key) => {
                            const [r, c] = key.split(',').map(Number)
                            return (
                                <div
                                    key={key}
                                    className={cn('absolute', preview.valid ? 'bg-success/30' : 'bg-error/35')}
                                    style={{ top: r * cellSize, left: c * cellSize, width: cellSize, height: cellSize }}
                                />
                            )
                        })}

                        {fleet.map((ship) => (
                            <DraggableShip
                                key={ship.id}
                                ship={ship}
                                cellSize={cellSize}
                                disabled={locked}
                                invalid={flashId === ship.id}
                                label={`${shipName(ship.id)} at row ${ship.row + 1}, column ${ship.col + 1}, ${ship.orientation === 'h' ? 'horizontal' : 'vertical'}. Press to rotate, drag to move.`}
                                onTap={() => rotate(ship)}
                                className='absolute'
                                style={{ top: ship.row * cellSize, left: ship.col * cellSize }}
                            />
                        ))}
                    </div>
                </div>

                {!locked && (
                    <>
                        <div className='min-h-[3rem] rounded-2xl border border-dashed bg-card/30 p-3'>
                            {docked.length > 0 ? (
                                <div className='flex flex-wrap items-center gap-x-4 gap-y-3'>
                                    {docked.map(({ id }) => (
                                        <div key={id} className='flex flex-col gap-1'>
                                            <span className='text-[10px] tracking-wider text-muted-foreground uppercase'>
                                                {shipName(id)} · {shipSize(id)}
                                            </span>
                                            <DraggableShip
                                                ship={{ id, orientation: 'h' }}
                                                cellSize={cellSize}
                                                disabled={false}
                                                invalid={flashId === id}
                                                label={`${shipName(id)}, ${shipSize(id)} cells. Drag onto the board, or press to place it automatically.`}
                                                onTap={() => autoPlace(id)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className='py-1 text-center text-xs text-muted-foreground'>
                                    All ships deployed. Tap a ship to rotate it, or drag it off the board to remove it.
                                </p>
                            )}
                        </div>

                        <div className='flex gap-2'>
                            <Button variant='outline' className='flex-1' onClick={() => onChange(randomFleet())}>
                                <IoShuffle /> Randomize
                            </Button>
                            <Button variant='outline' className='flex-1' onClick={() => onChange([])} disabled={fleet.length === 0}>
                                <IoTrashOutline /> Clear
                            </Button>
                        </div>
                    </>
                )}
            </div>

            <DragOverlay dropAnimation={null}>
                {dragging && (
                    <ShipShape
                        id={dragging.id}
                        orientation={dragging.orientation}
                        cellSize={cellSize}
                        tone={preview && !preview.valid ? 'invalid' : 'own'}
                        className='cursor-grabbing drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]'
                    />
                )}
            </DragOverlay>
        </DndContext>
    )
}

export default PlacementBoard
