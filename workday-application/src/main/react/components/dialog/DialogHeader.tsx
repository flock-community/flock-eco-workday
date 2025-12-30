import React, { ReactNode } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Theme } from "@mui/material/styles";
import { Button, DialogTitle, Typography } from "@mui/material";
import Close from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeBtn: {
    alignSelf: "start",
    marginLeft: "auto",
    minWidth: "unset", // override material button property
  },
  dialogTitle: {
    alignItems: "center",
    display: "flex",
  },
  dialogContent: {
    paddingTop: "10px",
    paddingBottom: "10px",
    marginTop: "10px",
    marginBottom: "10px",
  },
  iconWrapper: {
    "& > svg": {
      height: 40,
      width: 40,
    },
  },
  titleText: {
    display: "flex",
    flexDirection: "column",
    marginLeft: "1rem",
  },
}));

type DialogHeaderProps = {
  icon?: React.ReactNode;
  headline?: string;
  subheadline?: string;
  onClose: () => void;
};

type DialogBodyProps = {
  children: React.ReactNode | React.ReactNode[];
};

export const DialogHeader = (props: DialogHeaderProps) => {
  const { icon, headline, subheadline, onClose } = props;
  const classes = useStyles();

  return (
    <DialogTitle className={classes.root}>
      <div className={classes.dialogTitle}>
        <div className={classes.iconWrapper}>{icon}</div>
        <div className={classes.titleText}>
          <Typography variant="body1">{headline}</Typography>
          <Typography variant="caption">{subheadline}</Typography>
        </div>
        <Button className={classes.closeBtn} onClick={onClose}>
          <Close />
        </Button>
      </div>
    </DialogTitle>
  );
};

export const DialogBody = (props: DialogBodyProps) => {
  const classes = useStyles();

  return (
    <div className={classes.dialogContent}>
      <DialogContent>{props.children}</DialogContent>
    </div>
  );
};
