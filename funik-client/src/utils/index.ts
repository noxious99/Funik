import { gameObject } from "./const";

export const generateRandomNumber = () => {
    return Math.floor(100000 + Math.random() * 900000);
}
export const mapGameName = (rawValue: string) => {
    return gameObject[rawValue]
}