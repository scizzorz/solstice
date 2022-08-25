// import { Lobby } from 'boardgame.io/react';
import { Client } from 'boardgame.io/react';
import { LobbyClient } from 'boardgame.io/client';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Solstice } from './Game';
import { SolsticeBoard } from './Board';
import { useRef } from 'react';

const BACKEND_HOST = "fixme"
const BACKEND_PORT = 8002;

const lobbyClient = new LobbyClient({ server: `http://${BACKEND_HOST}:${BACKEND_PORT}` });

const CreateLobby = () => {
  const playerNameRef = useRef("playerName");

  const createMatch = async (numPlayers) => {
    if(playerNameRef.current.value.length === 0) {
      alert("Please enter a name.");
      return;
    }

    const { matchID } = await lobbyClient.createMatch("solstice", {
      numPlayers: numPlayers,
      unlisted: true,
    });

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

    window.localStorage.setItem(`${matchID}_creds`, playerCredentials);
    window.localStorage.setItem(`${matchID}_id`, playerID);

    const { protocol, host } = window.location;

    window.location.replace(`${protocol}//${host}/?match=${matchID}`);
  };

  return <div id="lobby">
    <input id="playerName" ref={playerNameRef} placeholder="player name"/>

    <div id="createMatch">
      <h2>Create Game</h2>
      <button className="p2" onClick={() => createMatch(2)}>2</button>
      <button className="p3" onClick={() => createMatch(3)}>3</button>
      <button className="p4" onClick={() => createMatch(4)}>4</button>
    </div>
  </div>;
};

const JoinLobby = () => {
  const playerNameRef = useRef("playerName");
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });

  const joinMatch = async () => {
    if(playerNameRef.current.value.length === 0) {
      alert("Please enter a name.");
      return;
    }

    const { playerID, playerCredentials } = await lobbyClient.joinMatch("solstice", params.match, {
      playerName: playerNameRef.current.value,
    });

    window.localStorage.setItem(`${params.match}_creds`, playerCredentials);
    window.localStorage.setItem(`${params.match}_id`, playerID);

    const { protocol, host } = window.location;
    window.location.replace(`${protocol}//${host}/?match=${params.match}`);
  };

  return <div id="lobby">
    <input id="playerName" ref={playerNameRef} placeholder="player name"/>

    <div id="joinMatch">
      <button onClick={() => joinMatch()}>Join Game</button>
    </div>
  </div>;
};

const App = () => {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });

  if(params.match) {
    const creds = window.localStorage.getItem(`${params.match}_creds`);
    const id = window.localStorage.getItem(`${params.match}_id`);
    if(creds && id) {
      const SolsticeClient = Client({
        game: Solstice,
        board: SolsticeBoard,
        multiplayer: SocketIO({server: `${BACKEND_HOST}:${BACKEND_PORT}`}),
        debug: false,
      });

      return <SolsticeClient playerID={id} matchID={params.match} credentials={creds} />;
    }
    else {
      return <JoinLobby />;
    }
  }

  return <CreateLobby />;
};

export default App;
