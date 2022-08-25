// import { Lobby } from 'boardgame.io/react';
import { Client } from 'boardgame.io/react';
import { LobbyClient } from 'boardgame.io/client';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Solstice } from './Game';
import { SolsticeBoard } from './Board';
import { useRef, useState } from 'react';

const BACKEND_HOST = "fixme"
const BACKEND_PORT = 8002;

const lobbyClient = new LobbyClient({ server: `http://${BACKEND_HOST}:${BACKEND_PORT}` });

const Lobby = () => {
  const playerNameRef = useRef("playerName");
  const matchIDRef = useRef("playerName");

  const createMatch = async (numPlayers) => {
    if(playerNameRef.current.value.length === 0) {
      alert("Please enter a name.");
      return;
    }
    console.log("hello");

    const { matchID } = await lobbyClient.createMatch("solstice", {
      numPlayers: numPlayers,
      unlisted: true,
    });

    console.log("hello");

    joinMatch(matchID);
  };

  const joinMatch = async (matchID) => {
    if(playerNameRef.current.value.length === 0) {
      alert("Please enter a name.");
      return;
    }

    const { playerID, playerCredentials } = await lobbyClient.joinMatch("solstice", matchID, {
      playerName: playerNameRef.current.value,
    });

    const { protocol, host } = window.location;

    window.location.replace(`${protocol}//${host}/?match=${matchID}&id=${playerID}&creds=${playerCredentials}`);
  };

  return <div id="lobby">
    <input id="playerName" ref={playerNameRef} placeholder="player name"/>

    <div id="createMatch">
      <h2>Create Game</h2>
      <button className="p2" onClick={() => createMatch(2)}>2</button>
      <button className="p3" onClick={() => createMatch(3)}>3</button>
      <button className="p4" onClick={() => createMatch(4)}>4</button>
    </div>

    <div id="joinMatch">
      <input id="matchID" ref={matchIDRef} placeholder="match ID"/>
      <br/>
      <button onClick={() => joinMatch(matchIDRef.current.value)}>Join Game</button>
    </div>
  </div>;
};

const App = () => {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });

  if(params.match && params.id && params.creds) {
    const SolsticeClient = Client({
      game: Solstice,
      board: SolsticeBoard,
      multiplayer: SocketIO({server: `${BACKEND_HOST}:${BACKEND_PORT}`}),
      debug: false,
    });

    return <SolsticeClient playerID={params.id} matchID={params.match} credentials={params.creds} />;
  }

  return <Lobby />;
};

export default App;
