import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Grid,
  MenuItem,
  Select,
  Slide,
} from "@material-ui/core";
import { HTML5_FMT } from "moment";
import HolidayIcon from "@material-ui/icons/WbSunny";
import Typography from "@material-ui/core/Typography";
import { ConfirmDialog } from "@flock-community/flock-eco-core/src/main/react/components/ConfirmDialog";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import { DialogFooter, DialogHeader } from "../../components/dialog";
import { HolidayClient } from "../../clients/HolidayClient";
import { HOLIDAY_FORM_ID, HolidayForm, schemaHoliDayForm } from "./HolidayForm";
import { PlusDayForm, schemaPlusDayForm } from "./PlusDayForm";

enum Types {
  HOLIDAY = "HOLIDAY",
  PLUSDAY = "PLUSDAY",
}

type HolidayDialogProps = {
  open: boolean;
  code?: string;
  personId?: string;
  onComplete?: (item?: any) => void;
};

export function HolidayDialog({
  open,
  code,
  personId,
  onComplete,
}: HolidayDialogProps) {
  const [openDelete, setOpenDelete] = useState(false);

  const [state, setState] = useState<any>();
  const [type, setType] = useState<Types>(Types.HOLIDAY);

  const handleSubmit = (it) => {
    const body = {
      ...it,
      from: it.from.format(HTML5_FMT.DATE),
      to: it.to.format(HTML5_FMT.DATE),
      days: it.days ? it.days : null,
      type,
      personId,
    };
    if (code) {
      HolidayClient.put(code, body).then((res) => {
        setState(undefined);
        onComplete?.(res);
      });
    } else {
      HolidayClient.post(body).then((res) => {
        setState(undefined);
        onComplete?.(res);
      });
    }
  };

  useEffect(() => {
    if (open) {
      if (code) {
        HolidayClient.get(code).then((res) => {
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
        setState(
          type === Types.PLUSDAY
            ? schemaPlusDayForm.default()
            : schemaHoliDayForm.default()
        );
      }
    }
  }, [code, open]);

  const handleDelete = () => {
    HolidayClient.delete(code).then(() => {
      onComplete?.();
      setOpenDelete(false);
      setState(undefined);
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
          headline="Holidays"
          subheadline="Have the best time of your life, beside working for flock"
          onClose={handleClose}
        />
        <DialogContent>
          <Grid container spacing={2}>
            {!code && (
              <UserAuthorityUtil has={"HolidayAuthority.ADMIN"}>
                <Grid item xs={12}>
                  <Select
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value as Types);
                    }}
                    fullWidth
                  >
                    <MenuItem value={Types.HOLIDAY}>HoliDay</MenuItem>
                    <MenuItem value={Types.PLUSDAY}>PlusDay</MenuItem>
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
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogFooter
          formId={HOLIDAY_FORM_ID}
          onClose={handleClose}
          onDelete={handleDeleteOpen}
          disableDelete={
            !UserAuthorityUtil.hasAuthority("HolidayAuthority.ADMIN") &&
            state &&
            state.status !== "REQUESTED"
          }
          disableEdit={
            !UserAuthorityUtil.hasAuthority("HolidayAuthority.ADMIN") &&
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
        <Typography>Are you sure you want to remove this Holiday.</Typography>
      </ConfirmDialog>
    </>
  );
}
