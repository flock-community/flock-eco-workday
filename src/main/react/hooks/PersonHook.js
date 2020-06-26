import {useEffect, useState} from "react"
import {useLocation} from "react-router-dom"
import {PersonClient} from "../clients/PersonClient"
import {useLoginStatus} from "./StatusHook"

let store = null
const listeners = []

function update(it) {
  store = it
  listeners.forEach(func => func(it))
}

export function usePerson() {
  const status = useLoginStatus()
  const location = useLocation()

  const [state, setState] = useState(store)

  useEffect(() => {
    const listener = it => setState(it)
    if (store === null && listeners.length === 0) {
      if (status && status.loggedIn) {
        PersonClient.me().then(update)
      }
    }
    const params = new URLSearchParams(location.search)
    const personId = params.get("personId")
    if (personId) {
      PersonClient.get(personId).then(update)
    }
    listeners.push(listener)
    return () => {
      listeners.filter(it => it !== listener)
    }
  }, [status, location])

  const handlePerson = personCode => {
    PersonClient.get(personCode).then(update)
  }

  return [state, handlePerson]
}
