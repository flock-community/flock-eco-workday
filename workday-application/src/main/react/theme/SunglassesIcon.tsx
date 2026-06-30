import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon';

// Replaces the conventional moon on the dark-mode toggle: a nod to the
// shades-wearing flock on flock.community.
export function SunglassesIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M 1.9 8.5 C 6 7.95 9.5 8.7 12 9.7 C 14.5 8.7 18 7.95 22.1 8.5 C 22.5 8.6 22.6 8.9 22.5 9.4 C 22.2 12.4 21.6 14.2 20.4 15.0 C 19.6 15.5 18.0 15.7 16.6 15.6 C 15.2 15.5 14.4 15.1 14.0 13.9 C 13.6 12.6 13.2 11.3 12.6 10.6 C 12.4 10.4 11.6 10.4 11.4 10.6 C 10.8 11.3 10.4 12.6 10.0 13.9 C 9.6 15.1 8.8 15.5 7.4 15.6 C 6.0 15.7 4.4 15.5 3.6 15.0 C 2.4 14.2 1.8 12.4 1.5 9.4 C 1.4 8.9 1.5 8.6 1.9 8.5 Z" />
    </SvgIcon>
  );
}
