import React from 'react'

import Button from '@material-ui/core/Button'

import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'

const useStyles = makeStyles((theme) => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}))

type ConfirmDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  children: React.ReactNode
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  const classes = useStyles()

  const handleClose = () => {
    onClose && onClose()
  }

  const handleConfirm = () => {
    onConfirm && onConfirm()
  }

  return (
    <Dialog fullWidth maxWidth={'sm'} open={open} onClose={handleClose}>
      <DialogTitle disableTypography>
        <Typography variant="h6">Confirm</Typography>
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleConfirm}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )
}
