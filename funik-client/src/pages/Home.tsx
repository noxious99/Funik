import React from 'react'
import { useState } from 'react'
import TicTacToe from '../features/tic_tac_toe/TicTacToe'

const Home: React.FC = () => {
  const [gameTitle, setGameTitle] = useState("")
  const handleUpdateGameTitle = () => {
    
  }
  return (
    <>
      <div className='flex justify-center'>
        {gameTitle}
        <TicTacToe />
      </div>
    </>
  )
}

export default Home