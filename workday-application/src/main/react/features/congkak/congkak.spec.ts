import {
  applyMove,
  chooseAiMove,
  createInitialState,
  legalMoves,
  oppositeHole,
  P1_STORE,
  P2_STORE,
  SEEDS_PER_HOLE,
} from './congkak';

describe('congkak logic', () => {
  it('starts with the correct seed distribution', () => {
    const state = createInitialState(1);
    expect(state.board[P1_STORE]).toBe(0);
    expect(state.board[P2_STORE]).toBe(0);
    const total = state.board.reduce((a, b) => a + b, 0);
    expect(total).toBe(14 * SEEDS_PER_HOLE);
    expect(state.turn).toBe(1);
  });

  it('never loses or creates seeds when sowing', () => {
    const state = createInitialState(1);
    const next = applyMove(state, 0);
    const total = next.board.reduce((a, b) => a + b, 0);
    expect(total).toBe(14 * SEEDS_PER_HOLE);
  });

  it('grants a bonus turn when the last seed lands in your store', () => {
    // A single seed in hole 6 lands exactly in the P1 store (index 7).
    const state = createInitialState(1);
    state.board[6] = 1;
    const next = applyMove(state, 6);
    expect(next.board[P1_STORE]).toBe(1);
    expect(next.turn).toBe(1); // bonus turn keeps Player 1
  });

  it('passes the turn to the opponent on a normal move', () => {
    // Hole 1 with 7 seeds ends on an opponent hole (index 8): no bonus.
    const state = createInitialState(1);
    expect(state.board[1]).toBe(SEEDS_PER_HOLE);
    const next = applyMove(state, 1);
    expect(next.turn).toBe(2);
  });

  it('captures from the opposite hole when landing in an empty own hole', () => {
    const state = createInitialState(1);
    // Empty out hole 2 so a single seed landing there triggers a capture.
    state.board[2] = 0;
    state.board[1] = 1; // one seed in hole 1 lands in empty hole 2
    const opposite = oppositeHole(2);
    const oppositeSeeds = state.board[opposite];
    const next = applyMove(state, 1);
    expect(next.board[2]).toBe(0);
    expect(next.board[opposite]).toBe(0);
    expect(next.board[P1_STORE]).toBe(oppositeSeeds + 1);
    expect(next.turn).toBe(2);
  });

  it('reports only legal moves for the active player', () => {
    const state = createInitialState(2);
    const moves = legalMoves(state);
    expect(moves).toEqual([8, 9, 10, 11, 12, 13, 14]);
  });

  it('ignores illegal moves', () => {
    const state = createInitialState(1);
    // Hole 8 belongs to Player 2; Player 1 cannot play it.
    expect(applyMove(state, 8)).toBe(state);
  });

  it('finishes the game and assigns remaining seeds to the stores', () => {
    const state = createInitialState(1);
    // Force Player 1's side to be nearly empty.
    for (let i = 0; i <= 6; i++) state.board[i] = 0;
    state.board[6] = 1; // last seed lands in the store, emptying the side
    const next = applyMove(state, 6);
    expect(next.finished).toBe(true);
    const total = next.board.reduce((a, b) => a + b, 0);
    expect(next.board[P1_STORE] + next.board[P2_STORE]).toBe(total);
    expect(['draw', 1, 2]).toContain(next.winner);
  });

  it('produces a legal AI move', () => {
    const state = createInitialState(2);
    const move = chooseAiMove(state);
    expect(legalMoves(state)).toContain(move);
  });
});
