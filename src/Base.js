import { LobbyClient } from 'boardgame.io/client';

export const ADDRESS = process.env.ADDRESS || "http://localhost:5000";
export const lobbyClient = new LobbyClient({ server: ADDRESS });

console.log("ADDRESS: " + ADDRESS);
