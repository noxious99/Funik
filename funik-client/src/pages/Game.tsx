import React, { useState } from 'react';
import TicTacToe from '../features/tic_tac_toe/TicTacToe';
import Battleship from '../features/battleship/Battleship';
import ModeSelector from '../features/tic_tac_toe/ModeSelector';
import type { GameMode } from '../features/tic_tac_toe/types';
import { Link, useSearchParams } from 'react-router-dom';
import { generateRoomId, mapGameName } from '@/utils';
import { GAME_KEYS } from '@/utils/const';
import { Button } from '@/components/ui/button';
import { IoArrowBack } from 'react-icons/io5';
import NotFound from './NotFound';

const Game: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const gameKey = searchParams.get("gamekey") ?? "";
    // The room lives in the URL so a refresh keeps you in the game and invite links can join directly.
    const room = searchParams.get("room")?.trim() ?? "";
    const gameTitle = mapGameName(gameKey);
    const [roomInput, setRoomInput] = useState("");
    const [mode, setMode] = useState<GameMode>("classic");

    if (!gameTitle) {
        return <NotFound />;
    }

    const enterRoom = (roomId: string) => {
        setSearchParams({ gamekey: gameKey, room: roomId });
    };
    const leaveRoom = () => {
        setSearchParams({ gamekey: gameKey });
    };

    const handleJoinRoom = (e: React.FormEvent) => {
        e.preventDefault();
        const roomId = roomInput.trim();
        if (roomId) {
            enterRoom(roomId);
        }
    };

    if (room && gameKey === GAME_KEYS.TIC_TAC_TOE) {
        return <TicTacToe key={room} roomId={room} initialMode={mode} onLeave={leaveRoom} />;
    }
    if (room && gameKey === GAME_KEYS.BATTLESHIP) {
        return <Battleship key={room} roomId={room} onLeave={leaveRoom} />;
    }

    return (
        <div className='mx-auto flex w-full max-w-md flex-col gap-6'>
            <Link to="/" className='flex items-center gap-1.5 self-start text-sm text-muted-foreground transition hover:text-foreground'>
                <IoArrowBack /> All games
            </Link>

            <div className='text-center'>
                <h1 className='text-gradient text-2xl font-black tracking-wide sm:text-3xl'>{gameTitle}</h1>
                <p className='mt-2 text-sm text-muted-foreground'>Start a new room or jump into a friend's.</p>
            </div>

            <section className='flex flex-col gap-4 rounded-2xl border bg-card/80 p-5 sm:p-6'>
                <h2 className='text-sm font-bold tracking-wider uppercase'>Create a room</h2>
                {gameKey === GAME_KEYS.TIC_TAC_TOE ? (
                    <ModeSelector value={mode} onChange={setMode} />
                ) : (
                    <p className='text-xs text-muted-foreground'>
                        10×10 grid, five ships each. Sink the whole enemy fleet to win.
                    </p>
                )}
                <Button size='lg' onClick={() => enterRoom(generateRoomId())}>
                    Create room
                </Button>
            </section>

            <div className='flex items-center gap-3 text-xs tracking-wider text-muted-foreground uppercase'>
                <span className='h-px flex-1 bg-border' /> or <span className='h-px flex-1 bg-border' />
            </div>

            <section className='flex flex-col gap-4 rounded-2xl border bg-card/80 p-5 sm:p-6'>
                <h2 className='text-sm font-bold tracking-wider uppercase'>Join a room</h2>
                <form onSubmit={handleJoinRoom} className='flex gap-2'>
                    <label htmlFor='room-id' className='sr-only'>Room ID</label>
                    <input
                        id='room-id'
                        className='h-10 min-w-0 flex-1 rounded-md border border-input bg-background/60 px-3 font-display tracking-widest placeholder:font-sans placeholder:tracking-normal placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none'
                        type='text'
                        inputMode='numeric'
                        autoComplete='off'
                        maxLength={64}
                        value={roomInput}
                        onChange={(e) => setRoomInput(e.target.value)}
                        placeholder='Enter room ID'
                    />
                    <Button type='submit' size='lg' variant='secondary' disabled={!roomInput.trim()}>
                        Join
                    </Button>
                </form>
            </section>
        </div>
    );
};

export default Game;
