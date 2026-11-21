import { findShipAt, isShipSunk, parseFleet, BOARD_SIZE } from "../../utils/battleship_utils.js";
import type { PlacedShip, Shot } from "../../utils/battleship_utils.js";
import { isRanked, type RoomPlayer } from "./room_player.js";

const MAX_PLAYERS = 2;

/** "placing": deploying ships (also while waiting for an opponent). */
export type BattleshipPhase = "placing" | "battle" | "finished";

type BattleshipPlayer = RoomPlayer & {
    /** Null until the player has deployed their fleet and readied up. */
    fleet: PlacedShip[] | null;
    /** Shots this player has fired at their opponent. */
    shots: Shot[];
}

type BattleshipRoom = {
    players: BattleshipPlayer[];
    ranked: boolean;
    phase: BattleshipPhase;
    turn: number;
    startingTurn: number;
    winner: number | null;
    scores: [number, number];
}

/**
 * What one player is allowed to see. Opponent ship positions are never included
 * until they are sunk or the game is over.
 */
export type BattleshipView = {
    phase: BattleshipPhase;
    ranked: boolean;
    /** Index of the viewer in `players`. */
    you: number;
    players: { username: string | null; userId: string | null; ready: boolean }[];
    turn: number;
    winner: number | null;
    scores: [number, number];
    myFleet: PlacedShip[] | null;
    myShots: Shot[];
    enemyShots: Shot[];
    /** Enemy ships that are sunk (or all of them once the game is finished). */
    revealedEnemyShips: PlacedShip[];
}

const isCoordinate = (value: unknown): value is number =>
    Number.isInteger(value) && (value as number) >= 0 && (value as number) < BOARD_SIZE;

class BattleshipGameManager {
    private rooms: Record<string, BattleshipRoom> = {};

    private findPlayer(room: BattleshipRoom, playerId: string) {
        const index = room.players.findIndex((p) => p.id === playerId);
        return index === -1 ? null : { index, player: room.players[index]! };
    }

    private startPlacement(room: BattleshipRoom, startingTurn: number) {
        room.players.forEach((p) => { p.fleet = null; p.shots = []; });
        room.phase = "placing";
        room.winner = null;
        room.startingTurn = startingTurn;
        room.turn = startingTurn;
    }

    /** Returns the room, or null if the room is already full. */
    joinRoom(roomId: string, player: RoomPlayer): BattleshipRoom | null {
        const room = this.rooms[roomId] ??= {
            players: [],
            ranked: false,
            phase: "placing",
            turn: 0,
            startingTurn: 0,
            winner: null,
            scores: [0, 0],
        };
        if (this.findPlayer(room, player.id)) return room;
        if (room.players.length >= MAX_PLAYERS) return null;

        room.players.push({ ...player, fleet: null, shots: [] });
        room.ranked = isRanked(room.players);
        return room;
    }

    /** Deploys (or re-deploys) a fleet. Returns an error message on failure. */
    placeFleet(roomId: string, playerId: string, fleetInput: unknown): { room: BattleshipRoom } | { error: string } {
        const room = this.rooms[roomId];
        const found = room && this.findPlayer(room, playerId);
        if (!room || !found) return { error: "You are not in this room." };
        if (room.phase !== "placing") return { error: "Ships can only be placed before the battle starts." };

        const fleet = parseFleet(fleetInput);
        if (!fleet) return { error: "Invalid fleet: place every ship inside the board without overlapping." };

        found.player.fleet = fleet;
        if (room.players.length === MAX_PLAYERS && room.players.every((p) => p.fleet)) {
            room.phase = "battle";
            room.turn = room.startingTurn;
        }
        return { room };
    }

    /** Takes a fleet back off "ready" so it can be rearranged. */
    unready(roomId: string, playerId: string): BattleshipRoom | null {
        const room = this.rooms[roomId];
        const found = room && this.findPlayer(room, playerId);
        if (!room || !found || room.phase !== "placing") return null;

        found.player.fleet = null;
        return room;
    }

    /** Fires at the opponent. Returns null for any invalid shot. */
    fire(roomId: string, playerId: string, row: unknown, col: unknown): { room: BattleshipRoom; finished: boolean } | null {
        const room = this.rooms[roomId];
        const found = room && this.findPlayer(room, playerId);
        if (!room || !found || room.phase !== "battle" || room.turn !== found.index) return null;
        if (!isCoordinate(row) || !isCoordinate(col)) return null;

        const shooter = found.player;
        const target = room.players[1 - found.index]!;
        if (shooter.shots.some((s) => s.row === row && s.col === col)) return null;

        const hit = Boolean(findShipAt(target.fleet!, row, col));
        shooter.shots.push({ row, col, hit });

        if (hit && target.fleet!.every((ship) => isShipSunk(ship, shooter.shots))) {
            room.phase = "finished";
            room.winner = found.index;
            room.scores[found.index as 0 | 1] += 1;
            return { room, finished: true };
        }

        room.turn = 1 - found.index;
        return { room, finished: false };
    }

    /** Starts a new game in the same room; the other player fires first. */
    rematch(roomId: string, playerId: string): BattleshipRoom | null {
        const room = this.rooms[roomId];
        if (!room || !this.findPlayer(room, playerId) || room.phase !== "finished") return null;

        this.startPlacement(room, (room.startingTurn + 1) % MAX_PLAYERS);
        return room;
    }

    /** Removes the player from a single room. Returns the room if it still exists. */
    leaveRoom(roomId: string, playerId: string): BattleshipRoom | null {
        const room = this.rooms[roomId];
        const found = room && this.findPlayer(room, playerId);
        if (!room || !found) return room ?? null;

        room.players.splice(found.index, 1);
        if (room.players.length === 0) {
            delete this.rooms[roomId];
            return null;
        }

        // The remaining player keeps their room and faces whoever joins next.
        room.ranked = false;
        room.scores = [0, 0];
        if (room.phase === "placing") {
            // Nothing has been fired yet, so a fleet that's already deployed can stay ready.
            room.startingTurn = 0;
            room.turn = 0;
        } else {
            this.startPlacement(room, 0);
        }
        return room;
    }

    /** Removes the player from every room they are in. Returns the affected room ids. */
    removePlayer(playerId: string): string[] {
        const affected = Object.keys(this.rooms).filter((roomId) => this.findPlayer(this.rooms[roomId]!, playerId));
        affected.forEach((roomId) => this.leaveRoom(roomId, playerId));
        return affected;
    }

    getRoom(roomId: string): BattleshipRoom | null {
        return this.rooms[roomId] ?? null;
    }

    /** Builds the state a single player is allowed to see. */
    viewFor(room: BattleshipRoom, playerId: string): BattleshipView | null {
        const found = this.findPlayer(room, playerId);
        if (!found) return null;

        const me = found.player;
        const enemy = room.players[1 - found.index];
        const enemyFleet = enemy?.fleet ?? [];
        const revealedEnemyShips = room.phase === "finished"
            ? enemyFleet
            : enemyFleet.filter((ship) => isShipSunk(ship, me.shots));

        return {
            phase: room.phase,
            ranked: room.ranked,
            you: found.index,
            players: room.players.map((p) => ({ username: p.username, userId: p.userId, ready: Boolean(p.fleet) })),
            turn: room.turn,
            winner: room.winner,
            scores: room.scores,
            myFleet: me.fleet,
            myShots: me.shots,
            enemyShots: enemy?.shots ?? [],
            revealedEnemyShips,
        };
    }
}

export const battleshipManager = new BattleshipGameManager();
