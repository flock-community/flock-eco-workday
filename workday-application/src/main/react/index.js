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
  const response = await originalFetch(resource, opts);
  return response;
};

ReactDOM.render(<Application />, document.getElementById("index"));
