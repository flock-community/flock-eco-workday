import { useEffect, useState } from "react";

let errorStore = [];
const listeners = [];
const ErrorOpenTimeMilliSeconds = 5000;

export function addError(error) {
  const errorObject = {
    message: error,
    time: Date.now(),
    open: true,
  };
  errorStore = [...errorStore, errorObject];
  listeners.forEach((func) => func(errorStore));
  setTimeout(() => {
    errorObject.open = false;
    errorStore = errorStore.map((it) =>
      it === errorObject ? errorObject : it
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
