import { LobbyClient } from 'boardgame.io/client';

export const ADDRESS = process.env.ADDRESS || "https://xtfc-solstice.herokuapp.com";
export const lobbyClient = new LobbyClient({ server: ADDRESS });

console.log("ADDRESS: " + ADDRESS);
