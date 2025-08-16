import React from 'react'
import GameCard from '../common-components/GameCard'

const Home: React.FC = () => {
  return (
    <>
      <div className='flex justify-center gap-10'>
        <GameCard 
          gameTitle="Tic-Tac-Toe"
          link="tic_tac_toe"
          isDisabled={false}
        />
        <GameCard 
          gameTitle="Battle Ship"
          link="battle_ship"
          isDisabled={true}
        />
      </div>
    </>
  )
}

export default Home