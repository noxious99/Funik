import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/auth_context'

/** Explains why an unranked game won't count toward stats. */
const CasualNotice: React.FC<{ opponentUserId: string | null | undefined }> = ({ opponentUserId }) => {
    const { user } = useAuth()
    const location = useLocation()

    return (
        <p className='text-center text-xs text-muted-foreground'>
            {!user ? (
                <>
                    Casual game.{' '}
                    <Link to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} className='font-semibold text-primary hover:underline'>
                        Log in
                    </Link>{' '}
                    to have wins count toward the leaderboard.
                </>
            ) : opponentUserId === user.id ? (
                "You're playing yourself, so this game won't count toward stats."
            ) : (
                "Your opponent is a guest, so this game won't count toward stats."
            )}
        </p>
    )
}

export default CasualNotice
