import { useEffect, useState } from "react";
import UserClient from "@workday-user/user/UserClient";
import { useLoginStatus } from "./StatusHook";
import { User } from "@workday-user/graphql/user";

let loading = false;
let store: User | null = null;
const listeners: ((it: any) => void)[] = [];

function update(it) {
  store = it;
  loading = false;
  listeners.forEach((func) => func(it));
}

export function useUserMe(): [User, (userId: string) => void] {
  const status = useLoginStatus();

  const [state, setState] = useState<User | null>(store);

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

  const handleUser = (userId: string) => {
    if (userId !== null) {
      UserClient.findUsersMe().then(update);
    } else {
      update(null);
    }
  };

  return [state, handleUser];
}
