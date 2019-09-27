import React, {useState} from "react";

import {makeStyles} from "@material-ui/core";
import {ClientList} from "./ClientList";
import Fab from "@material-ui/core/Fab";
import AddIcon from '@material-ui/icons/Add';
import {ClientDialog} from "./ClientDialog";

const useStyles = makeStyles({
  root: {
    padding: 10
  },
  fab: {
    position: 'absolute',
    bottom: "25px",
    right: "25px"
  }
});

export function ClientFeature() {

  const classes = useStyles();

  const [reload, setReload] = useState(false)

  const [dialog, setDialog] = useState({
    open: false,
    code: null
  })

  const handleAdd = () => {
    setDialog({
      open: true,
      code: null
    })
  }

  const handleItem = (it) => {
    console.log(it)
    setDialog({
      open: true,
      code: it.code
    })
  }

  const handleClose = () => {
    setDialog({
      open: false,
      code: null
    })
    setReload(!reload)
  }

  return (<>
    <ClientList reload={reload} onItemClick={handleItem}/>
    <ClientDialog code={dialog.code} open={dialog.open} onClose={handleClose}/>
    <Fab color="primary" className={classes.fab} onClick={handleAdd}>
      <AddIcon/>
    </Fab>
  </>)
}
