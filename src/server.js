import path from 'path';
import serve from 'koa-static';
import { Server } from 'boardgame.io/server';
import { Solstice } from './Game';
import { getID } from 'human-readable-ids-browser';

const ADDRESS = process.env.ADDRESS || "https://xtfc-solstice.herokuapp.com/";
const PORT = process.env.PORT || 8000;

console.log("ADDRESS: " + ADDRESS);
console.log("PORT: " + PORT);

const server = Server({
  games: [Solstice],
  origins: [ADDRESS],
  uuid: getID,
});

console.log("Server created");

// Build path relative to the server.js file
const frontEndAppBuildPath = path.resolve(__dirname, '../build');

console.log("frontEndAppBuildPath: " + frontEndAppBuildPath);

server.app.use(serve(frontEndAppBuildPath))

console.log("Used");

server.run(PORT, () => {
  server.app.use(
    async (ctx, next) => await serve(frontEndAppBuildPath)(
      Object.assign(ctx, { path: 'index.html' }),
      next
    )
  )
});

console.log("Run");
