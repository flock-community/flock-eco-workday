import Grid from '@mui/material/Grid';
import dayjs from 'dayjs';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import * as Yup from 'yup';
import { DatePickerField } from '../../components/fields/DatePickerField';
import { DropzoneAreaField } from '../../components/fields/DropzoneAreaField';
import type { Expense } from '../../wirespec/model/Expense';

export const EXPENSE_COST_FORM_ID = 'cost-expense-form';

type ExpenseFormCostProps = {
  value: any;
  onSubmit: (item: Expense) => void;
};

export const ExpenseFormCost = ({ value, onSubmit }: ExpenseFormCostProps) => {
  const schema = Yup.object({
    description: Yup.string().required().default(''),
    amount: Yup.number().required().default(0),
    date: Yup.mixed().required().default(dayjs()),
    files: Yup.array().default([]),
  });

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
            type="number"
            label="Amount"
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
        ...schema.cast(),
        ...value,
      }}
      onSubmit={onSubmit}
      validationSchema={schema}
      enableReinitialize
    >
      {form}
    </Formik>
  );
};
