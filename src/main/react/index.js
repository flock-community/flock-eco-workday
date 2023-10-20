import React from "react";
import ReactDOM from "react-dom";
import { Application } from "./application/Application.tsx";
import {store as personStore }  from "./hooks/PersonHook";

const { fetch: originalFetch } = window;

window.fetch = async (...args) => {
  const [resource, config ] = args;
  const opts = {
    ...config,
    headers:{
      "Context-Person-Id": personStore?.id,
      ...config?.headers
    },
  }
  const response = await originalFetch(resource, opts);
  return response;
};

ReactDOM.render(<Application />, document.getElementById("index"));
