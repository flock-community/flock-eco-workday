import React from "react";
import { DialogTitle, IconButton, Theme } from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";

import Close from "@mui/icons-material/Close";

const useStyles = makeStyles((theme: Theme) => ({
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[400],
  },
  title: {
    color: theme.palette.common.black,
  },
}));

type DialogTitleClosableProps = {
  onClose?: () => void;
  children?: React.ReactNode;
};

export const DialogTitleClosable: React.FC<DialogTitleClosableProps> = ({
  onClose,
  children,
}) => {
  const classes = useStyles();

  return (
    <DialogTitle>
      {children}
      {onClose && (
        <IconButton
          data-test="dialog-title-closable"
          className={classes.closeButton}
          onClick={onClose}
          size="large"
        >
          <Close />
        </IconButton>
      )}
    </DialogTitle>
  );
};
