import {useEffect, useState} from "react"
import UserClient from "@flock-eco/feature-user/src/main/react/user/UserClient"
import {useLoginStatus} from "./StatusHook"

let loading = false
let store = null
const listeners = []

function update(it) {
  store = it
  loading = false
  listeners.forEach(func => func(it))
}

export function useUserMe() {
  const status = useLoginStatus()

  const [state, setState] = useState(store)

  useEffect(() => {
    if (store === null && !loading) {
      if (status && status.loggedIn) {
        loading = true
        UserClient.findUsersMe().then(update)
      }
    }
    listeners.push(setState)
    return () => {
      listeners.filter(it => it !== setState)
    }
  }, [status])

  return state
}
