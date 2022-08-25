import React, { useState } from 'react';

export function SolsticeBoard({ ctx, G, moves }) {
  const [selected, setSelected] = useState("selected");
  const [selX, setX] = useState("x");
  const [selY, setY] = useState("y");

  const sendMove = function(id, x, y, shieldBreak) {
    moves.playPiece(id, x, y, shieldBreak === true);
    setSelected("selected");
    setX("x");
    setY("y");
  }

  const clickBoard = function(x, y) {
    if(selected !== "selected") {
      let piece = G.hand[selected];
      if(piece.indexOf("d") !== -1) { // we have a double dot selected
        if(selX === "x" && selY === "y") {
          setX(x);
          setY(y);
          console.log("need to pick shield break");
        }
        else {
          console.log("picking shield break");
          let offX = 0;
          let offY = 0;

          if(piece === "dxxx") {
            offY = -1;
          }
          else if(piece === "xdxx") {
            offX = 1;
          }
          else if(piece === "xxdx") {
            offY = 1;
          }
          else if(piece === "xxxd") {
            offX = -1;
          }

          if(x === selX + offX && y === selY + offY) {
            console.log("shield break");
            sendMove(selected, selX, selY, true);
          }
          else if(x === selX + offX * 2 && y === selY + offY * 2) {
            console.log("double tap");
            sendMove(selected, selX, selY, false);
          }
          else if(x === selX && y === selY) {
            // FIXME this is an edge case until I add better logic about board edge finding
            console.log("shield break");
            sendMove(selected, selX, selY, true);
          }
        }
      }
      else {
        sendMove(selected, x, y);
      }
    }
    else if(x === selX && y === selY) {
      setX("x");
      setY("y");
    }
    else {
      setX(x);
      setY(y);
    }
  }

  const clickHand = function(id) {
    if(selX !== "x" && selY !== "y") {
      if(G.hand[id].indexOf("d") !== -1) {
        setSelected(id);
        console.log("need to pick shield break");
      }
      else {
        sendMove(id, selX, selY);
      }
    }
    else if(id === selected) {
      setSelected("selected");
    }
    else {
      setSelected(id);
    }
  }

  let winnerClassName = "p" + (parseInt(ctx.currentPlayer) + 1);
  let winner = <div id="winner" className={winnerClassName}>Player {parseInt(ctx.currentPlayer) + 1} turn</div>;
  if (ctx.gameover) {
    if(ctx.gameover.winners.length > 1) {
      winner = <div id="winner">Draw!</div>;
    } else {
      winnerClassName = "p" + (ctx.gameover.winners[0] + 1);
      winner = <div id="winner" className={winnerClassName}>Player {ctx.gameover.winners[0] + 1} wins!</div>;
    }
  }

  let tbody = [];
  for(let y = 0; y < G.boardSize; y++) {
    let cells = [];
    for(let x = 0; x < G.boardSize; x++) {
      let id = y * G.boardSize + x;
      let className = "cell";
      if(x === selX && y === selY) {
        className += " selected";
      }

      let cell = <button className={className} onClick={() => clickBoard(x, y)} />;

      if(G.board[id] !== null) {
        let owner = parseInt(G.board[id].owner) + 1;
        className += " p" + owner;
        if(G.board[id].active) {
          className += " active";
        }
        else {
          className += " inactive";
        }

        let url = "/" + G.board[id].piece + ".svg";
        cell = <button className={className} onClick={() => clickBoard(x, y)}><img src={url} alt={G.board[id].piece}/></button>;
      }

      cells.push(
        <td key={id}>
          {cell}
        </td>
      );
    }
    tbody.push(<tr key={y}>{cells}</tr>);
  }

  let hand = [];
  let owner = parseInt(G.player) + 1;
  for(let h = 0; h < G.hand.length; h++) {
    let className = "active cell p" + owner;
    if(h === selected) {
      className += " selected";
    }

    let url = "/" + G.hand[h] + ".svg";
    hand.push(
      <div key={h}>
        <button className={className} onClick={() => clickHand(h)}><img src={url} alt={G.hand[h]}/></button>
      </div>
    );
  }

  let boardClass = "board n" + ctx.numPlayers;
  if(G.active) {
    boardClass += " active";
  }

  return (
    <div className={boardClass}>
      {winner}
      <table id="board">
        <tbody>{tbody}</tbody>
      </table>
      <div id="hand">{hand}</div>
    </div>
  );
}
