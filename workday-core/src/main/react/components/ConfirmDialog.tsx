import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import type React from 'react';
import { DialogBody } from './dialog/DialogHeader';

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
  const handleClose = () => {
    onClose?.();
  };

  const handleConfirm = () => {
    onConfirm?.();
  };

  return (
    <Dialog fullWidth maxWidth={'sm'} open={open} onClose={handleClose}>
      <DialogTitle>Confirm</DialogTitle>
      <DialogBody>{children}</DialogBody>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleConfirm}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
