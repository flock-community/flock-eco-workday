import { SetStateAction, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Person, PersonClient } from "../clients/PersonClient";
import { useLoginStatus } from "./StatusHook";

export let store: Person | null = null;
const listeners: ((person: Person | null) => void)[] = [];

function update(it: Person | null) {
  store = it;
  listeners.forEach((func) => func(it));
}

export function usePerson(): [Person | null, (personId: string) => void] {
  const status = useLoginStatus();
  const location = useLocation();

  const [state, setState] = useState(store);

  useEffect(() => {
    const listener = (it: SetStateAction<Person | null>) => setState(it);

    // Fetch person data if needed
    if (store === null && status && status.isLoggedIn) {
      PersonClient.me().then(update);
    }

    // Check for personId in URL params
    const params = new URLSearchParams(location.search);
    const personId = params.get("personId");
    if (personId) {
      PersonClient.get(personId).then(update);
    }

    // Add listener
    listeners.push(listener);

    // Cleanup - properly remove listener
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
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
