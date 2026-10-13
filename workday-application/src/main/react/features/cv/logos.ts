import { useCallback, useEffect, useState } from 'react';
import { type Logo, LogoClient } from '../../clients/LogoClient';

const words = (text: string) =>
  text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((it) => it !== '');

/**
 * The logo for a client: one whose name is all in the client's name ("ING" for
 * "ING, Amsterdam" and "ING Touchpoint"); the longest name wins ("ING Touchpoint"
 * over "ING").
 */
export function matchLogo(
  client: string | null | undefined,
  logos: Logo[],
): Logo | undefined {
  const clientWords = new Set(words(client ?? ''));
  return logos
    .filter((logo) => {
      const logoWords = words(logo.name);
      return (
        logoWords.length > 0 && logoWords.every((it) => clientWords.has(it))
      );
    })
    .sort((a, b) => b.name.length - a.name.length)[0];
}

let cache: Logo[] | null = null;
const listeners = new Set<(logos: Logo[]) => void>();

const publish = (logos: Logo[]) => {
  cache = logos;
  for (const listener of listeners) listener(logos);
};

/** Loads the logos again, for everybody that uses them. */
export const reloadLogos = () => LogoClient.all().then(publish);

/** The shared logos, loaded once and kept in step across the page. */
export function useLogos(): [Logo[] | null, () => Promise<void>] {
  const [logos, setLogos] = useState<Logo[] | null>(cache);

  useEffect(() => {
    listeners.add(setLogos);
    if (cache === null) reloadLogos().catch(() => publish([]));
    return () => {
      listeners.delete(setLogos);
    };
  }, []);

  return [logos, useCallback(() => reloadLogos(), [])];
}
