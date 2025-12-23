import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  TextField,
} from "@material-ui/core";
import React from "react";
import { useLoginType } from "../../hooks/LoginTypeHook";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    minHeight: "100vh",
    backgroundImage: `linear-gradient(to bottom, white, ${theme.palette.primary.main})`,
  },
  background: {
    width: "100%",
    minHeight: "100vh",
    backgroundImage: "url('/images/background15.webp')",
    backgroundSize: "80%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  },
  loginContent: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  },
  card: {
    minWidth: "20rem",
    maxWidth: "30rem",
  },
  cardHeader: {
    backgroundColor: theme.palette.primary.main,
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  formLogin: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "2rem",
  },
  googleButton: {
    display: "flex",
    width: "100%",
    justifyContent: "center",
    margin: "1rem 0",
  },
  logo: {
    marginTop: "4rem",
    marginBottom: "2rem",
    maxWidth: "600px",
  },
  flock: {
    fontFamily: "monospace",
    marginTop: "1rem",
    fontSize: "medium",
  },
}));

export function LoginFeature() {
  const classes = useStyles();
  const loginType = useLoginType();
  const isLoading = loginType.type == "LOADING";
  const isGoogle = loginType.type == "GOOGLE";

  const googleIconLogo = (
    <img
      width="46px"
      height="46px"
      src="/images/googleLogoIcon.svg"
      alt="Google Logo Icon"
    />
  );

  return (
    <Box className={classes.root}>
      <Box className={classes.background}>
        <Box className={classes.loginContent}>
          <Box className={classes.logo}>
            <img width="100%" src="/images/workday_logo.webp" alt="" />
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
              ) : (
                <>
                  {isGoogle ? (
                    <>
                      <Typography>
                        To continue using Workday, please use your Google
                        account to login.
                      </Typography>
                      <Box className={classes.googleButton}>
                        <Button
                          color={"secondary"}
                          variant="outlined"
                          href={"/oauth2/authorization/google"}
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
                </>
              )}
            </CardContent>
          </Card>
          <Typography className={classes.flock}>
            Flock Software Engineering B.V. {new Date().getFullYear()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
