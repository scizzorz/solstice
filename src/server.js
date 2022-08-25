import { Server, Origins } from 'boardgame.io/server';
import { Solstice } from './Game';

const HOST = process.env.HOST;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 8001;
const PORT = process.env.PORT || 8002;

const server = Server({
  games: [Solstice],
  origins: [Origins.LOCALHOST, `http://${HOST}:${FRONTEND_PORT}`],
});

server.run(PORT);
