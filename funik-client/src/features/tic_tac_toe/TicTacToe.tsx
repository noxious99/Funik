import React, { useState, useEffect } from 'react'
import { socket } from '../../socket'
import { checkDraw, checkWinner } from './utils'

const TicTacToe: React.FC = () => {
    const [boxValue, setBoxValue] = useState([
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ])
    const [playerActive, setPlayerActive] = useState(true)
    const [winner, setWinner] = useState("")
    const [playerOne, setPlayerOne] = useState("")
    const [playerTwo, setPlayerTwo] = useState("")

    useEffect(() => {
        socket.on("your_player_id", (playerId) => {
            setPlayerOne(playerId);
        });
        socket.on("other_player_id", (playerId) => {
            setPlayerTwo(playerId);
        });
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
            <div className='flex flex-col items-center'>
                <div className='flex text-xl font-bold gap-10 mb-10'>
                    <span className='flex items-center gap-2 text-sm font-semibold'>
                        <span className=''>Player one: </span> 
                        <span className='bg-gray-300 flex justify-center items-center px-2 rounded border'>gasdgadasdasdh</span>
                    </span>
                    <span className='flex items-center gap-2 text-sm font-semibold'>
                        <span className=''>Player two: </span> 
                        <span className='bg-gray-300 flex justify-center items-center px-2 rounded border'>gasdgadasdasdh</span>
                    </span>
                </div>
                <div className='flex flex-row items-center justify-center gap-10 mb-10'>
                    <div className='font-bold text-xl'>Tic-Tac-Toe</div>
                    <div className='flex items-center gap-2 pl-10'>
                        <div className='px-5 py-2 text-xl font-bold bg-green-700 text-gray-100 rounded'>Winner</div>
                        <div className={`${winner ? "text-5xl" : "text-xl"} font-bold text-blue-700`}>{winner ? winner : "pending.."}</div>
                    </div>
                </div>
                <div className="flex flex-col">
                    {boxValue.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex flex-row">
                            {row.map((col, colIndex) => (
                                <div
                                    key={colIndex}
                                    className={`flex w-[100px] h-[100px] ${winner ? 'bg-amber-900' : 'bg-amber-700'} justify-center items-center m-1 text-5xl rounded-3xl text-gray-100`}
                                    onClick={() => handleBoxValue(rowIndex, colIndex)}
                                >
                                    {boxValue[rowIndex][colIndex]}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className='flex items-center gap-2'>
                    <div className='px-5 py-2 bg-red-700 text-gray-100 text-xl font-bold rounded hover:bg-red-900 my-5' onClick={() => resetGame()}>Reset Game</div>
                </div>

            </div>
        </>
    )
}

export default TicTacToe