import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogTitle } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import { ConfirmDialog } from "@flock-community/flock-eco-core/src/main/react/components/ConfirmDialog";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import { HTML5_FMT } from "moment";
import { ContractClient } from "../../clients/ContractClient";
import { isDefined } from "../../utils/validation";
import { ContractFormInternal } from "./ContractFormInternal";
import { ContractFormExternal } from "./ContractFormExternal";
import { usePerson } from "../../hooks/PersonHook";
import { ContractFormManagement } from "./ContractFormManagement";
import { ContractFormService } from "./ContractFormService";
import { ContractType } from "./ContractType";

const useStyles = makeStyles({});

export function ContractDialog(props) {
  const { open, code, onClose } = props;
  // TODO: remove styles if not used and remove eslint-disable
  const classes = useStyles(); // eslint-disable-line

  const [type, setType] = useState("INTERNAL");
  const [state, setState] = useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [person] = usePerson();

  useEffect(() => {
    setState(null);
    setType("INTERNAL");
    if (code) {
      ContractClient.get(code).then(res => {
        setState(res);
        setType(res.type);
      });
    }
  }, [code, open]);

  const handleSubmit = it => {
    const body = {
      ...it,
      from: it.from.format(HTML5_FMT.DATE),
      to: it.to && it.to.format(HTML5_FMT.DATE),
      personCode: person && person.code
    };
    if (code) {
      ContractClient.put(code, type, body).then(() => onClose && onClose());
    } else {
      ContractClient.post(type, body).then(() => onClose && onClose());
    }
  };

  const handleTypeChange = ev => {
    setType(ev.target.value);
  };

  const handelDeleteOpen = () => setDeleteOpen(true);
  const handelDeleteClose = () => setDeleteOpen(false);

  const handleDelete = () => {
    ContractClient.delete(code).then(() => {
      handelDeleteClose();
      if (isDefined(onClose)) onClose();
    });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Contract form</DialogTitle>
        <DialogContent>
          <Grid container spacing={1}>
            {!code && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Select
                    id="contract-type-select"
                    value={type}
                    onChange={handleTypeChange}
                  >
                    <MenuItem value="INTERNAL">Internal</MenuItem>
                    <MenuItem value="EXTERNAL">External</MenuItem>
                    <MenuItem value="MANAGEMENT">Management</MenuItem>
                    <MenuItem value="SERVICE">Service</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              {type === ContractType.INTERNAL && (
                <ContractFormInternal value={state} onSubmit={handleSubmit} />
              )}
              {type === ContractType.EXTERNAL && (
                <ContractFormExternal value={state} onSubmit={handleSubmit} />
              )}
              {type === ContractType.MANAGEMENT && (
                <ContractFormManagement value={state} onSubmit={handleSubmit} />
              )}
              {type === ContractType.SERVICE && (
                <ContractFormService value={state} onSubmit={handleSubmit} />
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          {code && <Button onClick={handelDeleteOpen}>Delete</Button>}
          <Button
            variant="contained"
            color="primary"
            type="submit"
            form={`${type.toLowerCase()}-contract-form`}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={deleteOpen}
        onConfirm={handleDelete}
        onClose={handelDeleteClose}
      >
        <Typography>
          Are you sure you would like to delete contract: &apos;
          {state && state.code}
          &apos;
        </Typography>
      </ConfirmDialog>
    </>
  );
}

ContractDialog.propTypes = {
  open: PropTypes.bool,
  code: PropTypes.string,
  onClose: PropTypes.func
};
