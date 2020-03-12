import moment from "moment"
import {ResourceClient} from "../utils/ResourceClient"

const internalize = it => ({
  ...it,
  from: moment(it.from),
  to: moment(it.to),
})

const path = "/api/events"
const resourceClient = ResourceClient(path, internalize)

export const EventClient = {
  ...resourceClient,
}
