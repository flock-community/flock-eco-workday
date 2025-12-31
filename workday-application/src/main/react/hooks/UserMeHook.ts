import type { User } from '@workday-user/user/response/user';
import UserClient from '@workday-user/user/UserClient';
import { useEffect, useState } from 'react';
import { useLoginStatus } from './StatusHook';

let loading = false;
let store: User | null = null;
const listeners: ((it: any) => void)[] = [];

function update(it) {
  store = it;
  loading = false;
  listeners.forEach((func) => {
    func(it);
  });
}

export function useUserMe(): [User, (userId: string) => void] {
  const status = useLoginStatus();

  const [state, setState] = useState<User | null>(store);

  useEffect(() => {
    if (store === null && !loading) {
      if (status?.isLoggedIn) {
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
