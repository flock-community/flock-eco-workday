import { Box, Card, CardContent, CardHeader, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { WorkdayLogo } from '../../components/WorkdayLogo';
import { useLoginType } from '../../hooks/LoginTypeHook';
import { ColorModeToggle } from '../../theme/ColorModeToggle';

const PREFIX = 'LoginFeature';

const classes = {
  root: `${PREFIX}Root`,
  background: `${PREFIX}Background`,
  loginContent: `${PREFIX}LoginContent`,
  card: `${PREFIX}Card`,
  cardHeader: `${PREFIX}CardHeader`,
  cardContent: `${PREFIX}CardContent`,
  formLogin: `${PREFIX}formLogin`,
  googleButton: `${PREFIX}googleButton`,
  logo: `${PREFIX}Logo`,
  flock: `${PREFIX}flock`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    position: 'relative',
    width: '100%',
    minHeight: '100vh',
    backgroundImage: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.default} 38%, ${alpha(
      theme.palette.primary.main,
      theme.palette.mode === 'dark' ? 0.26 : 0.55,
    )} 100%)`,
  },

  [`& .${classes.background}`]: {
    width: '100%',
    minHeight: '100vh',
    backgroundImage: "url('/images/background15.webp')",
    backgroundSize: '80%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },

  [`& .${classes.loginContent}`]: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },

  [`& .${classes.card}`]: {
    minWidth: '20rem',
    maxWidth: '30rem',
  },

  [`& .${classes.cardHeader}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },

  [`& .${classes.cardContent}`]: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  [`& .${classes.formLogin}`]: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '2rem',
  },

  [`& .${classes.googleButton}`]: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    margin: '1rem 0',
  },

  [`& .${classes.logo}`]: {
    marginTop: '4rem',
    marginBottom: '2rem',
    width: '100%',
    maxWidth: '430px',
  },

  [`& .${classes.flock}`]: {
    fontFamily: 'monospace',
    marginTop: '1rem',
    fontSize: 'medium',
  },
}));

export function LoginFeature() {
  const loginType = useLoginType();
  const isLoading = loginType.type === 'LOADING';
  const isGoogle = loginType.type === 'GOOGLE';

  const googleIconLogo = (
    <img
      width="46px"
      height="46px"
      src="/images/googleLogoIcon.svg"
      alt="Google Logo Icon"
    />
  );

  return (
    <StyledBox className={classes.root}>
      <ColorModeToggle sx={{ position: 'absolute', top: 16, right: 16 }} />
      <Box className={classes.background}>
        <Box className={classes.loginContent}>
          <Box className={classes.logo}>
            <WorkdayLogo />
          </Box>
          <Card className={classes.card}>
            <CardHeader
              className={classes.cardHeader}
              title={
                <Typography component="h1" variant="h5">
                  Workday Login
                </Typography>
              }
            ></CardHeader>
            <CardContent className={classes.cardContent}>
              {isLoading ? (
                <CircularProgress />
              ) : isGoogle ? (
                <>
                  <Typography>
                    To continue using Workday, please use your Google account to
                    login.
                  </Typography>
                  <Box className={classes.googleButton}>
                    <Button
                      fullWidth
                      size="large"
                      color={'secondary'}
                      variant="outlined"
                      href={'/oauth2/authorization/google'}
                      startIcon={googleIconLogo}
                    >
                      Sign in with Google
                    </Button>
                  </Box>
                </>
              ) : (
                <form
                  className={classes.formLogin}
                  method="post"
                  action="/login"
                >
                  <TextField
                    type="text"
                    id="username"
                    name="username"
                    className="form-control"
                    label="Username"
                  />
                  <TextField
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    label="Password"
                  />
                  <Button type="submit">Sign in</Button>
                </form>
              )}
            </CardContent>
          </Card>
          <Typography className={classes.flock}>
            Flock Software Engineering B.V. {new Date().getFullYear()}
          </Typography>
        </Box>
      </Box>
    </StyledBox>
  );
}
