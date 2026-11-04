// Custom events for Rybbit (loaded in index.html). The script loads deferred and ad blockers drop it,
// so an event can be lost but must never throw.
type Props = Record<string, string | number | boolean>;

declare global {
  interface Window {
    rybbit?: { event: (name: string, properties?: Props) => void };
  }
}

export function track(name: string, properties?: Props) {
  try {
    window.rybbit?.event(name, properties);
  } catch {
    // Analytics never gets to break the page.
  }
}
