import React, { useEffect } from "react";

import { BrowserRouter as Router, Redirect, Route } from "react-router-dom";
import { Box, ThemeProvider } from "@mui/material";
import { StyledEngineProvider } from "@mui/material/styles";
import UserAuthorityUtil from "@workday-user/user_utils/UserAuthorityUtil";
import { useLoginStatus } from "../hooks/StatusHook";
import { getTheme } from "../theme/theme";
import { useError } from "../hooks/ErrorHook";
import { ErrorStack } from "../components/error/ErrorBarStack";
import { AlignedLoader } from "@workday-core/components/AlignedLoader";
import { LoginFeature } from "../features/login/LoginFeature";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/nl";
import { ErrorBoundary } from "react-error-boundary";

const AuthenticatedApplication = React.lazy(() =>
  import("./AuthenticatedApplication").then((module) => ({
    default: module.AuthenticatedApplication,
  }))
);

const theme = getTheme("light");

export const Application = () => {
  const status = useLoginStatus();
  const errors = useError();

  useEffect(() => {
    if (status) {
      UserAuthorityUtil.setAuthorities(status.authorities);
    } else {
      UserAuthorityUtil.setAuthorities([]);
    }
  }, [status]);

  if (status == null) {
    return <AlignedLoader />;
  }

  return (
    <Router>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="nl">
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onReset={() => {
                // Optionally reset app state here
              }}
              onError={(error, info) => {
                logErrorToService(error, info);
              }}
            >
              {status.isLoggedIn ? (
                <AuthenticatedApplication />
              ) : (
                <UnauthenticatedApplication />
              )}
              <ErrorStack ErrorList={errors} />
            </ErrorBoundary>
          </ThemeProvider>
        </StyledEngineProvider>
      </LocalizationProvider>
    </Router>
  );
};

const UnauthenticatedApplication = () => {
  return (
    <Box className={"full-width"} style={{ rowGap: 0 }}>
      <Redirect to="/auth" exact />
      <Route path="/auth" exact component={LoginFeature} />
    </Box>
  );
};

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function logErrorToService(error, info) {
  // Example: Send to Sentry, LogRocket, etc.
  console.error("Logged error:", error, info);
}
