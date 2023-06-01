import React from "react";
import PropTypes from "prop-types";
import { Box, Button, DialogActions } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";

export function DialogFooter({
  formId,
  onClose,
  onSubmit,
  onDelete,
  onExport,
  disableDelete = false,
  disableEdit = false,
  processingExport = false,
}) {
  return (
    <DialogActions>
      {onExport && (
        <Button disabled={processingExport} onClick={onExport}>
          {!processingExport ? (
            <img
              width="16px"
              height="16xpx"
              src="/images/googleDriveIcon.svg"
            />
          ) : (
            <CircularProgress color={"secondary"} size={"20px"} />
          )}
          <Box ml="0.5rem">Export</Box>
        </Button>
      )}
      <Button onClick={onClose}>Cancel</Button>
      {onDelete && !disableDelete && <Button onClick={onDelete}>Delete</Button>}
      {!disableEdit && (
        <Button
          type="submit"
          form={formId}
          color="primary"
          onClick={onSubmit}
          variant="contained"
        >
          Save
        </Button>
      )}
    </DialogActions>
  );
}

DialogFooter.propTypes = {
  onClose: PropTypes.func.isRequired,
  formId: PropTypes.string.isRequired,
  onSubmit: PropTypes.func,
  onDelete: PropTypes.func,
  onExport: PropTypes.func,
  disableDelete: PropTypes.bool,
  disableEdit: PropTypes.bool,
};

DialogFooter.defaultProps = {
  onSubmit: null,
  disableDelete: false,
  disableEdit: false,
};
