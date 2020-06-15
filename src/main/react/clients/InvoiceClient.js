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
  return fetch(`${path}/upload_invoice`, opts).then(responseValidation)
}

export const InvoiceClient = {
  uploadInvoice,
  ...resourceClient,
}
