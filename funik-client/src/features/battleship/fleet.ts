// Mirrors funik-services/utils/battleship_utils.ts. The server re-validates everything.
export const BOARD_SIZE = 10;

export const FLEET = [
    { id: "carrier", name: "Carrier", size: 5 },
    { id: "battleship", name: "Battleship", size: 4 },
    { id: "cruiser", name: "Cruiser", size: 3 },
    { id: "submarine", name: "Submarine", size: 3 },
    { id: "destroyer", name: "Destroyer", size: 2 },
] as const;

export type ShipId = typeof FLEET[number]["id"];
export type Orientation = "h" | "v";

export type PlacedShip = {
    id: ShipId
    row: number
    col: number
    orientation: Orientation
}

export type Shot = {
    row: number
    col: number
    hit: boolean
}

export const shipSize = (id: ShipId): number => FLEET.find((ship) => ship.id === id)?.size ?? 0;
export const shipName = (id: ShipId): string => FLEET.find((ship) => ship.id === id)?.name ?? id;

export const shipCells = (ship: PlacedShip): [number, number][] =>
    Array.from({ length: shipSize(ship.id) }, (_, i) =>
        ship.orientation === "h" ? [ship.row, ship.col + i] : [ship.row + i, ship.col]
    );

/** Moves a ship's anchor so the whole ship fits on the board. */
export const clampToBoard = (ship: PlacedShip): PlacedShip => {
    const size = shipSize(ship.id);
    const maxRow = BOARD_SIZE - (ship.orientation === "v" ? size : 1);
    const maxCol = BOARD_SIZE - (ship.orientation === "h" ? size : 1);
    return {
        ...ship,
        row: Math.min(Math.max(ship.row, 0), maxRow),
        col: Math.min(Math.max(ship.col, 0), maxCol),
    };
};

/** True if the ship is on the board and doesn't overlap any of `others` (ignoring itself). */
export const canPlace = (ship: PlacedShip, others: PlacedShip[]): boolean => {
    const taken = new Set(
        others.filter((other) => other.id !== ship.id).flatMap(shipCells).map(([r, c]) => `${r},${c}`)
    );
    return shipCells(ship).every(([r, c]) =>
        r >= 0 && c >= 0 && r < BOARD_SIZE && c < BOARD_SIZE && !taken.has(`${r},${c}`)
    );
};

/** A random valid layout for the whole fleet. */
export const randomFleet = (): PlacedShip[] => {
    const fleet: PlacedShip[] = [];
    for (const { id } of FLEET) {
        for (;;) {
            const orientation: Orientation = Math.random() < 0.5 ? "h" : "v";
            const candidate = clampToBoard({
                id,
                orientation,
                row: Math.floor(Math.random() * BOARD_SIZE),
                col: Math.floor(Math.random() * BOARD_SIZE),
            });
            if (canPlace(candidate, fleet)) {
                fleet.push(candidate);
                break;
            }
        }
    }
    return fleet;
};

export const findShipAt = (fleet: PlacedShip[], row: number, col: number): PlacedShip | undefined =>
    fleet.find((ship) => shipCells(ship).some(([r, c]) => r === row && c === col));

export const isShipSunk = (ship: PlacedShip, shots: Shot[]): boolean =>
    shipCells(ship).every(([r, c]) => shots.some((s) => s.hit && s.row === r && s.col === c));
