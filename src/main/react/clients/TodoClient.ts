import { GetTodoAll, Todo } from "../wirespec/Openapispec";

// Todo: proper mapping between external (wirespec model and internal one)
const internalize = (it: Todo): Todo => {
  if (it.id !== undefined && false /*!validateUUID(it.id)*/) {
    throw new Error(`${it.id} is not a valid UUID`);
  }

  return {
    id: it.id,
    description: it.description,
    todoType: it.todoType,
    personId: it.personId,
    personName: it.personName,
  };
};

const baseUrl = ""; // basepath is root

type TodoClientWs = GetTodoAll.Call;

// TODO write proper validation function
const validateResponseWS = (response: {
  content: { type: string | null; body: any };
  status: number;
}): response is GetTodoAll.Response => {
  //
  return true;
};

const handleCall = async (req: any): Promise<any> => {
  const res = await fetch(baseUrl + req.path, {
    method: req.method,
    body: undefined,
    headers: undefined,
  });

  let body;
  switch (res.headers.get("Content-Type")) {
    case "application/json":
      body = await res.json();
      break;
    default:
      body = await res.text();
      break;
  }

  return {
    status: res.status,
    content: {
      type: res.headers.get("Content-Type"),
      body: body,
    },
  };
};

export const todoClientWs: TodoClientWs = {
  getTodoAll: (req) => handleCall(req),
};

const all: () => Promise<Todo[]> = () =>
  todoClientWs
    .getTodoAll({
      path: GetTodoAll.PATH,
      method: GetTodoAll.METHOD,
      headers: {},
      query: {},
    })
    .then((x) => {
      if (x.status !== 200) {
        throw Error(`Something went wrong requesting ${GetTodoAll.METHOD} ${
          GetTodoAll.PATH
        }.
         Response was ${x.status}: ${JSON.stringify(x.content)}`);
      }

      return x.content.body.map(internalize);
    });

export const TodoClient = {
  all,
};
