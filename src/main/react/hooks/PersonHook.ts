import {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import {Person, PersonClient} from "../clients/PersonClient";
import {useLoginStatus} from "./StatusHook";

let store: Person | null = null;
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
    const listener = (it) => setState(it);
    if (store === null && listeners.length === 0) {
      if (status && status.loggedIn) {
        PersonClient.me().then(update);
      }
    }
    const params = new URLSearchParams(location.search);
    const personId = params.get("personId");
    if (personId) {
      PersonClient.get(personId).then(update);
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
