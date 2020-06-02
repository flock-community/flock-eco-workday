import moment from "moment"
import {ResourceClient, responseValidation} from "../utils/ResourceClient"

const internalize = it => ({
  ...it,
  date: moment(it.date),
})

const path = "/api/invoices"
const resourceClient = ResourceClient(path, internalize)

const uploadInvoice = id => {
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({id}),
  }
  return fetch(path, opts)
    .then(responseValidation)
    .then(it => (internalize ? internalize(it) : it))
}

export const InvoiceClient = {
  ...resourceClient,
  uploadInvoice,
}
