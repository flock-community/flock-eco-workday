import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle } from "@mui/material";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import { ConfirmDialog } from "@workday-core/components/ConfirmDialog";
import Typography from "@mui/material/Typography";
import { AssignmentClient } from "../../clients/AssignmentClient";
import { isDefined } from "../../utils/validation";
import { ASSIGNMENT_FORM_ID, AssignmentForm } from "./AssignmentForm";
import { usePerson } from "../../hooks/PersonHook";
import { ISO_8601_DATE } from "../../clients/util/DateFormats";
import { DialogBody, DialogHeader } from "../../components/dialog/DialogHeader";
import AssignmentIcon from "@mui/icons-material/Assignment";

type AssignmentDialogProps = {
  open: boolean;
  code?: string;
  onClose?: () => void;
};

export function AssignmentDialog({
  open,
  code,
  onClose,
}: AssignmentDialogProps) {

  const [state, setState] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [person] = usePerson();

  useEffect(() => {
    if (code) {
      AssignmentClient.get(code).then((res) => setState(res));
    } else {
      setState(null);
    }
  }, [code, open]);

  const handleSubmit = (it) => {
    const body = {
      ...it,
      from: it.from.format(ISO_8601_DATE),
      to: it.to && it.to.format(ISO_8601_DATE),
      personId: person?.uuid,
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
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <DialogHeader
          headline="Create / Edit an assignment"
          subheadline="What are we working on?"
          icon={<AssignmentIcon />}
          onClose={onClose}
        />
        <DialogBody>
          <AssignmentForm value={state} onSubmit={handleSubmit} />
        </DialogBody>
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
          {state?.code}
          &apos;
        </Typography>
      </ConfirmDialog>
    </>
  );
}
