import React from "react";

import Button from "@mui/material/Button";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import { Theme } from "@mui/material/styles";
import EventIcon from "@mui/icons-material/CalendarToday";
import { DialogHeader } from "../../../../../workday-application/src/main/react/components/dialog";

const useStyles = makeStyles((theme: Theme) => ({
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children: React.ReactNode;
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  const classes = useStyles();

  const handleClose = () => {
    onClose && onClose();
  };

  const handleConfirm = () => {
    onConfirm && onConfirm();
  };

  return (
    <Dialog fullWidth maxWidth={"sm"} open={open} onClose={handleClose}>
      <DialogTitle>Confirm</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleConfirm}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
