import React, { useEffect, useState } from "react";
import { Dialog, Divider } from "@mui/material";
import HealingIcon from "@mui/icons-material/Healing";
import { ConfirmDialog } from "@workday-core/components/ConfirmDialog";
import Typography from "@mui/material/Typography";
import UserAuthorityUtil from "@workday-user/user_utils/UserAuthorityUtil";
import { SickDayClient } from "../../clients/SickDayClient";
import { TransitionSlider } from "../../components/transitions/Slide";
import { DialogFooter, DialogHeader } from "../../components/dialog";
import { schemaSickDayForm, SICKDAY_FORM_ID, SickDayForm } from "./SickDayForm";
import { ISO_8601_DATE } from "../../clients/util/DateFormats";
import { DialogBody } from "../../components/dialog/DialogHeader";
import Grid2 from "@mui/material/Grid2";

type SickDayDialogProps = {
  personFullName: string;
  open: boolean;
  code: string;
  personId?: string;
  onComplete?: (item?: any) => void;
};

type SickDayDialogForm = {
  description: string;
  status: string;
  from: string;
  to: string;
  days: number;
};

export function SickDayDialog({
  personFullName,
  open,
  code,
  personId,
  onComplete,
}: SickDayDialogProps) {
  const [openDelete, setOpenDelete] = useState(false);

  const [state, setState] = useState<SickDayDialogForm>();

  const handleSubmit = (it) => {
    const body = {
      description: it.description,
      status: it.status,
      from: it.from.format(ISO_8601_DATE),
      to: it.to.format(ISO_8601_DATE),
      days: it.days,
      hours: it.days.reduce((acc, cur) => acc + parseFloat(cur), 0),
      personId,
    };
    if (code) {
      SickDayClient.put(code, body).then((res) => {
        setState(undefined);
        onComplete?.(res);
      });
    } else {
      SickDayClient.post(body).then((res) => {
        setState(undefined);
        onComplete?.(res);
      });
    }
  };

  useEffect(() => {
    if (open) {
      if (code) {
        SickDayClient.get(code).then((res) => {
          setState({
            description: res.description,
            status: res.status,
            from: res.from,
            to: res.to,
            days: res.days,
          });
        });
      } else {
        setState(schemaSickDayForm.default());
      }
    }
  }, [code, open]);

  const handleDelete = () => {
    SickDayClient.delete(code).then(() => {
      setOpenDelete(false);
      setState(undefined);
      onComplete?.();
    });
  };

  function handleClose() {
    setState(undefined);
    onComplete?.();
  }

  const handleDeleteOpen = () => {
    setOpenDelete(true);
  };
  const handleDeleteClose = () => {
    setOpenDelete(false);
  };

  const headline = UserAuthorityUtil.hasAuthority("SickdayAuthority.ADMIN")
    ? `Create Sickday | ${personFullName}`
    : "Create Sickday";

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        TransitionComponent={TransitionSlider}
        maxWidth="lg"
        fullWidth
      >
        <DialogHeader
          icon={<HealingIcon />}
          headline={headline}
          subheadline="Add your sick days. Hope you feel better soon."
          onClose={handleClose}
        />
        <DialogBody>
          <Grid2 container spacing={2}>
            <UserAuthorityUtil has={"SickdayAuthority.ADMIN"}>
              <Grid2 size={{ xs: 12 }}>
                <Typography variant={"h5"} component={"h2"}>
                  {personFullName}
                </Typography>
              </Grid2>
            </UserAuthorityUtil>

            {state && (
              <Grid2 size={{ xs: 12 }}>
                <SickDayForm value={state} onSubmit={handleSubmit} />
              </Grid2>
            )}
          </Grid2>
        </DialogBody>
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
        <Typography>Are you sure you want to remove this Sick day?</Typography>
      </ConfirmDialog>
    </>
  );
}
