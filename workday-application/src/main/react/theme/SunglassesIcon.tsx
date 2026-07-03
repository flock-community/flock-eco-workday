import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon';

// Replaces the conventional moon on the dark-mode toggle: a nod to the
// shades-wearing flock on flock.community. Browline bar with deep rounded
// lenses, sized to match the optical weight of the Material icons beside it.
export function SunglassesIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M3 7h18a1 1 0 0 1 0 2H3a1 1 0 0 1 0-2Zm0 2h7.25v5a2.5 2.5 0 0 1-2.5 2.5H5.5A2.5 2.5 0 0 1 3 14Zm10.75 0H21v5a2.5 2.5 0 0 1-2.5 2.5h-2.25a2.5 2.5 0 0 1-2.5-2.5Z" />
    </SvgIcon>
  );
}
