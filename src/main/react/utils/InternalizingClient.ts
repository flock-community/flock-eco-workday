import {ValidResponse} from "@flock-community/flock-eco-core/src/main/react/clients/utils";
import {PageableClient, ResourceClient} from "@flock-community/flock-eco-core/src/main/react/clients";

// FIXME: Use the one in PageableClient
interface Pageable {
  page: number
  size: number
  sort: string
}

export default function InternalizingClient<In, OutRaw, Out>(path: string, internalize: (raw: OutRaw) => Out) {

  const resourceClient = ResourceClient<OutRaw, In>(path);
  const pageableClient = PageableClient<OutRaw>(path);

  const internalizeSingleItemResponse = (response: ValidResponse<OutRaw>) => internalize(response.body)
  const internalizeItemArrayResponse = (response: ValidResponse<OutRaw[]>) => response.body.map(internalize)

  const all = () => resourceClient.all()
    .then(internalizeItemArrayResponse)

  const get = (id: string) => resourceClient.get(id)
    .then(internalizeSingleItemResponse)

  const post = (input: In) => resourceClient.post(input)
    .then(internalizeSingleItemResponse)

  const put = (id: string, input: In) => resourceClient.put(id, input)
    .then(internalizeSingleItemResponse)

  const findAllByPage = (pageable: Pageable) => pageableClient.findAllByPage(pageable)
    .then((response) => ({
      list: response.list.map(internalize),
      count: response.count
    }))

  return {
    all,
    get,
    post,
    put,
    delete: resourceClient.delete,
    findAllByPage
  }
}

