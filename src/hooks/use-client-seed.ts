"use client";

import { useSyncExternalStore } from "react";

const clientSeed = Math.floor(Math.random() * 2 ** 31);
const noopSubscribe = () => () => {};

/**
 * A random seed that exists only in the browser (null while prerendering).
 * Randomised content is derived from it so the static HTML never mismatches
 * what the client renders.
 */
export function useClientSeed(): number | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => clientSeed,
    () => null,
  );
}
