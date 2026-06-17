import Grid from '@mui/material/Grid';
import dayjs from 'dayjs';
import { Field, Form, Formik } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-mui';
import { boolean, mixed, number, object } from 'yup';
import { DatePickerField } from '../../components/fields/DatePickerField';

export const INTERNAL_CONTRACT_FORM_ID = 'internal-contract-form';

type ContractFormInternalProps = {
  value: any;
  onSubmit: (item: any) => void;
};

export const ContractFormInternal = ({
  value,
  onSubmit,
}: ContractFormInternalProps) => {
  const form = ({ values }) => (
    <Form id={INTERNAL_CONTRACT_FORM_ID}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          <Field
            name="monthlySalary"
            type="number"
            label="Monthly salary"
            fullWidth
            component={TextField}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Field
            name="hoursPerWeek"
            type="number"
            label="Hours per week"
            fullWidth
            component={TextField}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <DatePickerField
            name="from"
            label="Start date"
            maxDate={values.to ? values.to : undefined}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <DatePickerField name="to" label="End date" minDate={values.from} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Field
            name="billable"
            type="checkbox"
            Label={{ label: 'Billable' }}
            component={CheckboxWithLabel}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Field
            name="holidayHours"
            type="number"
            label="Holiday hours"
            fullWidth
            component={TextField}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Field
            name="hackTimeBudget"
            type="number"
            label="Hack time"
            fullWidth
            component={TextField}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Field
            name="trainingTimeBudget"
            type="number"
            label="Training time"
            fullWidth
            component={TextField}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="Per calendar year, based on contract hours"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Field
            name="trainingMoneyBudget"
            type="number"
            label="Training budget"
            fullWidth
            component={TextField}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="Per calendar year, based on contract hours"
          />
        </Grid>
      </Grid>
    </Form>
  );

  const init = value && {
    monthlySalary: value.monthlySalary,
    hoursPerWeek: value.hoursPerWeek,
    from: value.from,
    to: value.to,
    billable: value.billable,
    holidayHours: value.holidayHours,
    hackTimeBudget: value.hackTimeBudget,
    trainingTimeBudget: value.trainingTimeBudget,
    trainingMoneyBudget: value.trainingMoneyBudget,
  };

  const schema = object({
    monthlySalary: number().required().default(4000),
    hoursPerWeek: number().required().default(40),
    from: mixed()
      .required()
      .default(() => dayjs()),
    to: mixed().nullable().default(null),
    billable: boolean().default(true),
    holidayHours: number().required().default(192),
    hackTimeBudget: number().required().default(160),
    trainingTimeBudget: number().required().default(0),
    trainingMoneyBudget: number().required().default(0),
  });

  return (
    <Formik
      initialValues={{ ...schema.getDefault(), ...init }}
      onSubmit={onSubmit}
      validationSchema={schema}
      enableReinitialize
    >
      {form}
    </Formik>
  );
};
