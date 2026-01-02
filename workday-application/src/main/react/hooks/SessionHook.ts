// deps

import { type MutableRefObject, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Clients
import { UserClient } from '../clients/UserClient';

// Constants
const TWENTY_SEVEN_MIN_IN_MS = 1000 * 60 * 27;
const THIRTY_MIN_IN_MS = 1000 * 60 * 30;

// Types
type useSessionProps = {
  extendSession: () => void;
  sessionExpired: boolean;
};

/**
 * Hook to manage the user's session expiration and redirect them to the login page
 * after a certain amount of time.
 *
 * Very naive solution to:
 * 1. Warn the user of expired session
 * 2. Make it possible to reset the session (by calling the API)
 * 3. Log the user out
 * We take advanatage of the fact that the session cookie gets reset after every call to the API
 * @returns An object containing the `extendSession` function and `sessionExpired` boolean value.
 */
export const useSession = (parentCallback): useSessionProps => {
  const _location = useLocation();
  const sessionInterval = useRef<NodeJS.Timeout | null>(null);
  const redirectInterval = useRef<NodeJS.Timeout | null>(null);

  const [sessionExpired, setSessionExpired] = useState(false);

  const resetSession = () => {
    // a side effect of calling the API is that the session cookie gets resetted
    UserClient.getType();
  };

  const extendSession = (): void => {
    setSessionExpired(false);
    clearIntervals();
    resetSession();
    runIntervals();
  };

  const clearIntervals = () => {
    if (sessionInterval.current) {
      clearInterval(sessionInterval.current);
    }
    if (redirectInterval.current) {
      clearInterval(redirectInterval.current);
    }
  };

  const createInterval = (
    ref: MutableRefObject<NodeJS.Timeout | null>,
    time: number | undefined,
    callBack: () => void,
  ) => {
    return new Promise<void>((resolve) => {
      ref.current = setInterval(() => {
        callBack();
        resolve();
      }, time);
    });
  };

  const runIntervals = async () => {
    await createInterval(sessionInterval, TWENTY_SEVEN_MIN_IN_MS, () =>
      setSessionExpired(true),
    );
    await createInterval(redirectInterval, THIRTY_MIN_IN_MS, () =>
      parentCallback(),
    );
  };

  useEffect(() => {
    runIntervals();

    return () => {
      clearIntervals();
    };
  }, [clearIntervals, runIntervals]);

  return {
    extendSession,
    sessionExpired,
  };
};
