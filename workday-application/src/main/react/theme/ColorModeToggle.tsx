import LightModeIcon from '@mui/icons-material/LightMode';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useColorMode } from './ColorMode';
import { SunglassesIcon } from './SunglassesIcon';

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
        {mode === 'light' ? <SunglassesIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
