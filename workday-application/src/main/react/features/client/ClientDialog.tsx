import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle } from "@mui/material";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import { ConfirmDialog } from "@workday-core/components/ConfirmDialog";
import Typography from "@mui/material/Typography";
import { ClientClient } from "../../clients/ClientClient";
import { CLIENT_FORM_ID, ClientForm } from "./ClientForm";
import { DialogBody } from "@workday-core/components/dialog/DialogHeader";

type ClientDialogProps = {
  open: boolean;
  code?: string;
  onClose?: () => void;
};

export function ClientDialog({ open, code, onClose }: ClientDialogProps) {
  const [state, setState] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (code) {
      ClientClient.get(code).then((res) => setState(res));
    }
  }, [code]);

  const handleSubmit = (value) => {
    if (code) {
      ClientClient.put(code, value).then(() => onClose?.());
    } else {
      ClientClient.post(value).then(() => onClose?.());
    }
  };

  const handelDeleteOpen = () => setDeleteOpen(true);
  const handelDeleteClose = () => setDeleteOpen(false);

  const handleDelete = () => {
    ClientClient.delete(code!).then(() => {
      handelDeleteClose();
      onClose?.();
    });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Client form</DialogTitle>
        <DialogBody>
          <ClientForm code={code} value={state} onSubmit={handleSubmit} />
        </DialogBody>
        <DialogActions>
          <Button onClick={handelDeleteOpen}>Delete</Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            form={CLIENT_FORM_ID}
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
          Are you sure you would like to delete client: &apos;
          {state && state.name}
          &apos;
        </Typography>
      </ConfirmDialog>
    </>
  );
}
