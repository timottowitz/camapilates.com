import './polyfills.ts';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ConvexProviderMaybe } from './lib/convexProvider';
import './index.css';

// Global error handler for chunk loading failures
// This commonly happens when a new deployment occurs and old chunks are no longer available
window.addEventListener('error', (e) => {
  // Check if the error is related to loading a chunk/module
  if (/Loading chunk .* failed/.test(e.message) || /Failed to fetch dynamically imported module/.test(e.message)) {
    e.preventDefault();
    console.warn('Chunk load error detected, forcing reload...', e.message);
    // Force reload from server, ignoring cache
    window.location.reload();
  }
});

createRoot(document.getElementById("root")!).render(
  <ConvexProviderMaybe>
    <App />
  </ConvexProviderMaybe>
);
