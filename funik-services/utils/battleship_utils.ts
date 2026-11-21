export const BOARD_SIZE = 10;

export const FLEET = [
  { id: "carrier", size: 5 },
  { id: "battleship", size: 4 },
  { id: "cruiser", size: 3 },
  { id: "submarine", size: 3 },
  { id: "destroyer", size: 2 },
] as const;

export type ShipId = typeof FLEET[number]["id"];
export type Orientation = "h" | "v";

export type PlacedShip = {
  id: ShipId;
  row: number;
  col: number;
  orientation: Orientation;
};

export type Shot = {
  row: number;
  col: number;
  hit: boolean;
};

const SHIP_SIZES = new Map<string, number>(FLEET.map((ship) => [ship.id, ship.size]));

const isCoordinate = (value: unknown): value is number =>
  Number.isInteger(value) && (value as number) >= 0 && (value as number) < BOARD_SIZE;

export const shipCells = (ship: PlacedShip): [number, number][] =>
  Array.from({ length: SHIP_SIZES.get(ship.id) ?? 0 }, (_, i) =>
    ship.orientation === "h" ? [ship.row, ship.col + i] : [ship.row + i, ship.col]
  );

/**
 * Validates an untrusted fleet from a client: exactly one of each ship, inside the board, no overlaps.
 * Returns a clean copy, or null if anything is wrong.
 */
export const parseFleet = (input: unknown): PlacedShip[] | null => {
  if (!Array.isArray(input) || input.length !== FLEET.length) return null;

  const seenIds = new Set<string>();
  const occupied = new Set<string>();
  const fleet: PlacedShip[] = [];

  for (const raw of input) {
    const { id, row, col, orientation } = (raw ?? {}) as Record<string, unknown>;
    if (typeof id !== "string" || !SHIP_SIZES.has(id) || seenIds.has(id)) return null;
    if (!isCoordinate(row) || !isCoordinate(col) || (orientation !== "h" && orientation !== "v")) return null;
    seenIds.add(id);

    const ship: PlacedShip = { id: id as ShipId, row, col, orientation };
    for (const [r, c] of shipCells(ship)) {
      if (r >= BOARD_SIZE || c >= BOARD_SIZE || occupied.has(`${r},${c}`)) return null;
      occupied.add(`${r},${c}`);
    }
    fleet.push(ship);
  }

  return fleet;
};

export const findShipAt = (fleet: PlacedShip[], row: number, col: number): PlacedShip | undefined =>
  fleet.find((ship) => shipCells(ship).some(([r, c]) => r === row && c === col));

export const isShipSunk = (ship: PlacedShip, shots: Shot[]): boolean =>
  shipCells(ship).every(([r, c]) => shots.some((s) => s.hit && s.row === r && s.col === c));
