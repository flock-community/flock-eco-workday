import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  SvgIcon,
  type SvgIconProps,
  Typography,
} from '@mui/material';

export const APP_STORE_URL =
  'https://apps.apple.com/app/flock-community/id6776249';
export const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=community.flock.mobile';

/**
 * Points people to the Flock mobile app, with a button per store in the same
 * pill style as the quick actions on the home page.
 */
export function FlockAppCard() {
  return (
    <Card
      variant={'outlined'}
      data-testid={'flock-app-card'}
      sx={{ borderRadius: '14px' }}
    >
      <CardHeader title={'Flock app'} />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography color={'text.secondary'}>
          Get the Flock app on your phone.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <StoreButton
            href={APP_STORE_URL}
            icon={<AppleIcon />}
            label={'App Store'}
            ariaLabel={'Download on the App Store'}
          />
          <StoreButton
            href={PLAY_STORE_URL}
            icon={<GooglePlayIcon />}
            label={'Google Play'}
            ariaLabel={'Get it on Google Play'}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

type StoreButtonProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  ariaLabel: string;
};

function StoreButton({ href, icon, label, ariaLabel }: StoreButtonProps) {
  return (
    <Button
      variant={'outlined'}
      href={href}
      target={'_blank'}
      rel={'noopener noreferrer'}
      aria-label={ariaLabel}
      startIcon={icon}
      sx={{ borderRadius: '999px', textTransform: 'none' }}
    >
      {label}
    </Button>
  );
}

function AppleIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox={'0 0 24 24'}>
      <path d="M16.37 12.62c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.76 2.28-1.6 2.78-.41 6.9 1.15 9.15.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.77-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.39-.92-2.41-3.65zM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.02.61-2.67 1.37-.58.67-1.1 1.76-.96 2.8 1.02.08 2.06-.52 2.69-1.28z" />
    </SvgIcon>
  );
}

function GooglePlayIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox={'0 0 24 24'}>
      <path d="M4.6 2.2c-.3.3-.5.8-.5 1.4v16.8c0 .6.2 1.1.5 1.4l9.4-9.8zm10.6 8.6 2.9-3L6.4 1.3c-.5-.3-1-.3-1.3-.1zm0 2.4L5.1 22.8c.3.2.8.2 1.3-.1l11.7-6.5zm1.2-1.2 3.1 3.2 2.3-1.3c1.2-.7 1.2-2.5 0-3.2l-2.3-1.3z" />
    </SvgIcon>
  );
}
