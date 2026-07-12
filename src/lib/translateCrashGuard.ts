/**
 * Guards against the well-known crash that happens when a browser translation
 * engine (Google Translate / Chrome "Translate this page") rewrites the DOM
 * while React is managing it.
 *
 * Translate replaces text nodes with its own <font> wrappers. React keeps
 * references to the original text nodes, so when it later updates or removes
 * one (e.g. a Select value changing from placeholder to the chosen option),
 * `removeChild` / `insertBefore` are called with a node that is no longer a
 * child of the expected parent, throwing:
 *
 *   NotFoundError: Failed to execute 'removeChild' on 'Node':
 *   The node to be removed is not a child of this node.
 *
 * This crashes the whole React tree (our ErrorBoundary shows "Ocurrió un
 * error"). Making these two DOM operations no-op instead of throwing when the
 * parent no longer matches lets React recover gracefully. This is the standard
 * workaround for facebook/react#11538 and is safe: in normal operation the
 * parent always matches, so the original behaviour is preserved.
 */
export function installTranslateCrashGuard(): void {
  if (typeof Node !== 'function' || !Node.prototype) return;
  // Avoid double-patching (e.g. HMR in dev).
  if ((Node.prototype as unknown as { __translateGuardInstalled?: boolean }).__translateGuardInstalled) {
    return;
  }

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) {
      if (import.meta.env.DEV) {
        console.warn('[translate-guard] Skipped removeChild for a node whose parent changed (browser translation).', child);
      }
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (import.meta.env.DEV) {
        console.warn('[translate-guard] Skipped insertBefore for a reference node whose parent changed (browser translation).', referenceNode);
      }
      return newNode;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };

  (Node.prototype as unknown as { __translateGuardInstalled?: boolean }).__translateGuardInstalled = true;
}
