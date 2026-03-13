import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initWebMCP } from './webmcp/setup';
import App from './App.tsx';

initWebMCP();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
