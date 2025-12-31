import React from "react";
import { DialogTitle, IconButton } from "@mui/material";
import Close from "@mui/icons-material/Close";

type DialogTitleClosableProps = {
  onClose?: () => void;
  children?: React.ReactNode;
};

export const DialogTitleClosable: React.FC<DialogTitleClosableProps> = ({
  onClose,
  children,
}) => {
  return (
    <DialogTitle>
      {children}
      {onClose && (
        <IconButton
          data-test="dialog-title-closable"
          sx={{
            position: "absolute",
            right: (theme) => theme.spacing(1),
            top: (theme) => theme.spacing(1),
            color: (theme) => theme.palette.grey[400],
          }}
          onClick={onClose}
          size="large"
        >
          <Close />
        </IconButton>
      )}
    </DialogTitle>
  );
};
