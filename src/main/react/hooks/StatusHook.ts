import { SetStateAction, useEffect, useState } from "react";
import { BootstrapClient, BootstrapData } from "../clients/BootstrapClient";

// eslint-disable-next-line import/no-mutable-exports
export let store: BootstrapData | null = null;
const listeners: ((block: BootstrapData | null) => void)[] = [];

const update = (it: BootstrapData | null) => {
  store = it;
  listeners.forEach((func) => func(it));
};

export function useLoginStatus() {
  const [state, setState] = useState(store);

  useEffect(() => {
    const listener = (it: SetStateAction<BootstrapData | null>) => setState(it);
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
