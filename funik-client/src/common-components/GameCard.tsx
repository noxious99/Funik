import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const GameCard: React.FC<{ gameTitle: string, link: string }> = ({ gameTitle, link }) => {
    return (
        <>
            <Link to={`/game/${link}`}>
                <div className='w-[200px] h-[200px] bg-gray-300 rounded-2xl ring-2 ring-gray-800 flex justify-center p-10'>
                    <div className='font-semibold text-lg'>{gameTitle}</div>
                </div>
            </Link>
        </>
    )
}

export default GameCard