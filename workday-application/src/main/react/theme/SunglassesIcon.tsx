import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon';

// Replaces the conventional moon on the dark-mode toggle: a nod to the
// shades-wearing flock on flock.community. The wayfarer silhouette is knocked
// out of a filled disc so the icon carries the same weight as the Material
// icons beside it — the disc treatment also echoes the Flock logo.
export function SunglassesIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <path
        fillRule="evenodd"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM4.73 9.62c2.95-.39 5.47.15 7.27.87 1.8-.72 4.32-1.26 7.27-.87.29.08.36.29.29.65-.22 2.16-.65 3.46-1.51 4.03-.58.36-1.73.51-2.74.44-1.01-.08-1.58-.36-1.87-1.23-.29-.93-.58-1.87-1.01-2.37-.14-.15-.72-.15-.86 0-.43.5-.72 1.44-1.01 2.37-.29.87-.86 1.15-1.87 1.23-1.01.07-2.16-.08-2.74-.44-.86-.57-1.29-1.87-1.51-4.03-.07-.36 0-.57.29-.65Z"
      />
    </SvgIcon>
  );
}
