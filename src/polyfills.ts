// Minimal Buffer shim for browser to satisfy gray-matter
// Avoid importing the Node 'buffer' module (Vite externalizes it in browser).
(() => {
  if (typeof globalThis.Buffer === 'undefined') {
    const Shim: any = {
      from(input: any) {
        // gray-matter only needs Buffer.from when given a string;
        // returning the string directly is sufficient in our usage.
        return input;
      },
      isBuffer(_val: any) {
        return false;
      },
    };
    // Expose globally
    (globalThis as any).Buffer = Shim;
  }
})();
