import WorkIcon from '@mui/icons-material/Work';
import { Dialog, Divider } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { ConfirmDialog } from '@workday-core/components/ConfirmDialog';
import { DialogFooter, DialogHeader } from '@workday-core/components/dialog';
import { DialogBody } from '@workday-core/components/dialog/DialogHeader';
import UserAuthorityUtil from '@workday-user/user_utils/UserAuthorityUtil';
import { useEffect, useState } from 'react';
import { ExpenseClient } from '../../clients/ExpenseClient';
import { TransitionSlider } from '../../components/transitions/Slide';
import type { Expense, ExpenseType } from '../../wirespec/model';
import { ExpenseFormCost } from './ExpenseFormCost';
import { ExpenseFormTravel } from './ExpenseFormTravel';

type ExpenseDialogProps = {
  open: boolean;
  id?: string;
  personId: string;
  personFullName: string;
  onComplete?: (item?: Expense) => void;
  expenseType?: ExpenseType;
};

export function ExpenseDialog({
  open,
  id,
  personId,
  personFullName,
  onComplete,
  expenseType,
}: ExpenseDialogProps) {
  const [type, setType] = useState<ExpenseType>('COST');
  const [state, setState] = useState<Expense | undefined>(undefined);
  const [openDelete, setOpenDelete] = useState(false);

  useEffect(() => {
    setState(undefined);
    setType(expenseType ?? 'COST');
    if (id) {
      ExpenseClient.get(id).then((res) => {
        setState(res);
        setType(res.expenseType);
      });
    }
  }, [id, expenseType]);

  const handleTypeChange = (ev) => {
    setType(ev.target.value);
  };

  const handleSubmit = (it: Expense) => {
    if (id) {
      ExpenseClient.put(id, {
        ...it,
        personId: personId,
        expenseType: type,
        status: 'REQUESTED',
        date: it.date,
      }).then((res) => {
        onComplete?.(res);
      });
    } else {
      ExpenseClient.post({
        ...it,
        expenseType: type,
        personId: personId,
        status: 'REQUESTED',
      }).then((res) => {
        onComplete?.(res);
      });
    }
  };

  const handleDelete = () => {
    if (id === undefined) {
      return;
    }

    ExpenseClient.delete(id).then(() => {
      if (onComplete) onComplete();
      setOpenDelete(false);
    });
  };

  const handleDeleteOpen = () => {
    setOpenDelete(true);
  };

  const handleDeleteClose = () => {
    setOpenDelete(false);
  };

  const handleClose = () => {
    onComplete?.();
  };

  const headline = UserAuthorityUtil.hasAuthority('ExpenseAuthority.ADMIN')
    ? `Create expense | ${personFullName}`
    : 'Create expense';
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
          icon={<WorkIcon />}
          headline={headline}
          subheadline="Add your expense."
          onClose={handleClose}
        />
        <DialogBody>
          <Grid container spacing={1}>
            <UserAuthorityUtil has={'ExpenseAuthority.ADMIN'}>
              <Grid size="grow">
                <Typography variant={'h5'} component={'h2'}>
                  {personFullName}
                </Typography>
              </Grid>
            </UserAuthorityUtil>
            {!id && (
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <Select
                    id="contract-type-select"
                    value={type}
                    onChange={handleTypeChange}
                  >
                    <MenuItem value={'COST'}>Cost</MenuItem>
                    <MenuItem value={'TRAVEL'}>Travel</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              {type === 'TRAVEL' && (
                <ExpenseFormTravel value={state} onSubmit={handleSubmit} />
              )}
              {type === 'COST' && (
                <ExpenseFormCost value={state} onSubmit={handleSubmit} />
              )}
            </Grid>
          </Grid>
        </DialogBody>
        <Divider />
        <DialogFooter
          formId={`${type.toLowerCase()}-expense-form`}
          onClose={handleClose}
          onDelete={handleDeleteOpen}
        />
      </Dialog>
      <ConfirmDialog
        open={openDelete}
        onClose={handleDeleteClose}
        onConfirm={handleDelete}
      >
        <Typography>Are you sure you want to remove this expense?</Typography>
      </ConfirmDialog>
    </>
  );
}
