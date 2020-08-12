import { useEffect, useState } from "react";

let errorStore = [];
const listeners = [];
const ErrorOpenTimeMilliSeconds = 5000;

export function addError(error) {
  console.log(`An error has occurred: ${error}`);
  const errorObject = {
    message: error,
    time: Date.now(),
    open: true,
    onClose: {}
  };
  setTimeout(() => {
    errorObject.open = false;
  }, ErrorOpenTimeMilliSeconds);
  errorStore = [...errorStore, errorObject];
  listeners.forEach(func => func(errorStore));
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
