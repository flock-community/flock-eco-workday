import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import { USER_FORM_ID, UserForm } from "./UserForm";
import UserClient from "./UserClient";
import Typography from "@mui/material/Typography";
import { ConfirmDialog } from "@workday-core/components/ConfirmDialog";
import { Snackbar } from "@mui/material";
import { User } from "@workday-user/user/response/user";
import UserIcon from "@mui/icons-material/Person";

import {
  DialogBody,
  DialogHeader,
} from "../../../../../workday-application/src/main/react/components/dialog/DialogHeader";

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
  const [authorities, setAuthorities] = useState<string[]>(null);

  useEffect(() => {
    if (id !== null) {
      UserClient.findUserByid(id)
        .then((res) => setState(res))
        .catch((err) => {
          setMessage(err.message);
        });
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
      .then((res) => {
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

  const handleMessageClose = () => {
    setMessage(null);
  };

  const handleReset = (ev) => {
    UserClient.resetUserPassword(state.id)
      .then((res) => onComplete?.())
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
      <Dialog fullWidth maxWidth={"md"} open={open} onClose={handleClose}>
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
        </DialogBody>
        <DialogActions>
          {enablePassword && state && state.id && (
            <Button onClick={handleReset}>Reset password</Button>
          )}
          {state && state.id && (
            <Button onClick={handleOpenDelete}>Delete</Button>
          )}
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
          Would you Are you sure you want to delete user: {state && state.name}?
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
