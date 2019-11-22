import React, {useEffect, useState} from "react"

import {Dialog, DialogTitle, makeStyles} from "@material-ui/core"
import DialogContent from "@material-ui/core/DialogContent"
import Button from "@material-ui/core/Button"
import DialogActions from "@material-ui/core/DialogActions"
import {ConfirmDialog} from "@flock-eco/core/src/main/react/components/ConfirmDialog"
import Typography from "@material-ui/core/Typography"
import Snackbar from "@material-ui/core/Snackbar"
import {ClientClient} from "../../clients/ClientClient"
import {CLIENT_FORM_ID, ClientForm} from "./ClientForm"

const useStyles = makeStyles({})

export function ClientDialog({open, code, onClose}) {
  const classes = useStyles()

  const [state, setState] = useState(null)
  const [message, setMessage] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    code && ClientClient.get(code).then(res => setState(res))
  }, [code])

  const handleSubmit = value => {
    if (code) {
      ClientClient.put(code, value)
        .then(() => onClose && onClose())
        .catch(err => setMessage(err.message))
    } else {
      ClientClient.post(value)
        .then(() => onClose && onClose())
        .catch(err => setMessage(err.message))
    }
  }

  const handleDelete = value => {
    ClientClient.delete(code)
      .then(() => {
        handelDeleteClose()
        onClose && onClose()
      })
      .catch(err => setMessage(err.message))
  }
  const handelDeleteOpen = () => setDeleteOpen(true)
  const handelDeleteClose = () => setDeleteOpen(false)

  const handelMessageClose = () => setMessage(null)

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Client form</DialogTitle>
        <DialogContent>
          <ClientForm code={code} value={state} onSubmit={handleSubmit} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handelDeleteOpen}>Delete</Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            form={CLIENT_FORM_ID}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={deleteOpen}
        onConfirm={handleDelete}
        onClose={handelDeleteClose}
      >
        <Typography>
          Are you sure you would like to delete client: '{state && state.name}'
        </Typography>
      </ConfirmDialog>
      <Snackbar
        open={!!message}
        autoHideDuration={5000}
        onClose={handelMessageClose}
        message={message}
      />
    </>
  )
}
