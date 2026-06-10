// Congkak game logic (turn-based variant, 7 holes per player + 1 store each).
//
// Board index layout (counter-clockwise):
//   0..6   -> Player 1 (bottom) houses, left to right
//   7      -> Player 1 store (right side)
//   8..14  -> Player 2 (top) houses
//   15     -> Player 2 store (left side)
//
// Player 1 sows: 0->..->6->7(store)->8->..->14->(skip 15)->0...
// Player 2 sows: 8->..->14->15(store)->0->..->6->(skip 7)->8...

export type Player = 1 | 2;

export const SEEDS_PER_HOLE = 7;
export const P1_STORE = 7;
export const P2_STORE = 15;
export const P1_HOLES = [0, 1, 2, 3, 4, 5, 6];
export const P2_HOLES = [8, 9, 10, 11, 12, 13, 14];

export type Board = number[];

export type GameState = {
  board: Board;
  turn: Player;
  finished: boolean;
  winner: Player | 'draw' | null;
  // Indices touched by the last sow, for highlighting in the UI.
  lastSown: number[];
};

export function createInitialState(starting: Player = 1): GameState {
  const board = new Array(16).fill(0);
  for (const i of [...P1_HOLES, ...P2_HOLES]) {
    board[i] = SEEDS_PER_HOLE;
  }
  return {
    board,
    turn: starting,
    finished: false,
    winner: null,
    lastSown: [],
  };
}

export function storeOf(player: Player): number {
  return player === 1 ? P1_STORE : P2_STORE;
}

export function holesOf(player: Player): number[] {
  return player === 1 ? P1_HOLES : P2_HOLES;
}

export function ownsHole(player: Player, index: number): boolean {
  return holesOf(player).includes(index);
}

// Opposite hole used for captures: 0<->14, 1<->13, ... 6<->8.
export function oppositeHole(index: number): number {
  return 14 - index;
}

// The next index in the sowing direction for a given player, skipping the
// opponent's store.
function nextIndex(index: number, player: Player): number {
  let next = (index + 1) % 16;
  const opponentStore = player === 1 ? P2_STORE : P1_STORE;
  if (next === opponentStore) {
    next = (next + 1) % 16;
  }
  return next;
}

export function legalMoves(state: GameState): number[] {
  if (state.finished) return [];
  return holesOf(state.turn).filter((i) => state.board[i] > 0);
}

function sideEmpty(board: Board, player: Player): boolean {
  return holesOf(player).every((i) => board[i] === 0);
}

// Sweep all remaining seeds into each player's own store (end of game).
function collectRemaining(board: Board): Board {
  const result = board.slice();
  for (const i of P1_HOLES) {
    result[P1_STORE] += result[i];
    result[i] = 0;
  }
  for (const i of P2_HOLES) {
    result[P2_STORE] += result[i];
    result[i] = 0;
  }
  return result;
}

function decideWinner(board: Board): Player | 'draw' {
  if (board[P1_STORE] > board[P2_STORE]) return 1;
  if (board[P2_STORE] > board[P1_STORE]) return 2;
  return 'draw';
}

/**
 * Apply a move (sowing seeds from `hole`) and return the resulting state.
 * Implements the classic mancala/congkak rules: extra turn when landing in
 * your own store, capture when landing in an empty hole on your own side.
 * Returns the unchanged state if the move is illegal.
 */
export function applyMove(state: GameState, hole: number): GameState {
  if (state.finished) return state;
  if (!ownsHole(state.turn, hole)) return state;
  if (state.board[hole] <= 0) return state;

  const player = state.turn;
  const board = state.board.slice();
  const sown: number[] = [];

  let seeds = board[hole];
  board[hole] = 0;
  let pos = hole;

  while (seeds > 0) {
    pos = nextIndex(pos, player);
    board[pos] += 1;
    seeds -= 1;
    sown.push(pos);
  }

  const ownStore = storeOf(player);
  let extraTurn = false;

  if (pos === ownStore) {
    // Landed in own store -> bonus turn.
    extraTurn = true;
  } else if (
    ownsHole(player, pos) &&
    board[pos] === 1 &&
    board[oppositeHole(pos)] > 0
  ) {
    // Landed in a previously empty hole on own side -> capture.
    const captured = board[pos] + board[oppositeHole(pos)];
    board[pos] = 0;
    board[oppositeHole(pos)] = 0;
    board[ownStore] += captured;
  }

  // Check for end of game: if either side is empty, the game is over.
  let finished = false;
  let finalBoard = board;
  if (sideEmpty(board, 1) || sideEmpty(board, 2)) {
    finalBoard = collectRemaining(board);
    finished = true;
  }

  const nextTurn: Player = extraTurn ? player : player === 1 ? 2 : 1;

  return {
    board: finalBoard,
    turn: finished ? player : nextTurn,
    finished,
    winner: finished ? decideWinner(finalBoard) : null,
    lastSown: sown,
  };
}

/**
 * Simple heuristic AI: prefer a bonus-turn move, then a capturing move,
 * otherwise the move that empties the most seeds. Returns null when no move
 * is available.
 */
export function chooseAiMove(state: GameState): number | null {
  const moves = legalMoves(state);
  if (moves.length === 0) return null;

  let bonus: number | null = null;
  let capture: number | null = null;
  let captureGain = 0;
  let fallback = moves[0];
  let fallbackSeeds = -1;

  for (const move of moves) {
    const result = applyMove(state, move);
    const player = state.turn;

    // Bonus turn: turn stays with the same player and game not finished.
    if (!result.finished && result.turn === player && bonus === null) {
      bonus = move;
    }

    // Capture: store grew by more than the single seed that would land there.
    const gain = result.board[storeOf(player)] - state.board[storeOf(player)];
    if (gain > 1 && gain > captureGain) {
      capture = move;
      captureGain = gain;
    }

    if (state.board[move] > fallbackSeeds) {
      fallbackSeeds = state.board[move];
      fallback = move;
    }
  }

  return bonus ?? capture ?? fallback;
}
