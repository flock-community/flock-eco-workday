import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon';

// Replaces the conventional moon on the dark-mode toggle: a nod to the
// shades-wearing flock on flock.community. The wayfarer silhouette, traced
// from the brand reference artwork, is knocked out of a filled disc so the
// icon matches the weight of the Material icons beside it — the disc
// treatment also echoes the Flock logo.
export function SunglassesIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path
        fillRule="evenodd"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM5.39 11.09C4.78 11.12 3.97 11.19 3.67 11.24C3.24 11.30 3.20 11.35 3.20 11.88L3.20 12.26 3.52 12.56L3.83 12.88 4.09 13.90C4.58 15.90 4.82 16.13 6.56 16.29C8.49 16.45 9.79 16.13 10.33 15.34C10.56 14.99 10.89 14.22 11.16 13.39C11.32 12.91 11.37 12.88 11.94 12.88C12.46 12.88 12.53 12.93 12.66 13.30C13.36 15.35 13.70 15.81 14.69 16.12C15.72 16.44 18.25 16.33 18.81 15.95C19.23 15.67 19.49 15.13 19.73 14.07C19.98 12.93 20.13 12.62 20.52 12.42C20.71 12.32 20.80 11.79 20.68 11.44C20.63 11.30 20.62 11.29 20.30 11.24C18.38 10.95 15.07 11.05 13.14 11.47C12.55 11.61 11.76 11.67 11.44 11.61C11.32 11.59 10.94 11.52 10.60 11.45C9.26 11.17 6.83 11.00 5.39 11.09Z"
      />
    </SvgIcon>
  );
}
