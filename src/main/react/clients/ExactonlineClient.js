import {ResourceClient} from "../utils/ResourceClient"

const path = "/api/exactonline"
const resourceClient = ResourceClient(path)

const authorizeUrl = `${path}/authorize?redirect_url=/exactonline`
const status = () => resourceClient.get("status")
const accounts = () => resourceClient.get("accounts")

export const ExactonlineClient = {
  status,
  accounts,
  authorizeUrl,
}
