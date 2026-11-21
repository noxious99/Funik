import React from 'react'
import { cn } from '@/lib/utils'
import { GAME_MODE_INFO, type GameMode } from './types'

type ModeSelectorProps = {
    value: GameMode
    onChange: (mode: GameMode) => void
    disabled?: boolean
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ value, onChange, disabled = false }) => {
    return (
        <div role="radiogroup" aria-label="Game mode" className='grid grid-cols-2 gap-2'>
            {(Object.keys(GAME_MODE_INFO) as GameMode[]).map((mode) => {
                const selected = mode === value
                return (
                    <button
                        key={mode}
                        type='button'
                        role='radio'
                        aria-checked={selected}
                        disabled={disabled}
                        onClick={() => onChange(mode)}
                        className={cn(
                            'flex flex-col gap-1 rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50',
                            selected
                                ? 'border-primary bg-primary/10 shadow-[0_0_20px_-8px_var(--primary)]'
                                : 'border-border bg-background/40 hover:border-primary/60'
                        )}
                    >
                        <span className='font-display text-xs font-bold tracking-wider uppercase'>{GAME_MODE_INFO[mode].label}</span>
                        <span className='text-xs leading-snug text-muted-foreground'>{GAME_MODE_INFO[mode].description}</span>
                    </button>
                )
            })}
        </div>
    )
}

export default ModeSelector
