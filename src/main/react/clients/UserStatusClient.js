import { addError } from "../hooks/ErrorHook";

const path = "/login/status";

const validateResponse = res => {
  if (!res.ok) throw new Error(res.statusText);
  if (res.status === 204) return null;

  return res.json();
};

const get = () => {
  const opts = {
    method: "GET"
  };

  return fetch(path, opts)
    .then(validateResponse)
    .catch(e => addError(e.message));
};

export const UserStatusClient = {
  get
};
