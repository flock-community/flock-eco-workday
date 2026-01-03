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
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { ExpenseClient } from '../../clients/ExpenseClient';
import { TransitionSlider } from '../../components/transitions/Slide';
import type {
  CostExpenseFile,
  Expense,
  ExpenseType,
} from '../../wirespec/model';
import { type ExpenseCostForm, ExpenseFormCost } from './ExpenseFormCost';
import { ExpenseFormTravel, type ExpenseTravelForm } from './ExpenseFormTravel';

type ExpenseDialogProps = {
  open: boolean;
  id?: string;
  personId: string;
  personFullName: string;
  onComplete?: (item?: Expense) => void;
  expenseType?: ExpenseType;
};

const toExpenseTravelForm = (
  state?: Expense,
): ExpenseTravelForm | undefined => {
  return state
    ? {
        allowance: state.travelDetails?.allowance,
        date: dayjs(state.date),
        description: state.description,
        distance: state.travelDetails?.distance,
      }
    : undefined;
};

const toExpenseCostForm = (state?: Expense): ExpenseCostForm | undefined => {
  return state
    ? {
        amount: state.costDetails?.amount,
        date: dayjs(state.date),
        description: state.description,
        files:
          state.costDetails?.files?.map((f) => ({
            name: f.name,
            fileReference: f.file,
          })) ?? [],
      }
    : undefined;
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

  const handleSubmit = (expenseForm: ExpenseCostForm | ExpenseTravelForm) => {
    const item: Expense = {
      id: id,
      personId: personId,
      expenseType: type,
      status: 'REQUESTED',
      date: expenseForm.date.toISOString(),
      description: expenseForm.description,
      costDetails:
        'amount' in expenseForm
          ? {
              amount: expenseForm.amount,
              files: expenseForm.files.map(
                (f) =>
                  ({
                    name: f.name,
                    file: f.fileReference,
                  }) satisfies CostExpenseFile,
              ),
            }
          : undefined,
      travelDetails:
        'allowance' in expenseForm
          ? {
              allowance: expenseForm.allowance,
              distance: expenseForm.distance,
            }
          : undefined,
    };

    if (id) {
      ExpenseClient.put(id, {
        ...item,
        status: state.status || 'REQUESTED',
      }).then((res) => {
        onComplete?.(res);
      });
    } else {
      ExpenseClient.post(item).then((res) => {
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
                <ExpenseFormTravel
                  initialState={toExpenseTravelForm(state)}
                  onSubmit={handleSubmit}
                />
              )}
              {type === 'COST' && (
                <ExpenseFormCost
                  value={toExpenseCostForm(state)}
                  onSubmit={handleSubmit}
                />
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
