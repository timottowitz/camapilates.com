import { useEffect, useState } from 'react';

/**
 * Returns `true` once `delayMs` has elapsed while `active` stays true.
 *
 * Used to escape indefinite loading spinners when a Convex query never
 * resolves (backend outage, blocked WebSocket, offline client). While the
 * query is pending, `active` is true; if it hasn't resolved by `delayMs`,
 * the page can fall back to an error/retry state instead of hanging forever.
 *
 * The timer resets whenever `active` flips back to false (e.g. the query
 * resolved), so a slow-but-successful load never trips the timeout.
 */
export function useLoadTimeout(active: boolean, delayMs = 12000): boolean {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!active) {
      setTimedOut(false);
      return;
    }
    const id = setTimeout(() => setTimedOut(true), delayMs);
    return () => clearTimeout(id);
  }, [active, delayMs]);

  return timedOut;
}
