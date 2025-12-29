import Grid from '@mui/material/Grid';
import dayjs from 'dayjs';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import * as Yup from 'yup';
import { DatePickerField } from '../../components/fields/DatePickerField';
import type { Expense } from '../../wirespec/model';

export const EXPENSE_TRAVEL_FORM_ID = 'travel-expense-form';

export type ExpenseTravelForm = {
  description: String
  date: Date;
  distance: number;
  allowance: number;
};

export const schema = Yup.object({
  description: Yup.string().required().default(''),
  date: Yup.mixed().required().default(dayjs()),
  distance: Yup.number().required().default(''),
  allowance: Yup.number().required().default(''),
});

type ExpenseFormTravelProps = {
  value: any;
  onSubmit: (item: ExpenseTravelForm) => void;
};

export const ExpenseFormTravel = ({
  value,
  onSubmit,
}: ExpenseFormTravelProps) => {
  const form = ({ errors }) => {
    return (
      <Form id={EXPENSE_TRAVEL_FORM_ID}>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12 }}>
            <Field
              name="description"
              label="Description"
              fullWidth
              component={TextField}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <DatePickerField name="date" label="Date" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Field
              name="distance"
              type="number"
              label="Distance"
              fullWidth
              component={TextField}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Field
              name="allowance"
              type="number"
              label="Allowance"
              fullWidth
              component={TextField}
            />
          </Grid>
        </Grid>
      </Form>
    );
  };

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
