import { ExtractJSON, ResourceClient } from "../utils/ResourceClient";
import { addError } from "../hooks/ErrorHook";

const path = "/api/exactonline";
const resourceClient = ResourceClient(path);

const authorizeUrl = `${path}/authorize?redirect_url=/exactonline`;
const status = () =>
  resourceClient
    .get("status")
    .then(ExtractJSON)
    .catch(e => addError(e.message));
const accounts = () =>
  resourceClient
    .get("accounts")
    .then(ExtractJSON)
    .catch(e => addError(e.message));

export const ExactonlineClient = {
  status,
  accounts,
  authorizeUrl
};
