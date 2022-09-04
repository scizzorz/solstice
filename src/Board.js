import React, { useState } from 'react';

function Piece(piece, owner, selected, active, valid, onClick) {
  let classes = ["piece"];

  if(valid) {
    classes.push("valid");
  }

  if(selected) {
    classes.push("selected");
  }

  let img = "";
  if(piece !== null && piece !== undefined) {
    classes.push("p" + (parseInt(owner) + 1));
    classes.push(active ? "active" : "inactive");
    img = <img src={"/" +piece + ".svg"} alt={piece}/>;
  }

  const className = classes.join(" ");

  if(valid) {
    return <button className={className} onClick={onClick}>{img}</button>;
  }

  return <div className={className}>{img}</div>
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
      let valid = false;
      // const selected = (x === selX && y === selY);


      if(piece !== null) {
        // if we've picked the soul piece, highlight all face up pieces
        if(piece.active && selected !== "selected" && G.hand[selected] === "soul") {
          valid = true;
        }

        // if we've picked and placed a double dot, highlight the options
        if(selected !== "selected" && selX !== "x" && selY !== "y") {
          let { offX, offY }  = getOffset(G.hand[selected]);

          if(x === selX + offX && y === selY + offY) {
            valid = true;
          }
          else if(x === selX + offX * 2 && y === selY + offY * 2) {
            valid = true;
          }
        }
      }
      else {
        if(selected !== "selected") {
          if (selX === "x" && selY === "y") {
            // if we haven't picked the soul piece, highlight all empty spaces
            if(G.hand[selected] !== "soul") {

              // if it's the first round, don't highlight places with an adjacent neighbor
              const hasNeighbors = getPiece(x - 1, y) !== null || getPiece(x + 1, y) !== null || getPiece(x, y - 1) !== null || getPiece(x, y + 1) !== null;
              if(!isFirstRound || !hasNeighbors) {
                valid = true;
              }
            }
          }
          else {
            let { offX, offY }  = getOffset(G.hand[selected]);

            if(x === selX + offX && y === selY + offY) {
              valid = true;
            }
            else if(x === selX + offX * 2 && y === selY + offY * 2) {
              valid = true;
            }
          }
        }
      }

      let cell = Piece(piece?.piece, piece?.owner, (x === selX && y === selY), piece?.active, valid, () => clickBoard(x, y));

      cells.push(<td key={id}>{cell}</td>);
    }
    tbody.push(<tr key={y}>{cells}</tr>);
  }

  let hand = [];
  for(let h = 0; h < G.hand.length; h++) {
    // this nested if shit looks weird but it's actually necessary
    let valid = false;
    if(G.active) {
      if(G.hand[h] === "soul") {
        if(!isFirstRound) {
          valid = true;
        }
      }
      else {
        valid = true;
      }
    }

    let cell = Piece(G.hand[h], G.player, h === selected, true, valid, () => clickHand(h));
    hand.push(<div key={h}>{cell}</div>);
  }

  let boardClass = "n" + ctx.numPlayers;
  if(G.active) {
    boardClass += " active";
  }

  return (
    <div id="game" className={boardClass}>
      {winner}
      <table id="board">
        <tbody>{tbody}</tbody>
      </table>
      <div id="hand">{hand}</div>
    </div>
  );
}
