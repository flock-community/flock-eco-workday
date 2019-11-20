import {ResourceClient} from "../utils/ResourceClient";
import {PageableClient} from "../utils/PageableClient";
import moment from "moment";

const path = '/api/assignments'

const internalize = (it) => ({
  ...it,
  startDate: moment(it.startDate, "YYYY-MM-DD"),
  endDate: moment(it.endDate, "YYYY-MM-DD"),
})

const resourceClient = ResourceClient(path)
const pageableClient = PageableClient(path)

export const findByCode = (code) => {
  const opts = {
    method: 'GET',
  }
  return fetch(`${path}/${code}`, opts)
    .then(res => res.json())
}

function findAllByUserCode(userCode) {

  return fetch(`${path}?userCode=${userCode}`)
    .then(res => {
      if (res.status === 200) {
        return res.json()
      } else {
        throw res.json()
      }
    })
    .then(data => data
      .map(internalize))
}

export const AssignmentClient = {
  ...resourceClient,
  ...pageableClient,
  findByCode,
  findAllByUserCode
}
