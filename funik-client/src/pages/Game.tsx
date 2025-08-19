import React, { useEffect, useState } from 'react';
import TicTacToe from '../features/tic_tac_toe/TicTacToe';
import { useParams } from 'react-router-dom';
import { generateRandomNumber, mapGameName } from '@/utils';

const Game: React.FC = () => {
    const { gameKey } = useParams<{ gameKey: string }>();
    const [room, setRoom] = useState("");
    const [gameTitle, setGameTitle] = useState("")
    const [roomInput, setRoomInput] = useState("");
    const [joinState, setJoinState] = useState(false);

    useEffect(() => {
        if (gameKey) {
            let title = mapGameName(gameKey)
            console.log(title);
            setGameTitle(title);
        }
    }, [gameKey]);

    const handleJoinState = (bool: boolean) => {
        setJoinState(bool);
    };
    const handleJoinRoom = (e: React.FormEvent) => {
        e.preventDefault()
        setRoom(roomInput)
        console.log(room)
    };
    const handleCreateRoom = () => {
        const roomId: number = generateRandomNumber()
        setRoom(String(roomId))
    };

    return (
        <div className='flex flex-col justify-center items-center'>
            <div className='font-bold text-lg mb-4'>{gameTitle}</div>

            {!room && !joinState && (
                <div>
                    <div
                        className='bg-secondary text-gray-100 px-5 py-2 font-semibold text-lg flex justify-center items-center rounded my-5 hover:bg-primary duration-200 cursor-pointer'
                        onClick={() => handleCreateRoom()}
                    >
                        Create Room
                    </div>
                    <div
                        className='bg-secondary text-gray-100 px-5 py-2 font-semibold text-lg flex justify-center items-center rounded my-5 hover:bg-primary duration-200 cursor-pointer'
                        onClick={() => handleJoinState(true)}
                    >
                        Join Room
                    </div>
                </div>
            )}

            {!room && joinState && (
                <div className=''>
                    <form onSubmit={handleJoinRoom} className='flex flex-col items-center justify-center gap-4 w-full'>
                        <input
                            className='border-2 border-foreground rounded px-3 py-2 w-[200px]'
                            type='text'
                            value={roomInput}
                            onChange={(e) => setRoomInput(e.target.value)}
                            placeholder='Enter room id'
                        />
                        <button
                            type='submit'
                            className='bg-primary text-white px-3 py-2 rounded'
                        >
                            Join Room
                        </button>
                    </form>
                    <div
                        className='bg-secondary text-gray-100 px-5 py-2 font-semibold text-lg flex justify-center items-center rounded my-5 hover:bg-primary duration-200 cursor-pointer'
                        onClick={() => handleCreateRoom()}
                    >
                        Create Room
                    </div>
                </div>
            )}

            {room && (
                <div>
                    {gameTitle === "Tic - Tac - Toe" &&
                        <TicTacToe
                         roomId = {room}
                        />
                    }
                </div>
            )}
        </div>
    );
};

export default Game;
