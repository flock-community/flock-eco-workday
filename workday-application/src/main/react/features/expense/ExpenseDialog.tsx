import React, { useEffect, useState } from "react";
import { Dialog, Divider } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import { ConfirmDialog } from "@workday-core/components/ConfirmDialog";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { TransitionSlider } from "../../components/transitions/Slide";
import { DialogFooter, DialogHeader } from "../../components/dialog";
import {
  emptyPersonWithUUID,
  ExpenseClient,
} from "../../clients/ExpenseClient";
import { ExpenseFormTravel } from "./ExpenseFormTravel";
import { ExpenseFormCost } from "./ExpenseFormCost";
import UserAuthorityUtil from "@workday-user/user_utils/UserAuthorityUtil";
import {
  CostExpense,
  Expense,
  ExpenseType,
  TravelExpense,
} from "../../models/Expense";
import { Status } from "../../models/Status";
import { DialogBody } from "../../components/dialog/DialogHeader";

type ExpenseDialogProps = {
  open: boolean;
  id?: string;
  personId?: string;
  personFullName: string;
  onComplete?: (item?: CostExpense | TravelExpense) => void;
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
  const [type, setType] = useState(ExpenseType.COST);
  const [state, setState] = useState<Expense | undefined>(undefined);
  const [openDelete, setOpenDelete] = useState(false);

  useEffect(() => {
    setState(undefined);
    setType(expenseType ?? ExpenseType.COST);
    if (id) {
      ExpenseClient.get(id).then((res) => {
        setState(res);
        setType(res.expenseType);
      });
    }
  }, [id, open]);

  const handleTypeChange = (ev) => {
    setType(ev.target.value);
  };

  const handleSubmit = (it: CostExpense | TravelExpense) => {
    if (id) {
      ExpenseClient.put(id, {
        ...it,
        person: emptyPersonWithUUID(personId!),
        expenseType:
          type === ExpenseType.COST ? ExpenseType.COST : ExpenseType.TRAVEL,
        status: Status.REQUESTED,
        date: it.date,
        files: it.files,
      }).then((res: CostExpense | TravelExpense) => {
        onComplete?.(res);
      });
    } else {
      ExpenseClient.post({
        ...it,
        expenseType:
          type === ExpenseType.COST ? ExpenseType.COST : ExpenseType.TRAVEL,
        person: emptyPersonWithUUID(personId!),
        status: Status.REQUESTED,
        date: it.date,
        files: it.files,
      }).then((res: CostExpense | TravelExpense) => {
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

  const headline = UserAuthorityUtil.hasAuthority("ExpenseAuthority.ADMIN")
    ? `Create expense | ${personFullName}`
    : "Create expense";
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
            <UserAuthorityUtil has={"ExpenseAuthority.ADMIN"}>
              <Grid size="grow">
                <Typography variant={"h5"} component={"h2"}>
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
                    <MenuItem value={ExpenseType.COST}>Cost</MenuItem>
                    <MenuItem value={ExpenseType.TRAVEL}>Travel</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              {type === ExpenseType.TRAVEL && (
                <ExpenseFormTravel value={state} onSubmit={handleSubmit} />
              )}
              {type === ExpenseType.COST && (
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
