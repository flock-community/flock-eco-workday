import {useEffect, useState} from "react"

let store = {}

export function useUser() {
  const [user, setUser] = useState(store.user)

  useEffect(() => {
    setUser(store.user)
  })

  const handleUser = it => {
    store = {user: it}
    setUser(user)
  }

  return [user, handleUser]
}
