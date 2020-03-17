import React from "react"
import clsx from "clsx"
import PropTypes from "prop-types"
import {makeStyles} from "@material-ui/styles"
import {Button, DialogActions} from "@material-ui/core"

const useStyles = makeStyles(() => ({
  flex: {
    display: "flex",
  },
  flexRowReverse: {
    flexDirection: "row-reverse",
  },
  justifyContentEnd: {
    justifyContent: "end",
  },
}))

export function DialogFooter({formId, onClose, onSubmit, onDelete}) {
  // reverse the DialogActions with `flex-direction: row-reverse` to enable
  // navigating via tab to the save button first, but position the save button last
  const classes = useStyles()

  return (
    <DialogActions
      className={clsx(classes.flex, classes.flexRowReverse, classes.justifyContentEnd)}
    >
      <Button type="submit" form={formId} color="primary" onClick={onSubmit}>
        Save
      </Button>
      <Button color="secondary" onClick={onClose}>
        Cancel
      </Button>
      {onDelete && (
        <Button color="secondary" onClick={onDelete}>
          Delete
        </Button>
      )}
    </DialogActions>
  )
}

DialogFooter.propTypes = {
  onClose: PropTypes.func.isRequired,
  formId: PropTypes.string.isRequired,
  onSubmit: PropTypes.func,
  onDelete: PropTypes.func,
}

DialogFooter.defaultProps = {
  onSubmit: null,
}
