import LaptopIcon from '@mui/icons-material/Laptop';
import { Alert, Dialog, Divider, Typography } from '@mui/material';
import { ConfirmDialog } from '@workday-core/components/ConfirmDialog';
import { DialogFooter, DialogHeader } from '@workday-core/components/dialog';
import { DialogBody } from '@workday-core/components/dialog/DialogHeader';
import { useEffect, useMemo, useState } from 'react';
import { type Laptop, LaptopClient } from '../../clients/LaptopClient';
import { apiErrorMessage } from '../../clients/util/ApiErrorMessage';
import { LAPTOP_FORM_ID, LaptopForm } from './LaptopForm';
import {
  type LaptopFormValues,
  toLaptopFormValues,
  toLaptopRequest,
} from './schema';

type LaptopDialogProps = {
  open: boolean;
  /** Code of the laptop to edit; leave out to register a new one. */
  code?: string;
  onClose: () => void;
};

export function LaptopDialog({ open, code, onClose }: LaptopDialogProps) {
  const [laptop, setLaptop] = useState<Laptop | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setError(null);
    if (!open) return;
    if (code) {
      LaptopClient.get(code).then(setLaptop);
    } else {
      setLaptop(null);
    }
  }, [open, code]);

  const formValue = useMemo(
    () => (laptop ? toLaptopFormValues(laptop) : undefined),
    [laptop],
  );

  const handleSubmit = (values: LaptopFormValues) => {
    setError(null);
    const body = toLaptopRequest(values);
    const request = code
      ? LaptopClient.put(code, body)
      : LaptopClient.post(body);
    request
      .then(() => onClose())
      .catch((err) =>
        setError(apiErrorMessage(err, 'The laptop could not be saved')),
      );
  };

  const handleDelete = () => {
    if (!code) return;
    LaptopClient.delete(code)
      .then(() => {
        setDeleteOpen(false);
        onClose();
      })
      .catch((err) => {
        setDeleteOpen(false);
        setError(apiErrorMessage(err, 'The laptop could not be deleted'));
      });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogHeader
          icon={<LaptopIcon />}
          headline={code ? 'Edit laptop' : 'Register a laptop'}
          subheadline="Name and serial number, and who has it"
          onClose={onClose}
        />
        <DialogBody>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <LaptopForm value={formValue} onSubmit={handleSubmit} />
        </DialogBody>
        <Divider />
        <DialogFooter
          formId={LAPTOP_FORM_ID}
          onClose={onClose}
          onDelete={code ? () => setDeleteOpen(true) : undefined}
        />
      </Dialog>
      <ConfirmDialog
        open={deleteOpen}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      >
        <Typography>
          Are you sure you would like to delete laptop &apos;{laptop?.name}
          &apos;?
        </Typography>
      </ConfirmDialog>
    </>
  );
}
