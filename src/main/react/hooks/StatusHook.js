import {useEffect, useState} from "react"
import {UserStatusClient} from "../clients/UserStatusClient"

let store = null
const listeners = []

function update(it) {
  store = it
  listeners.forEach(func => func(it))
}

export function useLoginStatus() {
  const [state, setState] = useState(store)

  useEffect(() => {
    const listener = it => setState(it)
    if (store === null && listeners.length === 0) {
      UserStatusClient.get().then(update)
    }
    listeners.push(listener)
    return () => {
      listeners.filter(it => it !== listener)
    }
  }, [])

  return state
}
