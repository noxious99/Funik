import React from 'react'
import { cn } from '@/lib/utils'

/** Animated X / O drawn with SVG strokes so it stays crisp at any board size. */
const Mark: React.FC<{ symbol: string, className?: string }> = ({ symbol, className }) => {
    if (symbol === "X") {
        return (
            <svg viewBox="0 0 100 100" className={cn("text-player-x glow-x", className)} aria-hidden>
                <path d="M24 24 L76 76" pathLength={1} className="mark-stroke" stroke="currentColor" strokeWidth={13} strokeLinecap="round" fill="none" />
                <path d="M76 24 L24 76" pathLength={1} className="mark-stroke mark-stroke-delay" stroke="currentColor" strokeWidth={13} strokeLinecap="round" fill="none" />
            </svg>
        )
    }
    if (symbol === "O") {
        return (
            <svg viewBox="0 0 100 100" className={cn("text-player-o glow-o", className)} aria-hidden>
                <circle cx="50" cy="50" r="28" pathLength={1} className="mark-stroke" stroke="currentColor" strokeWidth={13} fill="none" transform="rotate(-90 50 50)" />
            </svg>
        )
    }
    return null
}

export default Mark
