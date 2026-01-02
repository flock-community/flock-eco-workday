import HolidayIcon from '@mui/icons-material/WbSunny';
import { Dialog, MenuItem, Select, Slide } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { ConfirmDialog } from '@workday-core/components/ConfirmDialog';
import { DialogFooter, DialogHeader } from '@workday-core/components/dialog';
import { DialogBody } from '@workday-core/components/dialog/DialogHeader';
import UserAuthorityUtil from '@workday-user/user_utils/UserAuthorityUtil';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { LeaveDayClient } from '../../clients/LeaveDayClient';
import { ISO_8601_DATE } from '../../clients/util/DateFormats';
import { HolidayForm } from './HolidayForm';
import { LeaveDayForm } from './LeaveDayForm';
import { PlusDayForm } from './PlusDayForm';

export const LEAVE_DAY_DIALOG_FORM_ID = 'leave-day-dialog-form-id';

enum Types {
  HOLIDAY = 'HOLIDAY',
  PLUSDAY = 'PLUSDAY',
  PAID_PARENTAL_LEAVE = 'PAID_PARENTAL_LEAVE',
  UNPAID_PARENTAL_LEAVE = 'UNPAID_PARENTAL_LEAVE',
  PAID_LEAVE = 'PAID_LEAVE',
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
}: Readonly<LeaveDayDialogProps>) {
  const [openDelete, setOpenDelete] = useState(false);

  const [state, setState] = useState<any>();
  const [type, setType] = useState<Types>(Types.HOLIDAY);
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
          description: '',
          status: 'REQUESTED',
          from: dayjs(),
          to: dayjs(),
          days: [8],
          hours: '',
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
        maxWidth={'md'}
        fullWidth
      >
        <DialogHeader
          icon={<HolidayIcon />}
          headline="Leave days"
          subheadline="Have the best time of your life, beside working for Flock."
          onClose={handleClose}
        />
        <DialogBody>
          <Grid container spacing={1}>
            {!code && (
              <UserAuthorityUtil has={'LeaveDayAuthority.ADMIN'}>
                <Grid size={{ xs: 12 }}>
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
                    <MenuItem value={Types.PAID_LEAVE}>Paid Leave</MenuItem>
                  </Select>
                </Grid>
              </UserAuthorityUtil>
            )}
            {state && (
              <Grid size={{ xs: 12 }}>
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
                {type === Types.PAID_LEAVE && (
                  <LeaveDayForm value={state} onSubmit={handleSubmit} />
                )}
              </Grid>
            )}
          </Grid>
        </DialogBody>
        <DialogFooter
          formId={LEAVE_DAY_DIALOG_FORM_ID}
          onClose={handleClose}
          onDelete={handleDeleteOpen}
          disableDelete={
            !UserAuthorityUtil.hasAuthority('LeaveDayAuthority.ADMIN') &&
            state &&
            state.status !== 'REQUESTED'
          }
          disableEdit={
            !UserAuthorityUtil.hasAuthority('LeaveDayAuthority.ADMIN') &&
            state &&
            state.status !== 'REQUESTED'
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
