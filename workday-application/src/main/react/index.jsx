import React from "react";
import ReactDOM from "react-dom";
import { Application } from "./application/Application.tsx";
import { store } from "./hooks/StatusHook";

const { fetch: originalFetch } = window;

window.fetch = async (...args) => {
  const [resource, config] = args;
  const opts = {
    ...config,
    headers: {
      "Context-Person-Id": store && store.personId,
      ...(config || {}).headers,
    },
  };

  return originalFetch(resource, opts);
};

ReactDOM.render(<Application />, document.getElementById("index"));
