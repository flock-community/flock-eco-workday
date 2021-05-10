import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogContent, Divider } from "@material-ui/core";
import WorkIcon from "@material-ui/icons/Work";
import moment from "moment";
import { ConfirmDialog } from "@flock-community/flock-eco-core/src/main/react/components/ConfirmDialog";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { TransitionSlider } from "../../components/transitions/Slide";
import { DialogFooter, DialogHeader } from "../../components/dialog";
import { ExpenseClient } from "../../clients/ExpenseClient";
import { ExpenseFormTravel } from "./ExpenseFormTravel";
import { ExpenseFormCost } from "./ExpenseFormCost";
import { ExpenseType } from "./ExpenseType";

type ExpenseDialogProps = {
  open: boolean;
  id?: string;
  personId?: string;
  onComplete?: (item?: any) => void;
};

export function ExpenseDialog({
  open,
  id,
  personId,
  onComplete,
}: ExpenseDialogProps) {
  const [type, setType] = useState(ExpenseType.COST);
  const [state, setState] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);

  useEffect(() => {
    setState(null);
    setType(ExpenseType.COST);
    if (id) {
      ExpenseClient.get(id).then((res) => {
        setState(res);
        setType(res.type);
      });
    }
  }, [id, open]);

  const handleTypeChange = (ev) => {
    setType(ev.target.value);
  };

  const handleSubmit = (it) => {
    if (id) {
      ExpenseClient.put(id, type, {
        ...it,
        status: "REQUESTED",
        date: it.date.format(moment.HTML5_FMT.DATE),
        personId,
      }).then((res) => {
        onComplete?.(res);
      });
    } else {
      ExpenseClient.post(type, {
        ...it,
        status: "REQUESTED",
        date: it.date.format(moment.HTML5_FMT.DATE),
        personId,
      }).then((res) => {
        onComplete?.(res);
      });
    }
  };

  const handleDelete = () => {
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

  return (
    <>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        // @ts-ignore
        TransitionComponent={TransitionSlider}
        // @ts-ignore
        TransitionProps={{ direction: "right" }}
      >
        <DialogHeader
          icon={<WorkIcon />}
          headline="Create expense"
          subheadline="Add your expense."
          onClose={handleClose}
        />
        <DialogContent>
          <Grid container spacing={1}>
            {!id && (
              <Grid item xs={12}>
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
            <Grid item xs={12}>
              {type === ExpenseType.TRAVEL && (
                <ExpenseFormTravel value={state} onSubmit={handleSubmit} />
              )}
              {type === ExpenseType.COST && (
                <ExpenseFormCost value={state} onSubmit={handleSubmit} />
              )}
            </Grid>
          </Grid>
        </DialogContent>
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
        <Typography>Are you sure you want to remove this expense.</Typography>
      </ConfirmDialog>
    </>
  );
}
