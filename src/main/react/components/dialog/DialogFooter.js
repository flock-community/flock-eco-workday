import React from "react"
import PropTypes from "prop-types"
import {Button, DialogActions} from "@material-ui/core"

export function DialogFooter({
  formId,
  onClose,
  onSubmit,
  onDelete,
  disableDelete = false,
  disableEdit = false,
}) {
  return (
    <DialogActions>
      <Button onClick={onClose} tabIndex={1}>
        Cancel
      </Button>
      {onDelete && !disableDelete && (
        <Button onClick={onDelete} tabIndex={1}>
          Delete
        </Button>
      )}
      {!disableEdit && (
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
      )}
    </DialogActions>
  )
}

DialogFooter.propTypes = {
  onClose: PropTypes.func.isRequired,
  formId: PropTypes.string.isRequired,
  onSubmit: PropTypes.func,
  onDelete: PropTypes.func,
  disableDelete: PropTypes.bool,
  disableEdit: PropTypes.bool,
}

DialogFooter.defaultProps = {
  onSubmit: null,
  disableDelete: false,
  disableEdit: false,
}
