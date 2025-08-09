export const checkWinner = (boxValue: string[][]) => {
    for (let i = 0; i < 3; i++) {
        if (
            boxValue[i][0] !== "" &&
            boxValue[i][0] === boxValue[i][1] &&
            boxValue[i][1] === boxValue[i][2]
        ) {
            return boxValue[i][0];
        }
    }
    for (let i = 0; i < 3; i++) {
        if (
            boxValue[0][i] !== "" &&
            boxValue[0][i] === boxValue[1][i] &&
            boxValue[1][i] === boxValue[2][i]
        ) {
            return boxValue[0][i]

        }
    }
    if (
        boxValue[0][0] !== "" &&
        boxValue[0][0] === boxValue[1][1] &&
        boxValue[1][1] === boxValue[2][2]
    ) {
        return boxValue[0][0]
    }

    if (
        boxValue[0][2] !== "" &&
        boxValue[0][2] === boxValue[1][1] &&
        boxValue[1][1] === boxValue[2][0]
    ) {
        return boxValue[0][2]
    }
    return ""
}

export const checkDraw = (boxValue: string[][]) => {
    let flag = 0
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (!boxValue[i][j]) {
                flag = 1
            }
        }
    }
    if (!flag) {
        return "Draw"
    }
    return ""
}