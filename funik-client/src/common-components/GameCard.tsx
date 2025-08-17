import React from 'react'
import image from "../assets/sample-image.png"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const GameCard: React.FC<{ gameTitle: string, link: string, isDisabled: Boolean, tagLine: string }> = ({ gameTitle, link, isDisabled, tagLine }) => {
    return (
        <>
            <Link
                to={isDisabled ? "#" : `/game/${link}`}
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
                        <img src={image} alt="game_title" className="max-w-full h-auto" />
                        <p className='text-[10px] text-center'>{tagLine}</p>
                        <Button className='px-5' variant="outline">Play Game</Button>
                    </CardContent>
                </Card>
            </Link>
        </>
    )
}

export default GameCard