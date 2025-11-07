import { useEffect, useState } from "react";

let errorStore: ErrorMessage[] = [];
const listeners: Listener[] = [];
const ErrorOpenTimeMilliSeconds = 5000;

type Listener = (errorStore: ErrorMessage[]) => void;

type Error = {
  message: string;
};

type ErrorMessage = {
  message: string;
  time: number;
  open: boolean;
};

export function addError(error: Error | string): void {
  const errorLogObject = {
    message: typeof error == "string" ? error : error.message,
    time: Date.now(),
    open: true,
  };
  errorStore = [...errorStore, errorLogObject];
  listeners.forEach((func) => func(errorStore));
  setTimeout(() => {
    errorLogObject.open = false;
    errorStore = errorStore.map((it) =>
      it === errorLogObject ? errorLogObject : it
    );
    listeners.forEach((func) => func(errorStore));
  }, ErrorOpenTimeMilliSeconds);
}

export function useError() {
  const [state, setState] = useState(errorStore);

  useEffect(() => {
    listeners.push(setState);

    return () => {
      const index = listeners.indexOf(setState);
      if (index !== -1) {
        // Remove setState at cleanup
        listeners.splice(index, 1);
      }
    };
  }, []);

  return state;
}
