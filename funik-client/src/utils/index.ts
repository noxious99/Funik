import { gameObject } from "./const";

export const generateRoomId = (): string => {
    return String(Math.floor(100000 + Math.random() * 900000));
}
export const mapGameName = (rawValue: string): string | undefined => {
    return gameObject[rawValue]
}
