import {ResourceClient, responseValidation} from "../utils/ResourceClient"

const path = "/api/exactonline"
const resourceClient = ResourceClient(path)

const authorizeUrl = `${path}/authorize?redirect_url=/exactonline`
const status = () => resourceClient.get("status")
const accounts = () => resourceClient.get("accounts")

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

export const ExactonlineClient = {
  status,
  accounts,
  uploadInvoice,
  authorizeUrl,
}
