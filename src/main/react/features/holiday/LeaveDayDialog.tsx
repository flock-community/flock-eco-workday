import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Grid,
  MenuItem,
  Select,
  Slide,
} from "@material-ui/core";
import HolidayIcon from "@material-ui/icons/WbSunny";
import Typography from "@material-ui/core/Typography";
import { ConfirmDialog } from "@flock-community/flock-eco-core/src/main/react/components/ConfirmDialog";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import { DialogFooter, DialogHeader } from "../../components/dialog";
import { LeaveDayClient } from "../../clients/LeaveDayClient";
import { HolidayForm } from "./HolidayForm";
import { PlusDayForm } from "./PlusDayForm";
import { ISO_8601_DATE } from "../../clients/util/DateFormats";
import { LeaveDayForm } from "./LeaveDayForm";
import dayjs from "dayjs";

export const LEAVE_DAY_DIALOG_FORM_ID = "leave-day-dialog-form-id";

enum Types {
  HOLIDAY = "HOLIDAY",
  PLUSDAY = "PLUSDAY",
  PAID_PARENTAL_LEAVE = "PAID_PARENTAL_LEAVE",
  UNPAID_PARENTAL_LEAVE = "UNPAID_PARENTAL_LEAVE",
}

type LeaveDayDialogProps = {
  open: boolean;
  code?: string;
  personId?: string;
  onComplete?: (item?: any) => void;
};

export function LeaveDayDialog({
  open,
  code,
  personId,
  onComplete,
}: LeaveDayDialogProps) {
  const [openDelete, setOpenDelete] = useState(false);

  const [state, setState] = useState<any>();
  const [type, setType] = useState<Types>(Types.HOLIDAY);
  const now = dayjs();

  const handleSubmit = (it) => {
    const body = {
      ...it,
      from: it.from.format(ISO_8601_DATE),
      to: it.to.format(ISO_8601_DATE),
      days: it.days ? it.days : null,
      type,
      personId,
    };
    if (code) {
      LeaveDayClient.put(code, body).then((res) => {
        setState(undefined);
        onComplete?.(res);
      });
    } else {
      LeaveDayClient.post(body).then((res) => {
        setState(undefined);
        onComplete?.(res);
      });
    }
  };

  useEffect(() => {
    if (open) {
      if (code) {
        LeaveDayClient.get(code).then((res) => {
          setType(res.type);
          setState({
            description: res.description,
            status: res.status,
            from: res.from,
            to: res.to,
            days: res.days,
            hours: res.hours,
          });
        });
      } else {
        setState({
          description: "",
          status: "REQUESTED",
          from: now,
          to: now,
          days: [8],
          hours: "",
        });
      }
    }
  }, [code, open]);

  const handleDelete = () => {
    LeaveDayClient.delete(code).then(() => {
      onComplete?.();
      setOpenDelete(false);
      setState(undefined);
    });
  };

  function handleClose() {
    setState(undefined);
    setType(Types.HOLIDAY);
    onComplete?.();
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
        open={open}
        onClose={handleClose}
        TransitionComponent={Slide}
        maxWidth={"md"}
        fullWidth
      >
        <DialogHeader
          icon={<HolidayIcon />}
          headline="Leave days"
          subheadline="Have the best time of your life, beside working for Flock."
          onClose={handleClose}
        />
        <DialogContent>
          <Grid container spacing={2}>
            {!code && (
              <UserAuthorityUtil has={"LeaveDayAuthority.ADMIN"}>
                <Grid item xs={12}>
                  <Select
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value as Types);
                    }}
                    fullWidth
                  >
                    <MenuItem value={Types.HOLIDAY}>Holiday</MenuItem>
                    <MenuItem value={Types.PLUSDAY}>Plus Day</MenuItem>
                    <MenuItem value={Types.PAID_PARENTAL_LEAVE}>
                      Paid Parental Leave
                    </MenuItem>
                    <MenuItem value={Types.UNPAID_PARENTAL_LEAVE}>
                      Unpaid Parental Leave
                    </MenuItem>
                  </Select>
                </Grid>
              </UserAuthorityUtil>
            )}
            {state && (
              <Grid item xs={12}>
                {type === Types.HOLIDAY && (
                  <HolidayForm value={state} onSubmit={handleSubmit} />
                )}
                {type === Types.PLUSDAY && (
                  <PlusDayForm value={state} onSubmit={handleSubmit} />
                )}
                {type === Types.PAID_PARENTAL_LEAVE && (
                  <LeaveDayForm value={state} onSubmit={handleSubmit} />
                )}
                {type === Types.UNPAID_PARENTAL_LEAVE && (
                  <LeaveDayForm value={state} onSubmit={handleSubmit} />
                )}
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogFooter
          formId={LEAVE_DAY_DIALOG_FORM_ID}
          onClose={handleClose}
          onDelete={handleDeleteOpen}
          disableDelete={
            !UserAuthorityUtil.hasAuthority("LeaveDayAuthority.ADMIN") &&
            state &&
            state.status !== "REQUESTED"
          }
          disableEdit={
            !UserAuthorityUtil.hasAuthority("LeaveDayAuthority.ADMIN") &&
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
        <Typography>Are you sure you want to remove this Leave Day?</Typography>
      </ConfirmDialog>
    </>
  );
}
