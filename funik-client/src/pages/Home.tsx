import React from 'react'
import GameCard from '../common-components/GameCard'
import { GAME_KEYS } from '@/utils/const'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { useAuth } from '@/auth/auth_context'
import { IoTrophyOutline } from 'react-icons/io5'

const Home: React.FC = () => {
  const { user, loading } = useAuth()

  return (
    <div className='flex flex-col items-center gap-10 sm:gap-14'>
      <section className='flex max-w-2xl flex-col items-center gap-4 text-center'>
        <span className='rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium tracking-wide text-primary'>
          Real-time multiplayer · No sign-up
        </span>
        <h1 className='text-3xl font-black leading-tight tracking-wide sm:text-5xl'>
          WELCOME TO <span className='text-gradient'>FUNIK</span>
        </h1>
        <p className='text-sm text-muted-foreground sm:text-base'>
          Pick a game, share a room code with a friend, and let the time waste begin.
        </p>
        <div className='mt-2 flex flex-wrap justify-center gap-3'>
          {!loading && !user && (
            <Link to='/login?mode=register' className={buttonVariants({ size: 'lg' })}>
              Create free account
            </Link>
          )}
          <Link to='/leaderboard' className={buttonVariants({ variant: 'outline', size: 'lg' })}>
            <IoTrophyOutline />
            Leaderboard
          </Link>
        </div>
      </section>

      <section className='grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6'>
        <GameCard
          gameTitle="Tic-Tac-Toe"
          gameKey={GAME_KEYS.TIC_TAC_TOE}
          tagLine="The classic game of X's and O's, plus a Vanishing mode where nothing lasts."
          isDisabled={false}
        />
        <GameCard
          gameTitle="Battle Ship"
          gameKey={GAME_KEYS.BATTLESHIP}
          tagLine="Hide your fleet, hunt theirs. Sink all five enemy ships before they sink yours."
          isDisabled={false}
        />
        <GameCard
          gameTitle="More Games"
          tagLine="Something new is being cooked up. Check back soon."
          isDisabled={true}
        />
      </section>
    </div>
  )
}

export default Home
