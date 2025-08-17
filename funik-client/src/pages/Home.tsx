import React from 'react'
import GameCard from '../common-components/GameCard'

const Home: React.FC = () => {
  return (
    <>
      <div className='flex justify-center gap-10 flex-col items-center mb-20'>
        <div className='flex flex-col items-center mb-3 lg:mb-10 justify-center'>
          <div className='text-[28px] lg:text-4xl text-primary font-extrabold py-2 lg:py-5 text-center'>
            WELCOME TO FUNIK
          </div>
          <div className='flex justify-center text-[12px] lg:text-base text-center'>
            CHOOSE A GAME AND LET THE TIME WASTE BEGIN
          </div>
        </div>
        <div className='flex flex-col lg:flex-row gap-10 lg:gap-15'>
          <GameCard
            gameTitle="Tic-Tac-Toe"
            link="tic_tac_toe"
            tagLine="The classic game of X's and O's"
            isDisabled={false}
          />
          <GameCard
            gameTitle="Battle Ship"
            link="battle_ship"
            tagLine="Strategize and sink your enemy's fleet Before they sink yours"
            isDisabled={true}
          />
          <GameCard
            gameTitle="COMING SOON"
            link="#"
            tagLine=""
            isDisabled={true}
          />
        </div>
      </div>
    </>
  )
}

export default Home