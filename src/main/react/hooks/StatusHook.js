import {useEffect, useState} from "react"
import {UserStatusClient} from "../clients/UserStatusClient"

let store

export function useLoginStatus() {
  const [state, setState] = useState(store)

  useEffect(() => {
    if (store === undefined) {
      store = null
      UserStatusClient.get().then(it => {
        store = it
        setState(store)
      })
    } else {
      setState(store)
    }
  })

  return state
}
