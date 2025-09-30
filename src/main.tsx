import './polyfills.ts';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ConvexProviderMaybe } from './lib/convexProvider';
import './index.css';

createRoot(document.getElementById("root")!).render(
  <ConvexProviderMaybe>
    <App />
  </ConvexProviderMaybe>
);
