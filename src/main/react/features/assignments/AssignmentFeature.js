import {useState} from "react";

export function AssignmentFeature(){

  const [page, setPage] = useState()

  AssignmentClient.findAllByPage(0).then(res => {
    setPage(res)
  })

  return (<h1>{page.size}</h1>)
}
