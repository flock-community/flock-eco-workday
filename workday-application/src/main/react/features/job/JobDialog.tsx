import { Dialog, DialogTitle } from '@mui/material';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { ConfirmDialog } from '@workday-core/components/ConfirmDialog';
import { DialogBody } from '@workday-core/components/dialog/DialogHeader';
import { useEffect, useState } from 'react';
import { type Job, JobClient } from '../../clients/JobClient';
import { JOB_FORM_ID, JobForm } from './JobForm';

type JobDialogProps = {
  open: boolean;
  code?: string;
  onClose?: () => void;
};

export function JobDialog({ open, code, onClose }: JobDialogProps) {
  const [state, setState] = useState<Job | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (code) {
      JobClient.get(code).then((res) => setState(res));
    } else {
      setState(null);
    }
  }, [code]);

  const handleSubmit = (value) => {
    if (code) {
      JobClient.put(code, value).then(() => onClose?.());
    } else {
      JobClient.post(value).then(() => onClose?.());
    }
  };

  const handleDeleteOpen = () => setDeleteOpen(true);
  const handleDeleteClose = () => setDeleteOpen(false);

  const handleDelete = () => {
    JobClient.delete(code!).then(() => {
      handleDeleteClose();
      onClose?.();
    });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>Job form</DialogTitle>
        <DialogBody>
          <JobForm value={state} onSubmit={handleSubmit} />
        </DialogBody>
        <DialogActions>
          {code && <Button onClick={handleDeleteOpen}>Delete</Button>}
          <Button
            variant="contained"
            color="primary"
            type="submit"
            form={JOB_FORM_ID}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={deleteOpen}
        onConfirm={handleDelete}
        onClose={handleDeleteClose}
      >
        <Typography>
          Are you sure you would like to delete job: &apos;
          {state?.title}
          &apos;
        </Typography>
      </ConfirmDialog>
    </>
  );
}
