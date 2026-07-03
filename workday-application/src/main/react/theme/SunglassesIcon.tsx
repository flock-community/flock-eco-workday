import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon';

// Replaces the conventional moon on the dark-mode toggle: a nod to the
// shades-wearing flock on flock.community. Wayfarer silhouette with a flat
// brow line and tapered lenses, so it reads as sunglasses even at 24px.
export function SunglassesIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M2.1 7.9H10.4C10.9 7.9 11.2 9.2 12 9.2C12.8 9.2 13.1 7.9 13.6 7.9H21.9C21.8 10.3 21.4 13.4 20.9 14.4C20.45 15.3 19.6 15.68 18.5 15.7L15.6 15.7C14.55 15.66 14.05 15.25 13.8 14.4L12.7 10.6C12.5 10.15 11.5 10.15 11.3 10.6L10.2 14.4C9.95 15.25 9.45 15.66 8.4 15.7L5.5 15.7C4.4 15.68 3.55 15.3 3.1 14.4C2.6 13.4 2.2 10.3 2.1 7.9Z" />
    </SvgIcon>
  );
}
