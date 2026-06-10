import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  Paper,
  Switch,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  applyMove,
  chooseAiMove,
  createInitialState,
  type GameState,
  legalMoves,
  P1_HOLES,
  P1_STORE,
  P2_HOLES,
  P2_STORE,
  type Player,
} from './congkak';

const BOARD_NAME = 'Ferd Veelenturf';

const COLORS = {
  board: '#8d5524',
  boardDark: '#6f4119',
  hole: '#caa472',
  holeShadow: '#5c3a17',
  store: '#b8854f',
  seed: '#f2e2c4',
  highlight: '#ffd54f',
  engrave: '#5c3a17',
};

function Seeds({ count }: { count: number }) {
  return (
    <Typography
      component="span"
      sx={{
        fontWeight: 700,
        fontSize: '1.4rem',
        color: COLORS.holeShadow,
        userSelect: 'none',
      }}
    >
      {count}
    </Typography>
  );
}

type HoleProps = {
  seeds: number;
  playable: boolean;
  highlighted: boolean;
  onClick: () => void;
};

function Hole({ seeds, playable, highlighted, onClick }: HoleProps) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={!playable}
      sx={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        border: 'none',
        cursor: playable ? 'pointer' : 'default',
        background: `radial-gradient(circle at 50% 35%, ${COLORS.hole}, ${COLORS.holeShadow})`,
        boxShadow: highlighted
          ? `0 0 0 4px ${COLORS.highlight}, inset 0 4px 8px rgba(0,0,0,0.45)`
          : 'inset 0 4px 8px rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 120ms ease, box-shadow 120ms ease',
        outline: playable ? `2px solid ${COLORS.highlight}` : 'none',
        outlineOffset: 2,
        '&:hover': playable ? { transform: 'scale(1.08)' } : {},
      }}
    >
      <Seeds count={seeds} />
    </Box>
  );
}

function Store({ seeds, label }: { seeds: number; label: string }) {
  return (
    <Box
      sx={{
        width: 80,
        minHeight: 200,
        borderRadius: 40,
        background: `radial-gradient(circle at 50% 25%, ${COLORS.store}, ${COLORS.holeShadow})`,
        boxShadow: 'inset 0 6px 14px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
      }}
    >
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: '2rem',
          color: COLORS.seed,
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        }}
      >
        {seeds}
      </Typography>
      <Typography
        sx={{ fontSize: '0.7rem', color: COLORS.seed, opacity: 0.85 }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export function CongkakFeature() {
  const [state, setState] = useState<GameState>(() => createInitialState(1));
  const [vsComputer, setVsComputer] = useState(true);
  const aiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const moves = useMemo(() => legalMoves(state), [state]);
  const moveSet = useMemo(() => new Set(moves), [moves]);
  const highlighted = useMemo(() => new Set(state.lastSown), [state.lastSown]);

  const play = useCallback((hole: number) => {
    setState((prev) => applyMove(prev, hole));
  }, []);

  // Let the computer take Player 2's turn when enabled.
  useEffect(() => {
    if (aiTimer.current) {
      clearTimeout(aiTimer.current);
      aiTimer.current = null;
    }
    if (vsComputer && !state.finished && state.turn === 2) {
      aiTimer.current = setTimeout(() => {
        const move = chooseAiMove(state);
        if (move !== null) {
          setState((prev) => applyMove(prev, move));
        }
      }, 650);
    }
    return () => {
      if (aiTimer.current) clearTimeout(aiTimer.current);
    };
  }, [state, vsComputer]);

  const reset = (starting: Player = 1) =>
    setState(createInitialState(starting));

  const humanTurn = !vsComputer || state.turn === 1;

  const statusText = (() => {
    if (state.finished) {
      if (state.winner === 'draw') return "It's a draw!";
      const name =
        vsComputer && state.winner === 2
          ? 'Computer'
          : `Player ${state.winner}`;
      return `${name} wins! 🎉`;
    }
    if (vsComputer && state.turn === 2) return 'Computer is thinking…';
    return `Player ${state.turn}'s turn`;
  })();

  const isPlayable = (player: Player, index: number) =>
    !state.finished && state.turn === player && humanTurn && moveSet.has(index);

  return (
    <Box
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
      }}
    >
      <Typography variant="h2">Congkak</Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <Chip
          label={statusText}
          color={state.finished ? 'success' : 'primary'}
          sx={{ fontWeight: 600 }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={vsComputer}
              onChange={(e) => {
                setVsComputer(e.target.checked);
                reset(1);
              }}
            />
          }
          label="Vs computer"
        />
        <Button variant="outlined" onClick={() => reset(1)}>
          New game
        </Button>
      </Box>

      <Paper
        elevation={8}
        sx={{
          p: 3,
          borderRadius: 8,
          background: `linear-gradient(145deg, ${COLORS.board}, ${COLORS.boardDark})`,
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 2 }}>
          {/* Player 2 store on the left */}
          <Store seeds={state.board[P2_STORE]} label="Player 2" />

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 2,
              position: 'relative',
            }}
          >
            {/* Player 2 (top) row, shown right-to-left for circular layout */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {[...P2_HOLES].reverse().map((i) => (
                <Hole
                  key={i}
                  seeds={state.board[i]}
                  playable={isPlayable(2, i)}
                  highlighted={highlighted.has(i)}
                  onClick={() => play(i)}
                />
              ))}
            </Box>

            {/* Engraved board name */}
            <Box
              sx={{
                textAlign: 'center',
                py: 1,
                userSelect: 'none',
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Brush Script MT", "Segoe Script", cursive',
                  fontSize: '1.9rem',
                  fontWeight: 700,
                  color: COLORS.engrave,
                  letterSpacing: 2,
                  textShadow: '0 1px 0 rgba(255,255,255,0.18)',
                }}
              >
                {BOARD_NAME}
              </Typography>
            </Box>

            {/* Player 1 (bottom) row, left-to-right */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {P1_HOLES.map((i) => (
                <Hole
                  key={i}
                  seeds={state.board[i]}
                  playable={isPlayable(1, i)}
                  highlighted={highlighted.has(i)}
                  onClick={() => play(i)}
                />
              ))}
            </Box>
          </Box>

          {/* Player 1 store on the right */}
          <Store seeds={state.board[P1_STORE]} label="Player 1" />
        </Box>
      </Paper>

      <Box sx={{ maxWidth: 560 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Pick a hole on your side to sow its seeds counter-clockwise. Land your
          last seed in your own store for a bonus turn, or in an empty hole on
          your side to capture the seeds opposite. The player with the most
          seeds in their store when a side empties wins.
        </Typography>
      </Box>
    </Box>
  );
}

export default CongkakFeature;
