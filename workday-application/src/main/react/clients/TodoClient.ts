import { Todo } from "../wirespec/Models";
import InternalizingClient from "../utils/InternalizingClient";

const path = "/api/todos";

// Todo: proper mapping between external (wirespec model and internal one)
const internalize = (it: Todo): Todo => ({ ...it });
const resourceClient = InternalizingClient<Todo, Todo, Todo>(path, internalize);

export const TodoClient = {
  ...resourceClient,
};
