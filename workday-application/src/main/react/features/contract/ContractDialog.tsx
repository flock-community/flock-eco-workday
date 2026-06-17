import { Dialog, DialogTitle } from '@mui/material';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ConfirmDialog } from '@workday-core/components/ConfirmDialog';
import { DialogBody } from '@workday-core/components/dialog/DialogHeader';
import { useEffect, useState } from 'react';
import { ContractClient } from '../../clients/ContractClient';
import { ISO_8601_DATE } from '../../clients/util/DateFormats';
import { usePerson } from '../../hooks/PersonHook';
import { isDefined } from '../../utils/validation';
import type {
  ContractExternalForm,
  ContractInternalForm,
  ContractManagementForm,
  ContractServiceForm,
} from '../../wirespec/model';
import { ContractFormExternal } from './ContractFormExternal';
import { ContractFormInternal } from './ContractFormInternal';
import { ContractFormManagement } from './ContractFormManagement';
import { ContractFormService } from './ContractFormService';
import { ContractType } from './ContractType';

const _PREFIX = 'ContractDialog';
const _classes = {};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')({});

type ContractDialogProps = {
  open: boolean;
  code?: string;
  onClose?: () => void;
};

export function ContractDialog({ open, code, onClose }: ContractDialogProps) {
  const [type, setType] = useState('INTERNAL');
  const [state, setState] = useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [person] = usePerson();

  useEffect(() => {
    setState(null);
    setType('INTERNAL');
    if (code) {
      ContractClient.get(code).then((res) => {
        setState(res);
        setType(res.type);
      });
    }
  }, [code]);

  const handleSubmit = (it) => {
    const from = it.from.format(ISO_8601_DATE);
    const to = it.to?.format(ISO_8601_DATE);
    const personId = person?.uuid;

    // Each endpoint reads exactly its own Form's fields; build the body per type
    // so contract drift (e.g. a stray personId on SERVICE) is a compile error.
    const buildBody = ():
      | ContractInternalForm
      | ContractExternalForm
      | ContractManagementForm
      | ContractServiceForm => {
      switch (type) {
        case 'INTERNAL':
          return {
            personId,
            monthlySalary: it.monthlySalary,
            hoursPerWeek: it.hoursPerWeek,
            holidayHours: it.holidayHours,
            hackTimeBudget: it.hackTimeBudget,
            billable: it.billable,
            trainingTimeBudget: it.trainingTimeBudget,
            trainingMoneyBudget: it.trainingMoneyBudget,
            from,
            to,
          } satisfies ContractInternalForm;
        case 'EXTERNAL':
          return {
            personId,
            hourlyRate: it.hourlyRate,
            hoursPerWeek: it.hoursPerWeek,
            billable: it.billable,
            from,
            to,
          } satisfies ContractExternalForm;
        case 'MANAGEMENT':
          return {
            personId,
            monthlyFee: it.monthlyFee,
            from,
            to,
          } satisfies ContractManagementForm;
        case 'SERVICE':
          return {
            monthlyCosts: it.monthlyCosts,
            description: it.description,
            from,
            to,
          } satisfies ContractServiceForm;
        default:
          throw new Error(`Unknown contract type: ${type}`);
      }
    };

    const body = buildBody();
    if (code) {
      ContractClient.put(code, type, body).then(() => onClose?.());
    } else {
      ContractClient.post(type, body).then(() => onClose?.());
    }
  };

  const handleTypeChange = (ev) => {
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
    <Root>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Contract form</DialogTitle>
        <DialogBody>
          <Grid container spacing={1}>
            {!code && (
              <Grid size={{ xs: 12 }}>
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
            <Grid size={{ xs: 12 }}>
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
        </DialogBody>

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
          {state?.code}
          &apos;
        </Typography>
      </ConfirmDialog>
    </Root>
  );
}
