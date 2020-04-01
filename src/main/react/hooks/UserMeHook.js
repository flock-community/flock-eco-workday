import {useEffect, useState} from "react"
import UserClient from "@flock-eco/feature-user/src/main/react/user/UserClient"
import {useLoginStatus} from "./StatusHook"

let store

export function useUserMe() {
  const status = useLoginStatus()

  const [state, setState] = useState(store)

  useEffect(() => {
    if (store === undefined && status && status.loggedIn) {
      store = null
      UserClient.findUsersMe().then(it => {
        store = it
        setState(store)
      })
    } else {
      setState(store)
    }
  }, [status])

  return state
}
