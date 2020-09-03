import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogContent, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import HealingIcon from "@material-ui/icons/Healing";
import { HTML5_FMT } from "moment";
import { ConfirmDialog } from "@flock-community/flock-eco-core/src/main/react/components/ConfirmDialog";
import Typography from "@material-ui/core/Typography";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import { SickDayClient } from "../../clients/SickDayClient";
import { TransitionSlider } from "../../components/transitions/Slide";
import { DialogFooter, DialogHeader } from "../../components/dialog";
import { SICKDAY_FORM_ID, SickDayForm, schemaSickDayForm } from "./SickDayForm";
import { isDefined } from "../../utils/validation";

const useStyles = makeStyles(() => ({
  dialogContent: {
    margin: "auto",
    maxWidth: 768 // should be a decent medium-sized breakpoint
  }
}));

export function SickDayDialog({ open, code, personCode, onComplete }) {
  const classes = useStyles();

  const [openDelete, setOpenDelete] = useState(false);

  const [state, setState] = useState(null);

  const handleSubmit = it => {
    const body = {
      description: it.description,
      status: it.status,
      from: it.from.format(HTML5_FMT.DATE),
      to: it.to.format(HTML5_FMT.DATE),
      days: it.days,
      hours: it.days.reduce((acc, cur) => acc + parseFloat(cur), 0),
      personCode
    };
    if (code) {
      SickDayClient.put(code, body).then(res => {
        if (isDefined(onComplete)) onComplete(res);
      });
    } else {
      SickDayClient.post(body).then(res => {
        if (isDefined(onComplete)) onComplete(res);
      });
    }
  };

  useEffect(() => {
    if (open) {
      if (code) {
        SickDayClient.get(code).then(res => {
          setState({
            description: res.description,
            status: res.status,
            from: res.from,
            to: res.to,
            days: res.days
          });
        });
      } else {
        setState(schemaSickDayForm.cast());
      }
    }
  }, [code, open]);

  const handleDelete = () => {
    SickDayClient.delete(code).then(() => {
      if (isDefined(onComplete)) onComplete();
      setOpenDelete(false);
    });
  };

  function handleClose() {
    if (isDefined(onComplete)) onComplete();
  }

  const handleDeleteOpen = () => {
    setOpenDelete(true);
  };
  const handleDeleteClose = () => {
    setOpenDelete(false);
  };

  return (
    <>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={TransitionSlider}
        TransitionProps={{ direction: "right" }}
      >
        <DialogHeader
          icon={<HealingIcon />}
          headline="Create Sickday"
          subheadline="Add your sick days. Hope you feel better soon."
          onClose={handleClose}
        />
        <DialogContent className={classes.dialogContent}>
          {state && <SickDayForm value={state} onSubmit={handleSubmit} />}
        </DialogContent>
        <Divider />
        <DialogFooter
          formId={SICKDAY_FORM_ID}
          onClose={handleClose}
          onDelete={handleDeleteOpen}
          disableDelete={
            !UserAuthorityUtil.hasAuthority("SickdayAuthority.ADMIN") &&
            state &&
            state.status !== "REQUESTED"
          }
          disableEdit={
            !UserAuthorityUtil.hasAuthority("SickdayAuthority.ADMIN") &&
            state &&
            state.status !== "REQUESTED"
          }
        />
      </Dialog>
      <ConfirmDialog
        open={openDelete}
        onClose={handleDeleteClose}
        onConfirm={handleDelete}
      >
        <Typography>Are you sure you want to remove this Sickday.</Typography>
      </ConfirmDialog>
    </>
  );
}

SickDayDialog.propTypes = {
  open: PropTypes.bool,
  code: PropTypes.string,
  personCode: PropTypes.string,
  onComplete: PropTypes.func
};
