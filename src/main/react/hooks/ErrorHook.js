import { useEffect, useState } from "react";

let errorStore = [];
const listeners = [];

export function addError(error) {
  errorStore = [...errorStore, error];
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

  return [state, addError];
}
