import React, { useState, useEffect } from 'react'
import { socket } from '../../socket'
import { Button } from '@/components/ui/button'
import { IoReloadCircleOutline } from "react-icons/io5";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"


const TicTacToe: React.FC<{ roomId: string }> = ({ roomId }) => {
    const [boxValue, setBoxValue] = useState([
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ])
    // const [playerActive, setPlayerActive] = useState(true)
    const [symbol, setSymbol] = useState("")
    const [turn, setTurn] = useState(0)
    const [myTurnValue, setMyTurnValue] = useState(0)
    const [winner, setWinner] = useState("")
    const [openWinnerDialog, setOpenWinnerDialog] = useState(false)
    const [roomKey, setRoomKey] = useState("")
    const [warningMsg, setWarningMsg] = useState("")

    useEffect(() => {;
        if (roomId) {
            socket.emit("join_game_one", roomId)
            setRoomKey(roomId)
        }
        socket.on("room_state", (room) => {
        if (room.players[0] == socket.id) {
            setSymbol("X")
            setMyTurnValue(0)
        } else {
            setSymbol("O")
            setMyTurnValue(1)
        }   if (room.players.length < 2) {
            setWarningMsg("waiting for Player-2 to join the game..")
        } else {
            setWarningMsg("")
        }
            setTurn(room.turn)
            setBoxValue(room.board);
            setWinner(room.winner);
            // setPlayerActive(socket.id === room.players[room.turn]);
        });

        socket.on("player joined", (playerId: string) => {
            console.log(`${playerId}: new player joined`)
            setWarningMsg("")
        })

        return () => {
            socket.off("room_state");
        };
    }, [roomId])

     useEffect(() => {
        if (winner) {
            setOpenWinnerDialog(true);
        }
    }, [winner]);


    const handleBoxValue = (row: number, column: number) => {
        if (winner || !roomId) {
            return
        }
        if (boxValue[row][column]) return;
        socket.emit("player_move", roomId, row, column)
    }

    const resetGame = () => {
        if (roomId) {
            socket.emit("reset_game", roomId);
        }
    }

    return (
        <>
            <div className='flex flex-col items-center gap-4'>
                <div className='flex flex-col gap-2 text-base lg:text-lg items-center'>
                    <div className='flex flex-col gap-2 text-[12px] items-center'>
                        <div className='flex gap-1'><p>ROOM ID -</p> <span>{roomKey}</span></div>
                        {warningMsg ? warningMsg : <p className='font-bold text-primary'>{turn == myTurnValue? "Your Turn Now!": "waiting for oponent move.."}</p>}
                    </div>
                </div>
                <div className='flex font-bold gap-4 text-[12px] lg:text-base'>
                    <span className='flex items-center gap-2 font-semibold text-secondary text-[shadow:0_0_8px_var(--primary)]'>
                        <span className=''>Playing as</span>
                        <span className='bg-gray-300 flex justify-center items-center px-2 rounded border'>{symbol}</span>
                    </span>
                    <span className='flex items-center gap-2 font-semibold text-secondary text-[shadow:0_0_8px_var(--secondary)]'>
                        <span className=''>Player-2</span>
                        <span className='bg-gray-300 flex justify-center items-center px-2 rounded border'>{symbol == "X"? "O" : "X"}</span>
                    </span>
                </div>
                <div className='flex flex-row items-center justify-center gap-10 mb-10'>
                </div>
                <div className="flex flex-col">
                    {boxValue.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex flex-row">
                            {row.map((_, colIndex) => (
                                <div
                                    key={colIndex}
                                    className={`flex w-[100px] h-[100px] bg-background border border-accent shadow-[0_0_8px_var(--accent)] justify-center items-center m-1 text-5xl rounded-3xl text-gray-100`}
                                    onClick={() => handleBoxValue(rowIndex, colIndex)}
                                >
                                    {boxValue[rowIndex][colIndex]}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className='flex items-center mt-4'>
                    <Button onClick={() => resetGame()} className='bg-error'> <IoReloadCircleOutline className='font-extrabold' /> Reset Game</Button>
                </div>
                <Dialog open={openWinnerDialog} onOpenChange={setOpenWinnerDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className='flex justify-center mb-4'>🎉 Game Over!</DialogTitle>
                            <DialogDescription>
                                {winner === "draw"
                                    ? "It's a draw! Try again?"
                                    : (

                                        <div className='flex items-center justify-center gap-2'>
                                            <p className="text-3xl lg:text-4xl font-extrabold text-primary">{winner}</p>
                                            <span>is the winner!! 🏆</span>
                                        </div>

                                    )}
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    )
}

export default TicTacToe