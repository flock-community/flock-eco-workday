import { createContext } from 'react';

type Props = {
  authorities?: string[];
  user?: any;
};

export const ApplicationContext = createContext<Props>({
  authorities: undefined,
  user: undefined,
});
