import React from 'react'
import { useState } from 'react'
import GameCard from '../common-components/GameCard'

const Home: React.FC = () => {
  return (
    <>
      <div className='flex justify-center'>
        <GameCard 
          gameTitle="Tic-Tac-Toe"
          link="tic_tac_toe"
        />
      </div>
    </>
  )
}

export default Home