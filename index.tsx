
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker for offline support
registerSW({
  onOfflineReady() {
    console.log('[PWA] App ready to work offline');
  },
  onNeedRefresh() {
    console.log('[PWA] New content available, reload for update');
  },
});
