import React from 'react'
import {DialogTitle, IconButton, makeStyles, Theme} from '@material-ui/core'

import Close from '@material-ui/icons/Close'

const useStyles = makeStyles((theme: Theme) => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[400],
  },
  title: {
    color: theme.palette.common.black,
  },
}))

type DialogTitleClosableProps = {
  onClose?: () => void
}

export const DialogTitleClosable: React.FC<DialogTitleClosableProps> = ({
  onClose,
  children,
}) => {
  const classes = useStyles()

  return (
    <DialogTitle>
      {children}

      {onClose && (
        <IconButton
          data-test="dialog-title-closable"
          className={classes.closeButton}
          onClick={onClose}
        >
          <Close />
        </IconButton>
      )}
    </DialogTitle>
  )
}
