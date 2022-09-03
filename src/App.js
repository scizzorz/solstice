// import { Lobby } from 'boardgame.io/react';
import { Client } from 'boardgame.io/react';
import { LobbyClient } from 'boardgame.io/client';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Solstice } from './Game';
import { SolsticeBoard } from './Board';
import { useRef } from 'react';

const ADDRESS = process.env.ADDRESS;

const lobbyClient = new LobbyClient({ server: ADDRESS });

const CreateLobby = () => {
  const createMatch = async (numPlayers) => {
    const { matchID } = await lobbyClient.createMatch("solstice", {
      numPlayers: numPlayers,
      unlisted: true,
    });

    const { protocol, host } = window.location;
    window.location.replace(`${protocol}//${host}/${matchID}`);
  };

  return <div id="lobby">
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
  const matchID = window.location.pathname.substr(1);

  const joinMatch = async () => {
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
    window.location.replace(`${protocol}//${host}/${matchID}`);
  };

  return <div id="lobby">
    <input id="playerName" ref={playerNameRef} placeholder="player name"/>

    <div id="joinMatch">
      <button onClick={() => joinMatch()}>Join</button>
    </div>
  </div>;
};

const App = () => {
  const matchID = window.location.pathname.substr(1);

  if(matchID.length > 0) {
    const creds = window.localStorage.getItem(`${matchID}_creds`);
    const id = window.localStorage.getItem(`${matchID}_id`);
    if(creds && id) {
      const SolsticeClient = Client({
        game: Solstice,
        board: SolsticeBoard,
        multiplayer: SocketIO({server: ADDRESS}),
        debug: false,
      });

      return <SolsticeClient playerID={id} matchID={matchID} credentials={creds} />;
    }
    else {
      return <JoinLobby />;
    }
  }

  return <CreateLobby />;
};

export default App;
