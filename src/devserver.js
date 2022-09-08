import path from 'path';
import serve from 'koa-static';
import { Server, Origins } from 'boardgame.io/server';
import { Solstice } from './Game';
import { getID } from 'human-readable-ids-browser';

const ADDRESS = process.env.ADDRESS || "https://xtfc-solstice.herokuapp.com/";
const PORT = process.env.PORT || 8000;

console.log("ADDRESS: " + ADDRESS);
console.log("PORT: " + PORT);

const server = Server({
  games: [Solstice],
  origins: [Origins.LOCALHOST, ADDRESS],
  uuid: getID,
});

server.run(PORT);
