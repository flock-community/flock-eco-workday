import moment from "moment"
import {ResourceClient} from "../utils/ResourceClient"

const internalize = it => ({
  ...it,
  date: moment(it.date),
})

const path = "/api/invoices"
const resourceClient = ResourceClient(path, internalize)

export const InvoiceClient = {
  ...resourceClient,
}
