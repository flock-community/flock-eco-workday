import React from "react"
import PropTypes from "prop-types"
import {Button, DialogActions} from "@material-ui/core"

export function DialogFooter({formId, onClose, onSubmit, onDelete}) {
  return (
    <DialogActions>
      <Button onClick={onClose} tabIndex={1}>
        Cancel
      </Button>
      {onDelete && (
        <Button onClick={onDelete} tabIndex={1}>
          Delete
        </Button>
      )}
      <Button
        type="submit"
        form={formId}
        color="primary"
        onClick={onSubmit}
        variant="contained"
        tabIndex={0}
      >
        Save
      </Button>
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
