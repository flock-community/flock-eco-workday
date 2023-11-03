import { useEffect, useState } from "react";
import { BootstrapClient } from "../clients/BootstrapClient";

// eslint-disable-next-line import/no-mutable-exports
export let store = null;
const listeners = [];

function update(it) {
  store = it;
  listeners.forEach((func) => func(it));
}

export function useLoginStatus() {
  const [state, setState] = useState(store);

  useEffect(() => {
    const listener = (it) => setState(it);
    if (store === null && listeners.length === 0) {
      BootstrapClient.getBootstrap().then(update);
    }
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        // Remove listener at cleanup
        listeners.splice(index, 1);
      }
    };
  }, []);

  return state;
}
