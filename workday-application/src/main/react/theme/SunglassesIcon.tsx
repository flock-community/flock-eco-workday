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
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM5.39 9.39C4.78 9.42 3.97 9.49 3.67 9.54C3.24 9.60 3.20 9.65 3.20 10.18L3.20 10.56 3.52 10.86L3.83 11.18 4.09 12.20C4.58 14.20 4.82 14.43 6.56 14.59C8.49 14.75 9.79 14.43 10.33 13.64C10.56 13.29 10.89 12.52 11.16 11.69C11.32 11.21 11.37 11.18 11.94 11.18C12.46 11.18 12.53 11.23 12.66 11.60C13.36 13.65 13.70 14.11 14.69 14.42C15.72 14.74 18.25 14.63 18.81 14.25C19.23 13.97 19.49 13.43 19.73 12.37C19.98 11.23 20.13 10.92 20.52 10.72C20.71 10.62 20.80 10.09 20.68 9.74C20.63 9.60 20.62 9.59 20.30 9.54C18.38 9.25 15.07 9.35 13.14 9.77C12.55 9.91 11.76 9.97 11.44 9.91C11.32 9.89 10.94 9.82 10.60 9.75C9.26 9.47 6.83 9.30 5.39 9.39Z"
      />
    </SvgIcon>
  );
}
