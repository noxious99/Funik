export type RoomPlayer = {
    /** Socket id; changes on every reconnect. */
    id: string;
    /** Account id, or null for guests. */
    userId: string | null;
    username: string | null;
}

/** A two-player room is ranked when both players are different logged-in accounts. */
export const isRanked = (players: RoomPlayer[]): boolean =>
    players.length === 2 &&
    players.every((p) => p.userId) &&
    players[0]!.userId !== players[1]!.userId;
