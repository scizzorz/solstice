import { lobbyClient, ADDRESS } from './Base';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Solstice } from './Game';
import { SolsticeBoard } from './Board';

const CreateLobby = () => {
  const createMatch = async (numPlayers) => {
    const { matchID } = await lobbyClient.createMatch("solstice", {
      numPlayers: numPlayers,
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
      // there's actually no need for names since they don't even show up?
      // maybe I should just put them in G somehow, idk
      const joinMatch = async () => {
        const { playerID, playerCredentials } = await lobbyClient.joinMatch("solstice", matchID, {
          playerName: "asd",
        });

        window.localStorage.setItem(`${matchID}_creds`, playerCredentials);
        window.localStorage.setItem(`${matchID}_id`, playerID);

        // FIXME surely there's a better way to reload?
        const { protocol, host } = window.location;
        window.location.replace(`${protocol}//${host}/${matchID}`);
      };

      joinMatch();
      return <div className="bgio-loading">joining...</div>;
    }
  }

  return <CreateLobby />;
};

export default App;
