import { themeLight } from "./theme-light";

export function getTheme(theme) {
  if (theme) {
    return themeLight;
  }
  // default
  return themeLight;
}
