import { Button, buttonVariants } from '@/components/ui/button'
import { IoMdLogIn } from "react-icons/io";
import { IoLogOutOutline, IoTrophyOutline } from "react-icons/io5";
import React from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/auth_context';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  // Send people back to where they were (e.g. a game room) after logging in.
  const loginHref = location.pathname === '/login'
    ? '/login'
    : `/login?next=${encodeURIComponent(location.pathname + location.search)}`;

  return (
    <header className='sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md'>
      <nav className='mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6'>
        <Link to="/" className='group flex shrink-0 items-center gap-2' aria-label='Funik home'>
          <span className='grid size-8 place-items-center rounded-lg bg-primary font-display text-sm font-black text-primary-foreground shadow-[0_0_16px_var(--primary)] transition-transform group-hover:rotate-6'>
            F
          </span>
          <span className='hidden font-display text-lg font-bold tracking-wider min-[340px]:inline sm:text-xl'>
            FUNIK<span className='text-primary'>.ME</span>
          </span>
        </Link>

        <div className='flex items-center gap-1 sm:gap-2'>
          <NavLink
            to='/leaderboard'
            aria-label='Leaderboard'
            className={({ isActive }) => cn(buttonVariants({ variant: 'ghost', size: 'sm' }), isActive && 'text-primary')}
          >
            <IoTrophyOutline />
            <span className='hidden sm:inline'>Leaderboard</span>
          </NavLink>

          {loading ? (
            <span className='h-8 w-20 animate-pulse rounded-md bg-muted/40' aria-hidden />
          ) : user ? (
            <>
              <Link
                to={`/u/${user.username}`}
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'max-w-[9rem] gap-2 px-2')}
                aria-label='Your profile'
              >
                <span className='grid size-6 shrink-0 place-items-center rounded-md bg-gradient-to-br from-primary to-secondary text-xs font-black uppercase'>
                  {user.username[0]}
                </span>
                <span className='hidden truncate sm:inline'>{user.username}</span>
              </Link>
              <Button variant='ghost' size='sm' onClick={logout} aria-label='Log out' title='Log out'>
                <IoLogOutOutline />
              </Button>
            </>
          ) : (
            <Link
              to={loginHref}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'border-primary/60 bg-transparent hover:bg-primary/15')}
            >
              <IoMdLogIn />
              <span>Login</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
