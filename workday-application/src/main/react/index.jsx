import { createRoot } from 'react-dom/client';
import { Application } from './application/Application.tsx';
// eslint-disable-next-line import/extensions,import/no-unresolved
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
