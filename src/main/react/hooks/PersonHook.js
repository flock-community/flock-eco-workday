import {useEffect, useState} from "react"
import {PersonClient} from "../clients/PersonClient"

let store = {}

export function usePerson() {
  const [person, setPerson] = useState(store.person)

  useEffect(() => {
    if (!store.person) {
      PersonClient.me().then(it => {
        store = {person: it}
        setPerson(it)
      })
    } else {
      setPerson(store.person)
    }
  })

  const handlePerson = personCode => {
    PersonClient.get(personCode).then(it => {
      store = {person: it}
      setPerson(it)
    })
  }

  return [person, handlePerson]
}
