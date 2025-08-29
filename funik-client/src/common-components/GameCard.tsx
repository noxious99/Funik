import React from 'react'
import tictactoe_thumb from "../assets/tictactoe_thumb.png"
import battleship_thumb from "../assets/battleship_thumb.png"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const GameCard: React.FC<{ gameTitle: string, link: string, isDisabled: Boolean, tagLine: string }> = ({ gameTitle, link, isDisabled, tagLine }) => {
const gameThumbMap: Record<string, string> = {
    tic_tac_toe: tictactoe_thumb,
    battle_ship: battleship_thumb,
}
    return (
        <>
            <Link
                to={isDisabled ? "#" : `/join_game?gamekey=${link}`}
                onClick={(e) => isDisabled && e.preventDefault()}
                className="w-full flex justify-center"
            >
                <Card
                    className={`w-full max-w-[280px] lg:min-w-[280px] ${isDisabled ? "opacity-50 pointer-events-none" : ""
                        }`}
                >
                    <CardHeader>
                        <CardTitle className="text-center">{gameTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-center items-center gap-5">
                        <img src={gameThumbMap[link]} alt="game_title" className="w-[150px] h-auto" />
                        <p className='text-[10px] text-center'>{tagLine}</p>
                        <Button className='px-5' variant="outline">Play Game</Button>
                    </CardContent>
                </Card>
            </Link>
        </>
    )
}

export default GameCard