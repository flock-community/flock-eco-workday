import { createRoot } from 'react-dom/client';
import { Application } from './application/Application.tsx';
import { store } from './hooks/StatusHook';

const { fetch: originalFetch } = window;

window.fetch = async (...args) => {
  const [resource, config] = args;
  const opts = {
    ...config,
    headers: {
      'Context-Person-Id': store?.personId,
      ...config?.headers,
    },
  };

  return originalFetch(resource, opts);
};

createRoot(document.getElementById('index')).render(<Application />);
