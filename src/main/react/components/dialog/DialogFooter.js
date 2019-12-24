import React from "react"
import clsx from "clsx"
import PropTypes from "prop-types"
import {makeStyles} from "@material-ui/styles"
import {DialogActions, Button} from "@material-ui/core"

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

export function DialogFooter(props) {
  const {formId, onClose} = props

  const classes = useStyles()
  // reverse the DialogActions with `flex-direction: row-reverse` to enable
  // navigating via tab to the save button first, but position the save button last
  return (
    <DialogActions
      className={clsx(classes.flex, classes.flexRowReverse, classes.justifyContentEnd)}
    >
      <Button type="submit" form={formId} color="primary">
        Save
      </Button>
      <Button color="secondary" onClick={onClose}>
        Cancel
      </Button>
    </DialogActions>
  )
}

DialogFooter.propTypes = {
  onClose: PropTypes.func.isRequired,
  formId: PropTypes.string.isRequired,
}
