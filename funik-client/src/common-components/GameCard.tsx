import React from 'react'
import tictactoe_thumb from "../assets/tictactoe_thumb.png"
import battleship_thumb from "../assets/battleship_thumb.png"
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { GAME_KEYS } from '@/utils/const'
import { IoGameControllerOutline } from 'react-icons/io5'

const gameThumbMap: Record<string, string> = {
    [GAME_KEYS.TIC_TAC_TOE]: tictactoe_thumb,
    [GAME_KEYS.BATTLESHIP]: battleship_thumb,
}

type GameCardProps = {
    gameTitle: string
    gameKey?: string
    isDisabled: boolean
    tagLine: string
}

const GameCard: React.FC<GameCardProps> = ({ gameTitle, gameKey, isDisabled, tagLine }) => {
    const thumb = gameKey ? gameThumbMap[gameKey] : undefined
    const playable = !isDisabled && gameKey

    const card = (
        <article
            className={cn(
                "relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card/80 transition duration-300",
                playable
                    ? "group-hover:-translate-y-1 group-hover:border-primary group-hover:shadow-[0_0_32px_-8px_var(--primary)] group-focus-visible:border-primary"
                    : "opacity-60"
            )}
        >
            <div className='relative grid aspect-[16/10] place-items-center overflow-hidden bg-gradient-to-br from-accent/40 via-card to-secondary/30'>
                {thumb ? (
                    <img
                        src={thumb}
                        alt=""
                        className={cn("h-3/4 w-auto object-contain transition duration-300", playable && "group-hover:scale-105")}
                    />
                ) : (
                    <IoGameControllerOutline className='size-16 text-muted-foreground' aria-hidden />
                )}
                {isDisabled && (
                    <span className='absolute top-3 right-3 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase'>
                        Coming soon
                    </span>
                )}
            </div>
            <div className='flex flex-1 flex-col gap-2 p-5'>
                <h2 className='text-base font-bold tracking-wide'>{gameTitle}</h2>
                <p className='flex-1 text-sm text-muted-foreground'>{tagLine}</p>
                {playable && (
                    <span className={cn(buttonVariants({ size: "sm" }), 'mt-3 self-start')}>Play now</span>
                )}
            </div>
        </article>
    )

    if (!playable) {
        return <div aria-disabled="true">{card}</div>
    }

    return (
        <Link to={`/join_game?gamekey=${gameKey}`} className="group rounded-2xl outline-none">
            {card}
        </Link>
    )
}

export default GameCard
