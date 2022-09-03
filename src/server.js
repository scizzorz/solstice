import path from 'path';
import serve from 'koa-static';
import { Server } from 'boardgame.io/server';
import { Solstice } from './Game';

const PORT = process.env.PORT || 8000;

const server = Server({
  games: [Solstice],
  origins: [Origins.LOCALHOST, `http://${HOST}:${FRONTEND_PORT}`],
});

// Build path relative to the server.js file
const frontEndAppBuildPath = path.resolve(__dirname, '../build');
console.log(frontEndAppBuildPath);
server.app.use(serve(frontEndAppBuildPath))

server.run(PORT, () => {
  server.app.use(
    async (ctx, next) => await serve(frontEndAppBuildPath)(
      Object.assign(ctx, { path: 'index.html' }),
      next
    )
  )
});
