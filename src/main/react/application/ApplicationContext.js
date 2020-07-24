import { createContext } from "react";

export const ApplicationContext = createContext({
  authorities: null,
  user: null
});
