import { ResourceClient } from "../utils/ResourceClient";
import { PageableClient } from "../utils/PageableClient";
import { addError } from "../hooks/ErrorHook";

const path = "/api/persons";

const resourceClient = ResourceClient(path);
const pageableClient = PageableClient(path);

export const PersonClient = {
  ...resourceClient,
  ...pageableClient,
  me: () => resourceClient.get("me").catch(e => addError(e.message))
};
