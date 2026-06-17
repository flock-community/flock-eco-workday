import UserIcon from '@mui/icons-material/Person';
import { Snackbar } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { ConfirmDialog } from '@workday-core/components/ConfirmDialog';
import { DialogBody, DialogHeader } from '@workday-core/components/dialog';
import type { User, UserAccount } from '@workday-user/user/response/user';
import { useEffect, useState } from 'react';
import { UserAccountList } from './UserAccountList';
import UserClient from './UserClient';
import { USER_FORM_ID, UserForm } from './UserForm';

type UserDialogProps = {
  open: boolean;
  id: string;
  onComplete: () => void;
  enablePassword: boolean;
};

export function UserDialog({
  open,
  id,
  onComplete,
  enablePassword,
}: UserDialogProps) {
  const [state, setState] = useState<User>(null);

  const [message, setMessage] = useState<string>(null);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [deleteAccount, setDeleteAccount] = useState<UserAccount>(null);
  const [authorities, setAuthorities] = useState<string[]>(null);

  const loadUser = (userId: string) => {
    UserClient.findUserByid(userId)
      .then((res) => setState(res))
      .catch((err) => {
        setMessage(err.message);
      });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadUser is stable; only id should retrigger the fetch
  useEffect(() => {
    if (id !== null) {
      loadUser(id);
    } else {
      setState(null);
    }
  }, [id]);

  useEffect(() => {
    UserClient.findAllAuthorities()
      .then(setAuthorities)
      .catch((err) => {
        setMessage(err.message);
      });
  }, []);

  const handleDelete = () => {
    UserClient.deleteUser(state.id)
      .then((_res) => {
        onComplete?.();
        setOpenDelete(false);
      })
      .catch((err) => {
        setMessage(err.message);
      });
  };

  const handleOpenDelete = () => {
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
  };

  const handleDeleteAccount = () => {
    UserClient.deleteUserAccount(deleteAccount.id)
      .then(() => {
        setDeleteAccount(null);
        loadUser(state.id);
      })
      .catch((err) => {
        setMessage(err.message);
      });
  };

  const handleMessageClose = () => {
    setMessage(null);
  };

  const handleReset = (_ev) => {
    UserClient.resetUserPassword(state.id)
      .then((_res) => onComplete?.())
      .catch((err) => {
        setMessage(err.message);
      });
  };

  const handleClose = () => {
    onComplete?.();
  };

  const handleSubmit = (value) => {
    if (value.id) {
      UserClient.updateUser(value.id, value)
        .then(() => onComplete?.())
        .catch((err) => {
          setMessage(err.message);
        });
    } else {
      UserClient.createUser(value)
        .then(() => onComplete?.())
        .catch((err) => {
          setMessage(err.message);
        });
    }
  };

  return (
    <>
      <Dialog fullWidth maxWidth={'md'} open={open} onClose={handleClose}>
        <DialogHeader
          icon={<UserIcon />}
          headline="Create user"
          subheadline="Create another user that can access the workday application"
          onClose={handleClose}
        ></DialogHeader>
        <DialogBody>
          <UserForm
            value={state}
            authorities={authorities}
            onSummit={handleSubmit}
          />
          {state?.id && (
            <UserAccountList
              accounts={state.accounts}
              onDelete={setDeleteAccount}
            />
          )}
        </DialogBody>
        <DialogActions>
          {enablePassword && state && state.id && (
            <Button onClick={handleReset}>Reset password</Button>
          )}
          {state?.id && <Button onClick={handleOpenDelete}>Delete</Button>}
          <Button
            variant="contained"
            color="primary"
            form={USER_FORM_ID}
            type="submit"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={openDelete}
        onClose={handleCloseDelete}
        onConfirm={handleDelete}
      >
        <Typography>
          Are you sure you want to delete user: {state?.name}?
        </Typography>
      </ConfirmDialog>
      <ConfirmDialog
        open={deleteAccount != null}
        onClose={() => setDeleteAccount(null)}
        onConfirm={handleDeleteAccount}
      >
        <Typography>
          Are you sure you want to delete this account for {state?.name}?
        </Typography>
      </ConfirmDialog>
      <Snackbar
        open={message != null}
        message={message}
        autoHideDuration={6000}
        onClose={handleMessageClose}
      />
    </>
  );
}
