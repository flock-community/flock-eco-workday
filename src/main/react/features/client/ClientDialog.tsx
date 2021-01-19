import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogTitle } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import { ConfirmDialog } from "@flock-community/flock-eco-core/src/main/react/components/ConfirmDialog";
import Typography from "@material-ui/core/Typography";
import { ClientClient } from "../../clients/ClientClient";
import { CLIENT_FORM_ID, ClientForm } from "./ClientForm";
import { isDefined } from "../../utils/validation";

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
    ClientClient.delete(code).then(() => {
      handelDeleteClose();
      onClose?.();
    });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Client form</DialogTitle>
        <DialogContent>
          <ClientForm code={code} value={state} onSubmit={handleSubmit} />
        </DialogContent>
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
