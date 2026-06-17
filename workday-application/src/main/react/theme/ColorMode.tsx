import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { type ColorMode, createAppTheme } from './createAppTheme';

const STORAGE_KEY = 'workday-color-mode';

type ColorModeContextValue = {
  mode: ColorMode;
  toggle: () => void;
  setMode: (mode: ColorMode) => void;
};

const ColorModeContext = createContext<ColorModeContextValue>({
  mode: 'light',
  toggle: () => {},
  setMode: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);

function resolveInitialMode(): ColorMode {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ColorMode>(resolveInitialMode);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const value = useMemo<ColorModeContextValue>(
    () => ({
      mode,
      setMode,
      toggle: () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
    }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
