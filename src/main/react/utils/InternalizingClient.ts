import {QueryParameters, ValidResponse} from "./new/utils";
import {PageableClient} from "./new/PageableClient";
import {ResourceClient} from "./new/ResourceClient";

// FIXME: Use the one in PageableClient
interface Pageable {
  page: number
  size: number
  sort: string
}

export default function InternalizingClient<In, OutRaw, Out>(path: string, internalize: (raw: OutRaw) => Out) {

  const resourceClient = ResourceClient<OutRaw, In>(path);
  const pageableClient = PageableClient<OutRaw>(path);

  const internalizeSingleItemResponse = (response: ValidResponse<OutRaw>): Out => internalize(response.body)
  const internalizeItemArrayResponse = (response: ValidResponse<OutRaw[]>): Out[] => response.body.map(internalize)

  const all = () => resourceClient
    .all()
    .then(internalizeItemArrayResponse)

  const query = (queryParameters: QueryParameters) => resourceClient
    .query(queryParameters)
    .then(internalizeItemArrayResponse)

  const get = (id: string) => resourceClient
    .get(id)
    .then(internalizeSingleItemResponse)

  const post = (input: In) => resourceClient
    .post(input)
    .then(internalizeSingleItemResponse)

  const put = (id: string, input: In) => resourceClient
    .put(id, input)
    .then(internalizeSingleItemResponse)

  const findAllByPage = (pageable: Pageable) => pageableClient
    .findAllByPage(pageable)
    .then((response) => ({
      list: response.list.map(internalize),
      count: response.count
    }))

  const queryByPage = (pageable: Pageable, queryParameters: QueryParameters) => pageableClient
    .queryByPage(pageable, queryParameters)
    .then((response) => ({
      list: response.list.map(internalize),
      count: response.count
    }))

  return {
    all,
    query,
    get,
    post,
    put,
    delete: resourceClient.delete,
    findAllByPage,
    queryByPage
  }
}

