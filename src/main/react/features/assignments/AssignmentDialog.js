import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogTitle } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import { ConfirmDialog } from "@flock-community/flock-eco-core/src/main/react/components/ConfirmDialog";
import Typography from "@material-ui/core/Typography";
import { HTML5_FMT } from "moment";
import { AssignmentClient } from "../../clients/AssignmentClient";
import { isDefined } from "../../utils/validation";
import { ASSIGNMENT_FORM_ID, AssignmentForm } from "./AssignmentForm";
import { usePerson } from "../../hooks/PersonHook";

const useStyles = makeStyles({});

export function AssignmentDialog(props) {
  const { open, code, onClose } = props;
  // TODO: remove styles if not used and remove eslint-disable
  const classes = useStyles(); // eslint-disable-line

  const [state, setState] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [person] = usePerson();

  useEffect(() => {
    if (code) {
      AssignmentClient.get(code).then(res => setState(res));
    } else {
      setState(null);
    }
  }, [code, open]);

  const handleSubmit = it => {
    const body = {
      ...it,
      from: it.from.format(HTML5_FMT.DATE),
      to: it.to && it.to.format(HTML5_FMT.DATE),
      personCode: person.code
    };
    if (code) {
      AssignmentClient.put(code, body).then(() => onClose && onClose());
    } else {
      AssignmentClient.post(body).then(() => onClose && onClose());
    }
  };

  const handelDeleteOpen = () => setDeleteOpen(true);
  const handelDeleteClose = () => setDeleteOpen(false);

  const handleDelete = () => {
    AssignmentClient.delete(code).then(() => {
      handelDeleteClose();
      if (isDefined(onClose)) onClose();
    });
  };

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
          Are you sure you would like to delete assignment: &apos;
          {state && state.code}
          &apos;
        </Typography>
      </ConfirmDialog>
    </>
  );
}

AssignmentDialog.propTypes = {
  open: PropTypes.bool,
  code: PropTypes.string,
  onClose: PropTypes.func
};
