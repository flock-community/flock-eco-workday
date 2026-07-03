import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon';

// Replaces the conventional moon on the dark-mode toggle: a nod to the
// shades-wearing flock on flock.community. Wayfarer silhouette traced from
// the brand reference artwork and fitted to the 24px Material icon grid.
export function SunglassesIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4.49 9.03C3.79 9.07 2.88 9.15 2.53 9.20C2.04 9.27 2.00 9.33 2.00 9.93L2.00 10.36 2.36 10.71L2.72 11.07 3.01 12.23C3.57 14.50 3.84 14.76 5.82 14.94C8.01 15.13 9.49 14.76 10.10 13.86C10.36 13.47 10.74 12.59 11.05 11.65C11.23 11.10 11.28 11.07 11.93 11.07C12.52 11.07 12.60 11.12 12.75 11.54C13.55 13.88 13.93 14.40 15.06 14.75C16.23 15.11 19.10 14.99 19.74 14.56C20.22 14.24 20.51 13.63 20.78 12.42C21.07 11.13 21.24 10.77 21.68 10.55C21.90 10.43 22.00 9.83 21.86 9.43C21.81 9.27 21.80 9.26 21.43 9.21C19.25 8.87 15.49 8.99 13.30 9.47C12.62 9.62 11.73 9.69 11.36 9.63C11.23 9.60 10.80 9.52 10.41 9.44C8.89 9.12 6.13 8.93 4.49 9.03" />
    </SvgIcon>
  );
}
