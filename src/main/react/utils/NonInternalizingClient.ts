import {
  PageableClient,
  QueryParameters,
  ResourceClient,
  ValidResponse,
} from "@flock-community/flock-eco-core/src/main/react/clients";

// FIXME: Use the one in PageableClient
interface Pageable {
  page: number;
  size: number;
  sort: string;
}

export default function NonInternalizingClient<In, Out>(path: string) {
  const resourceClient = ResourceClient<Out, In>(path);
  const pageableClient = PageableClient<Out>(path);

  const extractResponse = <T>(response: ValidResponse<T>): T => response.body;

  const all = () => resourceClient.all().then(extractResponse);

  const query = (queryParameters: QueryParameters) =>
    resourceClient.query(queryParameters).then(extractResponse);

  const get = (id: string): Promise<Out> =>
    resourceClient.get(id).then(extractResponse);

  const post = (input: In) => resourceClient.post(input).then(extractResponse);

  const put = (id: string, input: In) =>
    resourceClient.put(id, input).then(extractResponse);

  return {
    all,
    query,
    get,
    post,
    put,
    delete: resourceClient.delete,
    ...pageableClient,
  };
}
