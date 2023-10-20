import { useEffect, useState } from "react";
import UserClient from "@flock-community/flock-eco-feature-user/src/main/react/user/UserClient.ts";
import { useLoginStatus } from "./StatusHook";

let loading = false;
let store = null;
const listeners = [];

function update(it) {
  store = it;
  loading = false;
  listeners.forEach((func) => func(it));
}

export function useUserMe() {
  const status = useLoginStatus();

  const [state, setState] = useState(store);

  useEffect(() => {
    if (store === null && !loading) {
      if (status && status.isLoggedIn) {
        loading = true;
        UserClient.findUsersMe().then(update);
      }
    }
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index !== -1) {
        // Remove setState at cleanup
        listeners.splice(index, 1);
      }
    };
  }, [status]);

  const handleUser = (userId) => {
    if (userId !== null) {
      UserClient.findUsersMe().then(update);
    } else {
      update(null);
    }
  };

  return [state, handleUser];
}
