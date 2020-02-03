import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import {Dialog, DialogTitle, makeStyles} from "@material-ui/core"
import DialogContent from "@material-ui/core/DialogContent"
import Button from "@material-ui/core/Button"
import DialogActions from "@material-ui/core/DialogActions"
import {ConfirmDialog} from "@flock-eco/core/src/main/react/components/ConfirmDialog"
import Typography from "@material-ui/core/Typography"
import Snackbar from "@material-ui/core/Snackbar"
import {AssignmentClient} from "../../clients/AssignmentClient"
import {isDefined} from "../../utils/validation"
import {ASSIGNMENT_FORM_ID, AssignmentForm} from "./AssignmentForm"
import {usePerson} from "../../hooks/PersonHook"

const useStyles = makeStyles({})

export function AssignmentDialog(props) {
  const {open, code, onClose} = props
  // TODO: remove styles if not used and remove eslint-disable
  const classes = useStyles() // eslint-disable-line

  const [state, setState] = useState(null)
  const [message, setMessage] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [person] = usePerson()

  useEffect(() => {
    if (code) {
      AssignmentClient.get(code).then(res => setState(res))
    } else {
      setState(null)
    }
  }, [code, open])

  const handleSubmit = value => {
    if (code) {
      AssignmentClient.put(code, {...value, personCode: person.code})
        .then(() => onClose && onClose())
        .catch(err => setMessage(err.message))
    } else {
      AssignmentClient.post({...value, personCode: person.code})
        .then(() => onClose && onClose())
        .catch(err => setMessage(err.message))
    }
  }

  const handelDeleteOpen = () => setDeleteOpen(true)
  const handelDeleteClose = () => setDeleteOpen(false)

  const handleDelete = () => {
    AssignmentClient.delete(code)
      .then(() => {
        handelDeleteClose()
        if (isDefined(onClose)) onClose()
      })
      .catch(err => setMessage(err.message))
  }

  const handelMessageClose = () => setMessage(null)

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Assignment form</DialogTitle>
        <DialogContent>
          <AssignmentForm value={state} onSubmit={handleSubmit} />
        </DialogContent>
        <DialogActions>
          {code && <Button onClick={handelDeleteOpen}>Delete</Button>}
          <Button
            variant="contained"
            color="primary"
            type="submit"
            form={ASSIGNMENT_FORM_ID}
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
          Are you sure you would like to delete assignment: &apos;{state && state.code}
          &apos;
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

AssignmentDialog.propTypes = {
  open: PropTypes.bool,
  code: PropTypes.string,
  onClose: PropTypes.func,
}
