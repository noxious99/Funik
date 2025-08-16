import React from 'react'
import image from "../assets/sample-image.png"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Link } from 'react-router-dom'

const GameCard: React.FC<{ gameTitle: string, link: string, isDisabled: Boolean }> = ({ gameTitle, link, isDisabled }) => {
    return (
        <>
            <Link to={isDisabled ? "#" : `/game/${link}`}
                onClick={(e) => isDisabled && e.preventDefault()}>
                <Card className={isDisabled ? "opacity-50 pointer-events-none" : ""}>
                    <CardHeader>
                        <CardTitle className='flex justify-center'>{gameTitle}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <img src={image} alt='game_title' />
                    </CardContent>
                </Card>
            </Link>
        </>
    )
}

export default GameCard