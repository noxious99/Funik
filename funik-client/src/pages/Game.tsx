import React, { useEffect, useState } from 'react';
import TicTacToe from '../features/tic_tac_toe/TicTacToe';
import { useParams } from 'react-router-dom';

const Game: React.FC = () => {
    const { title } = useParams<{ title: string }>();
    const [game, setGame] = useState("");
    const [room, setRoom] = useState("");
    const [roomInput, setRoomInput] = useState("");
    const [createState, setCreateState] = useState(false);

    useEffect(() => {
        if (title) {
            setGame(title);
            console.log(title);
        }
    }, [title]);

    const handleCreateState = (bool: boolean) => {
        setCreateState(bool);
    };

    const handleCreateRoom = (e: React.FormEvent) => {
        e.preventDefault();
        if (roomInput.trim()) {
            setRoom(roomInput.trim());
        }
    };

    return (
        <div className='flex justify-center'>

            {!room && !createState && (
                <div>
                    <div
                        className='bg-blue-500 text-gray-100 px-5 py-2 font-semibold text-lg flex justify-center items-center rounded my-5 hover:bg-blue-800 cursor-pointer'
                        onClick={() => handleCreateState(true)}
                    >
                        Create Room
                    </div>
                    <div
                        className='bg-blue-500 text-gray-100 px-5 py-2 font-semibold text-lg flex justify-center items-center rounded my-5 cursor-pointer'
                    >
                        Join Room
                    </div>
                </div>
            )}

            {!room && createState && (
                <div>
                    <form onSubmit={handleCreateRoom}>
                        <input
                            className='border-2 border-black rounded px-3 py-2 mr-5'
                            type='text'
                            value={roomInput}
                            onChange={(e) => setRoomInput(e.target.value)}
                            placeholder='Enter room name'
                        />
                        <button
                            type='submit'
                            className='bg-blue-500 text-white px-3 py-2 rounded'
                        >
                            Set Room
                        </button>
                    </form>
                </div>
            )}

            {room && (
                <div>
                    {game === "tic_tac_toe" &&
                        <TicTacToe />
                    }
                </div>
            )}
        </div>
    );
};

export default Game;
