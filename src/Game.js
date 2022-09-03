import { INVALID_MOVE } from 'boardgame.io/core';

export const boardSizes = {
  2: 3,
  3: 4,
  4: 5,
};

export const handSizes = {
  2: 9,
  3: 8,
  4: 7,
};

export const deck = [
  "dxxx",
  "xdxx",
  "xxdx",
  "xxxd",
  "ssxx",
  "xssx",
  "xxss",
  "sxxs",
  "sbxx",
  "xsbx",
  "xxsb",
  "bxxs",
  "bsxx",
  "xbsx",
  "xxbs",
  "sxxb",
  "bsbx",
  "xbsb",
  "bxbs",
  "sbxb",
  "sbsx",
  "xsbs",
  "sxsb",
  "bsxs",
  "xsss",
  "sxss",
  "ssxs",
  "sssx",
  "sxsx",
  "xsxs",
  "ssss",
  "soul",
];

// https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj
const shuffleArray = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

export const buildBoard = function(numPlayers) {
  const size = boardSizes[numPlayers];
  return Array(size * size).fill(null);
};

export const buildHands = function(numPlayers) {
  const size = handSizes[numPlayers];
  const hands = Array(numPlayers);
  const drawDeck = [...deck];
  shuffleArray(drawDeck);
  for(let i = 0; i < numPlayers; i++) {
    hands[i] = [];
    for(let j = 0; j < size; j++) {
      hands[i].push(drawDeck.pop());
    }
  }

  // dealer draws an extra piece
  hands[0].push(drawDeck.pop());
  return hands;
};

export const playPiece = function(G, ctx, piece, x, y, shieldBreak) {
  // special rules
  if(piece === "soul") {
    // soul piece can't be played in the first round
    if(ctx.turn <= ctx.numPlayers) {
      console.log("cannot play soul piece in first round");
      return false;
    }

    const target = getPiece(G, x, y);

    // soul piece _requires_ a piece to be there, _and_ it must be active
    if(target == null || !target.active) {
      console.log("soul piece must target another face-up piece");
      return false;
    }

    G.hands[ctx.currentPlayer].push(target.piece);
    G.board[y * G.boardSize + x].piece = "soul";
    ctx.events.endTurn({next: ctx.currentPlayer});
    return true;
  }

  // regular rules
  if(getPiece(G, x, y) != null) {
    console.log("pieces must be placed on an empty space");
    return false;
  }

  const neighbors = [
    getPiece(G, x, y - 1),
    getPiece(G, x + 1, y),
    getPiece(G, x, y + 1),
    getPiece(G, x - 1, y),
  ];

  // can't play adjacent to other pieces in the first round
  if(ctx.turn <= ctx.numPlayers) {
    for(let n = 0; n < neighbors.length; n++) {
      if(neighbors[n] !== null) {
        console.log("pieces must not be placed next to another piece in the first round");
        return false;
      }
    }
  }

  // used by double dots
  const nextNeighbors = [
    getPiece(G, x, y - 2),
    getPiece(G, x + 2, y),
    getPiece(G, x, y + 2),
    getPiece(G, x - 2, y),
  ];

  const flipNeighbor = function(neighbor, a) {
    if(neighbor === null) {
      return;
    }

    // (direction + 2) mod 4 conveniently gets the opposite-facing action
    const defense = neighbor.piece.charAt((a + 2) % 4);

    // if it's face up, flip it face down unless it's blocking
    if(neighbor.active && defense !== "b") {
      neighbor.active = false;
    }

    // if it's face down, flip it face up
    else if(!neighbor.active) {
      neighbor.active = true;
    }
  }

  // 4 directions, 4 actions, 4 neighbors
  for(let a = 0; a < 4; a++) {
    const action = piece.charAt(a);
    if(action === "s") { // single dot
      flipNeighbor(neighbors[a], a);
    }
    else if(action === "d") { // double dot
      console.log("shield break: " + shieldBreak);
      if(shieldBreak) {
        console.log("shield break");
        neighbors[a].active = !neighbors[a].active;
      }
      else {
        console.log("double tap");
        flipNeighbor(neighbors[a], a);
        flipNeighbor(nextNeighbors[a], a);
      }
    }
    else if(action === "b") { // block
      // noop
    }
    else if(action === "x") { // blank
      // noop
    }
  }

  G.board[y * G.boardSize + x] = {
    owner: ctx.currentPlayer,
    active: true,
    piece: piece,
  };

  return true;
}

export const getPiece = function(G, x, y) {
  if(x < 0 || x >= G.boardSize || y < 0 || y >= G.boardSize) {
    return null;
  }

  return G.board[y * G.boardSize + x];
}

export const Solstice = {
  name: 'solstice',

  setup: (ctx, setupData) => ({
    board: buildBoard(ctx.numPlayers),
    hands: buildHands(ctx.numPlayers),
    boardSize: boardSizes[ctx.numPlayers],
  }),

  // this is weird but I had to set it this way to fix the endTurn event
  turn: {
    minMoves: 1,
    maxMoves: 2,
  },

  moves: {
    playPiece: {
      client: false,
      move: (G, ctx, id, x, y, shieldBreak) => {
        const hand = G.hands[ctx.currentPlayer];
        const piece = hand[id];
        const success = playPiece(G, ctx, piece, x, y, shieldBreak);
        console.log("played piece: " + success);
        if(success) {
          hand.splice(id, 1);
        }
        else {
          return INVALID_MOVE;
        }
        console.log("turn end");
        ctx.events.endTurn();
      },
    },
  },

  playerView: (G, ctx, playerID) => {
    let copy = {...G};
    copy.hand = copy.hands[playerID];
    copy.hands = undefined;
    copy.player = playerID;
    copy.active = (playerID === ctx.currentPlayer);
    return copy;
  },

  endIf: (G, ctx) => {
    let nulls = 0;
    let scores = Array(ctx.numPlayers).fill(0);
    for(let i = 0; i < G.board.length; i++) {
      if(G.board[i] === null) {
        nulls++;
      }
      else {
        scores[G.board[i].owner] += G.board[i].active
      }
    }

    if(nulls === 1) {
      console.log("game end");
      let highest = 0;
      let winners = [];
      for(let i = 0; i < scores.length; i++) {
        if(scores[i] > highest) {
          highest = scores[i];
          winners = [i];
        }
        else if(scores[i] === highest) {
          winners.push(i);
        }
      }
      return {winners: winners};
    }
  },
};
