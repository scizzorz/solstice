import React, { useState } from 'react';

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

  const getOffset = function(piece) {
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

    return {offX: offX, offY: offY};
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

          if(x + offX < 0 || x + offX >= G.boardSize || y + offY < 0 || y + offY >= G.boardSize) {
            console.log("just kidding!");
            sendMove(selected, x, y, false);
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
      const piece = getPiece(x, y);
      const id = y * G.boardSize + x;
      let className = "cell";

      // only useful when picking shield break
      if(x === selX && y === selY) {
        className += " selected";
      }

      let cell = <span>replace me</span>;

      if(piece !== null) {
        let owner = parseInt(piece.owner) + 1;
        className += " p" + owner;
        if(piece.active) {
          className += " active";

          // if we've picked the soul piece, highlight all face up pieces
          if(selected !== "selected" && G.hand[selected] === "soul") {
            className += " valid";
          }
        }
        else {
          className += " inactive";
        }

        if(selected !== "selected" && selX !== "x" && selY !== "y") {
          let { offX, offY }  = getOffset(G.hand[selected]);

          if(x === selX + offX && y === selY + offY) {
            className += " valid";
          }
          else if(x === selX + offX * 2 && y === selY + offY * 2) {
            className += " valid";
          }
        }

        let url = "/" + piece.piece + ".svg";
        let img = <img src={url} alt={piece.piece}/>;

        if(className.indexOf("valid") !== -1) {
          cell = <button className={className} onClick={() => clickBoard(x, y)}>
            {img}
          </button>;
        }
        else {
          cell = <div className={className}>{img}</div>
        }
      }
      else {
        if(selected !== "selected") {
          if (selX === "x" && selY === "y") {
            // if we haven't picked the soul piece, highlight all empty spaces
            if(G.hand[selected] !== "soul") {
              const hasNeighbors = getPiece(x - 1, y) !== null || getPiece(x + 1, y) !== null || getPiece(x, y - 1) !== null || getPiece(x, y + 1) !== null;
              if(!isFirstRound || !hasNeighbors) {
                className += " valid";
              }
            }
          }
          else {
            let { offX, offY }  = getOffset(G.hand[selected]);

            if(x === selX + offX && y === selY + offY) {
              className += " valid";
            }
            else if(x === selX + offX * 2 && y === selY + offY * 2) {
              className += " valid";
            }
          }
        }

        if(className.indexOf("valid") !== -1) {
          cell = <button className={className} onClick={() => clickBoard(x, y)} />;
        }
        else {
          cell = <div className={className} />;
        }
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

    // this nested if shit looks weird but it's actually necessary
    if(G.active) {
      if(G.hand[h] === "soul") {
        if(!isFirstRound) {
          className += " valid";
        }
      }
      else {
        className += " valid";
      }
    }

    if(h === selected) {
      className += " selected";
    }

    let url = "/" + G.hand[h] + ".svg";
    let img = <img src={url} alt={G.hand[h]}/>;
    let cell = <div className={className}>{img}</div>;
    if(className.indexOf("valid") !== -1) {
      cell = <button className={className} onClick={() => clickHand(h)}>
        {img}
      </button>;
    }

    hand.push(<div key={h}>{cell}</div>);
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
