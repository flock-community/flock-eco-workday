import { useEffect, useState } from 'react';
import { UserClient } from '../clients/UserClient';

const DEFAULT = 'LOADING';
let store = { type: DEFAULT };
const listeners: ((it: any) => void)[] = [];

function update(it) {
  store = it;
  listeners.forEach((func) => {
    func(it);
  });
}

export function useLoginType() {
  const [state, setState] = useState(store);

  useEffect(() => {
    const listener = (it) => {
      setState(it);
    };
    if (store.type === DEFAULT && listeners.length === 0) {
      UserClient.getType().then((result) => {
        update(result);
      });
    }
    listeners.push(listener);
    return () => {
      listeners.filter((it) => it !== listener);
    };
  }, []);

  return state;
}
