import {ResourceClient} from "../utils/ResourceClient";
import {PageableClient} from "../utils/PageableClient";

const path = '/api/assignments'

const resourceClient = ResourceClient(path)
const pageableClient = PageableClient(path)

const findAll = () => {

}

export const AssignmentClient = {
  ...resourceClient,
  ...pageableClient,
  findAll
}
