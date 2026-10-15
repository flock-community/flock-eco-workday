import { type SetStateAction, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { type Person, PersonClient } from '../clients/PersonClient';
import { useLoginStatus } from './StatusHook';

export let store: Person | null = null;
const listeners: ((person: Person | null) => void)[] = [];

function update(it: Person | null) {
  store = it;
  listeners.forEach((func) => {
    func(it);
  });
}

export function usePerson(): [Person | null, (personId: string) => void] {
  const status = useLoginStatus();
  const location = useLocation();

  const [state, setState] = useState(store);

  useEffect(() => {
    const listener = (it: SetStateAction<Person | null>) => setState(it);
    const params = new URLSearchParams(location.search);
    const personId = params.get('personId');
    // A person in the link wins; loading yourself too could overwrite them
    if (store === null && listeners.length === 0 && !personId) {
      if (status?.loggedIn) {
        PersonClient.me().then(update);
      }
    }
    if (personId) {
      PersonClient.get(personId)
        .then(update)
        // A person you may not look up: then you are the one shown
        .catch(() => {
          if (store === null && status?.loggedIn)
            PersonClient.me().then(update);
        });
    }
    listeners.push(listener);
    return () => {
      listeners.filter((it) => it !== listener);
    };
  }, [status, location]);

  const handlePerson: (personId: string | null) => void = (personId) => {
    if (personId !== null) {
      PersonClient.get(personId).then(update);
    } else {
      update(null);
    }
  };

  return [state, handlePerson];
}
