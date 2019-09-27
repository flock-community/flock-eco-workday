import {ResourceClient} from "../utils/ResourceClient";
import {PageableClient} from "../utils/PageableClient";

const path = '/api/clients'

const resourceClient = ResourceClient(path)
const pageableClient = PageableClient(path)

const findAll = () => {

}

export const ClientClient = {
  ...resourceClient,
  ...pageableClient,
  findAll
}
