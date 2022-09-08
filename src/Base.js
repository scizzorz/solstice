import { LobbyClient } from 'boardgame.io/client';

export const ADDRESS = process.env.ADDRESS || "http://solstice.cards";
export const lobbyClient = new LobbyClient({ server: ADDRESS });

console.log("ADDRESS: " + ADDRESS);
