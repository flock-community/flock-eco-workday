import DarkModeIcon from '@mui/icons-material/Bedtime';
import LightModeIcon from '@mui/icons-material/LightModeOutlined';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useColorMode } from './ColorMode';

export function ColorModeToggle(props: IconButtonProps) {
  const { mode, toggle } = useColorMode();
  const next = mode === 'light' ? 'dark' : 'light';

  return (
    <Tooltip title={`Switch to ${next} mode`}>
      <IconButton
        color="inherit"
        onClick={toggle}
        aria-label={`Switch to ${next} mode`}
        {...props}
      >
        {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
