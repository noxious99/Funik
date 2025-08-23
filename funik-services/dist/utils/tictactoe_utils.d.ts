export type Board = [
    [
        string,
        string,
        string
    ],
    [
        string,
        string,
        string
    ],
    [
        string,
        string,
        string
    ]
];
export declare const checkWinner: (board: Board) => string | undefined;
export declare const checkDraw: (board: Board) => "" | "Draw";
//# sourceMappingURL=tictactoe_utils.d.ts.map