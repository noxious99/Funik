import React, { useState, useEffect } from 'react'
import { socket } from '../../socket'
import { checkDraw, checkWinner } from './utils'
import { Button } from '@/components/ui/button'
import { IoReloadCircleOutline } from "react-icons/io5";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"


const TicTacToe: React.FC = () => {
    const [boxValue, setBoxValue] = useState([
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ])
    const [playerActive, setPlayerActive] = useState(true)
    const [winner, setWinner] = useState("")
    const [openWinnerDialog, setOpenWinnerDialog] = useState(false)

    useEffect(() => {
        // socket.on("your_player_id", (playerId) => {
        //     setPlayerOne(playerId);
        // });
        // socket.on("other_player_id", (playerId) => {
        //     setPlayerTwo(playerId);
        // });
        socket.on("player_move", (newBoard: string[][], playerTurn: boolean, result: string) => {
            setBoxValue(newBoard);
            setPlayerActive(playerTurn);
            setWinner(result)
        });
        console.log(import.meta.env.PROD)
        let resultDraw = checkDraw(boxValue)
        if (resultDraw && !winner) {
            setWinner(resultDraw)
        }
        let selectedWinner: string = checkWinner(boxValue)
        if (selectedWinner && !winner) {
            setWinner(selectedWinner)
        }
        if (winner) {
            setOpenWinnerDialog(true) // Open dialog when winner is decided
        }
    }, [boxValue, winner])

    const handleBoxValue = (row: number, column: number) => {
        if (winner) {
            return
        }
        if (boxValue[row][column]) return;
        const newBoard = boxValue.map(r => [...r]);
        newBoard[row][column] = playerActive ? "X" : "O";

        setBoxValue(newBoard);
        setPlayerActive(prev => !prev);
        socket.emit("player_move", newBoard, !playerActive, winner)
    }

    const resetGame = () => {
        const clearedBoard = [
            ["", "", ""],
            ["", "", ""],
            ["", "", ""]
        ];
        const result = ""
        setBoxValue(clearedBoard);
        setWinner(result);
        setPlayerActive(true);
        socket.emit("player_move", clearedBoard, true, result);
    }

    return (
        <>
            <div className='flex flex-col items-center gap-4'>
                <div className='flex flex-col gap-2 text-base lg:text-lg items-center'>
                    <span className='font-bold'>Tic - Tac - Toe</span>
                    <div className='flex gap-1 text-[12px]'>
                        <p>ROOM ID -</p> <span>352172</span>
                    </div>
                </div>
                <div className='flex font-bold gap-4 text-[12px] lg:text-base'>
                    <span className='flex items-center gap-2 font-semibold text-primary text-[shadow:0_0_8px_var(--primary)]'>
                        <span className=''>Player-1</span>
                        <span className='bg-gray-300 flex justify-center items-center px-2 rounded border'>gasdgad</span>
                    </span>
                    <span className='flex items-center gap-2 font-semibold text-secondary text-[shadow:0_0_8px_var(--secondary)]'>
                        <span className=''>Player-2</span>
                        <span className='bg-gray-300 flex justify-center items-center px-2 rounded border'>gasdgad</span>
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