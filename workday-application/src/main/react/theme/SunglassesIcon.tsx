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
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM5.39 9.89C4.78 9.92 3.97 9.99 3.67 10.04C3.24 10.10 3.20 10.15 3.20 10.68L3.20 11.06 3.52 11.36L3.83 11.68 4.09 12.70C4.58 14.70 4.82 14.93 6.56 15.09C8.49 15.25 9.79 14.93 10.33 14.14C10.56 13.79 10.89 13.02 11.16 12.19C11.32 11.71 11.37 11.68 11.94 11.68C12.46 11.68 12.53 11.73 12.66 12.10C13.36 14.15 13.70 14.61 14.69 14.92C15.72 15.24 18.25 15.13 18.81 14.75C19.23 14.47 19.49 13.93 19.73 12.87C19.98 11.73 20.13 11.42 20.52 11.22C20.71 11.12 20.80 10.59 20.68 10.24C20.63 10.10 20.62 10.09 20.30 10.04C18.38 9.75 15.07 9.85 13.14 10.27C12.55 10.41 11.76 10.47 11.44 10.41C11.32 10.39 10.94 10.32 10.60 10.25C9.26 9.97 6.83 9.80 5.39 9.89Z"
      />
    </SvgIcon>
  );
}
