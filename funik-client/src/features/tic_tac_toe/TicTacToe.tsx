import React, { useState, useEffect } from 'react'
import { socket } from '../../socket'

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
        const checkWinning = () => {
            for (let i = 0; i < 3; i++) {
                if (
                    boxValue[i][0] !== "" &&
                    boxValue[i][0] === boxValue[i][1] &&
                    boxValue[i][1] === boxValue[i][2]
                ) {
                    if (!winner) {
                        setWinner(boxValue[i][0]);
                    }
                    return;
                }
            }
            for (let i = 0; i < 3; i++) {
                if (
                    boxValue[0][i] !== "" &&
                    boxValue[0][i] === boxValue[1][i] &&
                    boxValue[1][i] === boxValue[2][i]
                ) {
                    if (!winner) {
                        setWinner(boxValue[0][i]);
                    }
                    return;
                }
            }
            if (
                boxValue[0][0] !== "" &&
                boxValue[0][0] === boxValue[1][1] &&
                boxValue[1][1] === boxValue[2][2]
            ) {
                setWinner(boxValue[0][0]);
                return;
            }

            if (
                boxValue[0][2] !== "" &&
                boxValue[0][2] === boxValue[1][1] &&
                boxValue[1][1] === boxValue[2][0]
            ) {
                setWinner(boxValue[0][2]);
                return;
            }
        }
        const checkDraw = () => {
            let flag = 0
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (!boxValue[i][j]) {
                        flag = 1
                    }
                }
            }
            if (!flag) {
                setWinner("Draw")
            }
        }
        checkDraw()
        checkWinning()
    }, [boxValue, winner])

    const handleBoxValue = (row: number, column: number) => {
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
                    <span>
                        <span className=''>Player one: </span> <span>{playerOne}</span>
                    </span>
                    <span>
                        <span className=''>Player two: </span> <span>{playerTwo}</span>
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