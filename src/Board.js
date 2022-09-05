import React, { useState } from 'react';
import { lobbyClient } from './Base';

function Piece(label, owner, selected, active, valid, onClick) {
  let classes = ["piece"];

  if(valid) {
    classes.push("valid");
  }

  if(selected) {
    classes.push("selected");
  }

  let img = "";
  if(label !== null && label !== undefined) {
    classes.push("p" + (parseInt(owner) + 1));
    classes.push(active ? "active" : "inactive");
    img = <img src={"/" +label + ".svg"} alt={label}/>;
  }

  const className = classes.join(" ");

  if(valid) {
    return <button className={className} onClick={onClick}>{img}</button>;
  }

  return <div className={className}>{img}</div>
}

function getOffset(label) {
  let offX = 0;
  let offY = 0;

  if(label === "dxxx") {
    offY = -1;
  }
  else if(label === "xdxx") {
    offX = 1;
  }
  else if(label === "xxdx") {
    offY = 1;
  }
  else if(label === "xxxd") {
    offX = -1;
  }

  return {offX: offX, offY: offY};
}

export function SolsticeBoard({ ctx, G, moves }) {
  const [selected, setSelected] = useState("selected");
  const [selX, setX] = useState("x");
  const [selY, setY] = useState("y");

  const isFirstRound = ctx.turn <= ctx.numPlayers;

  const getPiece = function(x, y) {
    if(x < 0 || y < 0 || x >= G.boardSize || y >= G.boardSize) {
      return null;
    }

    return G.board[y * G.boardSize + x];
  }

  const sendMove = function(id, x, y, shieldBreak) {
    moves.playPiece(id, x, y, shieldBreak === true);
    setSelected("selected");
    setX("x");
    setY("y");
  }

  const clickBoard = function(x, y) {
    if(!G.active) {
      return;
    }

    if(selected !== "selected") {
      let piece = G.hand[selected];
      if(piece.indexOf("d") !== -1) { // we have a double dot selected
        let { offX, offY } = getOffset(piece);

        if(selX === "x" && selY === "y") {
          setX(x);
          setY(y);
          console.log("need to pick shield break");

          const n1 = getPiece(x + offX, y + offY);
          const n2 = getPiece(x + offX * 2, y + offY * 2);

          if(n1 === null) {
            console.log("just kidding! nothing to shield break.");
            sendMove(selected, x, y, false);
          }
          else if(n2 === null) {
            console.log("just kidding! nothing to double tap.");
            sendMove(selected, x, y, true);
          }
        }
        else {
          console.log("picking shield break");
          if(x === selX + offX && y === selY + offY) {
            console.log("shield break");
            sendMove(selected, selX, selY, true);
          }
          else if(x === selX + offX * 2 && y === selY + offY * 2) {
            console.log("double tap");
            sendMove(selected, selX, selY, false);
          }
        }
      }
      else {
        sendMove(selected, x, y);
      }
    }
  }

  const clickHand = function(id) {
    if(!G.active) {
      return;
    }

    if(id === selected) {
      setSelected("selected");
      setX("x");
      setY("y");
    }
    else {
      setSelected(id);
      setX("x");
      setY("y");
    }
  }

  const playAgain = async () => {
    const matchID = window.location.pathname.substr(1);
    const id = window.localStorage.getItem(`${matchID}_id`);
    const creds = window.localStorage.getItem(`${matchID}_creds`);
    const { nextMatchID } = await lobbyClient.playAgain("solstice", matchID, {
      playerID: id,
      credentials: creds,
    });

    const { protocol, host } = window.location;
    window.location.replace(`${protocol}//${host}/${nextMatchID}`);
  };

  // borrow the winner display to show whose turn it is
  let winnerClassName = "p" + (parseInt(ctx.currentPlayer) + 1);
  let winner = <div id="winner" className={winnerClassName}>Player {parseInt(ctx.currentPlayer) + 1} turn</div>;

  // unless it's actually game over
  if (ctx.gameover) {
    if(ctx.gameover.winners.length > 1) {
      winner = <div id="winner">
        Draw!
        <button onClick={playAgain}>play again</button>
      </div>;
    } else {
      winnerClassName = "p" + (ctx.gameover.winners[0] + 1);
      winner = <div id="winner" className={winnerClassName}>
        Player {ctx.gameover.winners[0] + 1} wins!
        <button onClick={playAgain}>play again</button>
      </div>;
    }
  }

  let tbody = [];
  for(let y = 0; y < G.boardSize; y++) {
    let cells = [];
    for(let x = 0; x < G.boardSize; x++) {
      const piece = getPiece(x, y);
      const id = y * G.boardSize + x;
      let valid = false;

      // only highlight valid moves if we've selected a piece from our hand
      if(selected !== "selected") {
        // if we've picked and placed a double dot, highlight the options
        if(selX !== "x" && selY !== "y") {
          let { offX, offY }  = getOffset(G.hand[selected]);

          valid = [
            x === selX + offX && y === selY + offY,
            x === selX + offX * 2 && y === selY + offY * 2,
          ].some(x => !!x);
        }

        // if we've picked the soul piece, highlight all face up pieces
        else if(piece !== null && piece.active && G.hand[selected] === "soul") {
          valid = true;
        }

        // if we haven't picked the soul piece, highlight all empty spaces
        // but if it's the first round, don't highlight places with an adjacent neighbor
        else if(selX === "x" && selY === "y" && G.hand[selected] !== "soul") {
          const hasNeighbors = [
            getPiece(x, y), // technically not a "neighbor", but... well.
            getPiece(x - 1, y),
            getPiece(x + 1, y),
            getPiece(x, y - 1),
            getPiece(x, y + 1),
          ].some(x => x !== null);

          valid = !isFirstRound || !hasNeighbors;
        }
      }

      const cell = Piece(
        piece?.piece,
        piece?.owner,
        (x === selX && y === selY),
        piece?.active,
        valid && !ctx.gameover,
        () => clickBoard(x, y),
      );
      cells.push(<td key={id}>{cell}</td>);
    }
    tbody.push(<tr key={y}>{cells}</tr>);
  }

  let hand = [];
  for(let h = 0; h < G.hand.length; h++) {
    let valid = false;
    // only let the player pick from their hand if it's their turn and the game isn't over
    if(G.active && !ctx.gameover) {
      // basically just can't play the soul piece on round 1
      valid = (G.hand[h] === "soul" && !isFirstRound) || (G.hand[h] !== "soul");
    }

    const cell = Piece(
      G.hand[h],
      G.player,
      h === selected,
      true,
      valid,
      () => clickHand(h),
    );
    hand.push(<div key={h}>{cell}</div>);
  }

  return (
    <div id="game" className={"n" + ctx.numPlayers}>
      {winner}
      <table id="board">
        <tbody>{tbody}</tbody>
      </table>
      <div id="hand">{hand}</div>
    </div>
  );
}
