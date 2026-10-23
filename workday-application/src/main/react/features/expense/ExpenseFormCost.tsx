import Grid from '@mui/material/Grid';
import dayjs, { type Dayjs } from 'dayjs';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import * as Yup from 'yup';
import { DatePickerField } from '../../components/fields/DatePickerField';
import { DropzoneAreaField } from '../../components/fields/DropzoneAreaField';

import type { UploadedFile } from '../../components/fields/UploadedFile';
import { decimalNumber } from '../../utils/validation';

export const EXPENSE_COST_FORM_ID = 'cost-expense-form';

export type ExpenseCostForm = {
  description: string;
  amount: number;
  date: Dayjs;
  files: UploadedFile[];
};

const schema = Yup.object({
  description: Yup.string().required().default(''),
  amount: decimalNumber().required().default(0),
  date: Yup.mixed()
    .required()
    .default(() => dayjs()),
  files: Yup.array().default([]),
});

type ExpenseFormCostProps = {
  value: any;
  onSubmit: (item: ExpenseCostForm) => void;
};
export const ExpenseFormCost = ({ value, onSubmit }: ExpenseFormCostProps) => {
  const form = () => (
    <Form id={EXPENSE_COST_FORM_ID}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          <Field
            name="description"
            label="Description"
            component={TextField}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <DatePickerField name="date" label="Date" />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Field
            name="amount"
            label="Amount"
            inputProps={{ inputMode: 'decimal' }}
            fullWidth
            component={TextField}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <DropzoneAreaField name="files" endpoint="/api/expenses/files" />
        </Grid>
      </Grid>
    </Form>
  );

  return (
    <Formik
      initialValues={{
        ...schema.getDefault(),
        ...value,
      }}
      onSubmit={(values) => onSubmit(schema.cast(values) as ExpenseCostForm)}
      validationSchema={schema}
      enableReinitialize
    >
      {form}
    </Formik>
  );
};
