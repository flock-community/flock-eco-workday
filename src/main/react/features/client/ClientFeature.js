import React, {useState} from "react"
import {makeStyles} from "@material-ui/core"
import {ClientList} from "./ClientList"
import {ClientDialog} from "./ClientDialog"
import {AddActionFab} from "../../components/FabButtons"

const useStyles = makeStyles({
  root: {
    padding: 10,
  },
})

export function ClientFeature() {
  const classes = useStyles()

  const [reload, setReload] = useState(false)

  const [dialog, setDialog] = useState({
    open: false,
    code: null,
  })

  const handleAdd = () => {
    setDialog({
      open: true,
      code: null,
    })
  }

  const handleItem = it => {
    setDialog({
      open: true,
      code: it.code,
    })
  }

  const handleClose = () => {
    setDialog({
      open: false,
      code: null,
    })
    setReload(!reload)
  }

  return (
    <>
      <ClientList reload={reload} onItemClick={handleItem} />
      <ClientDialog code={dialog.code} open={dialog.open} onClose={handleClose} />
      <AddActionFab color="primary" onClick={handleAdd} />
    </>
  )
}
