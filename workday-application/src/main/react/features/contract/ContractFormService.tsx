import Grid from '@mui/material/Grid';
import dayjs from 'dayjs';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import { mixed, number, object } from 'yup';
import { DatePickerField } from '../../components/fields/DatePickerField';

// form id as a reference point for buttons outside of the <form></form> scope to be
// able to submit this form
export const SERVICE_CONTRACT_FORM_ID = 'service-contract-form';

type ContractFormServiceProps = {
  value: any;
  onSubmit: (item: any) => void;
};
export const ContractFormService = ({
  value,
  onSubmit,
}: ContractFormServiceProps) => {
  const form = ({ values }) => (
    <Form id={SERVICE_CONTRACT_FORM_ID}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          <Field
            name="monthlyCosts"
            type="number"
            label="Monthly costs"
            fullWidth
            component={TextField}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Field
            name="description"
            type="text"
            label="Description"
            fullWidth
            component={TextField}
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
          <DatePickerField name="to" label="End date" minDate={values?.from} />
        </Grid>
      </Grid>
    </Form>
  );

  const init = value && {
    monthlyCost: value.hourlyRate,
    role: value.role,
    from: value.from,
    to: value.to,
  };

  const schema = object({
    monthlyCost: number().required().default(4000),
    from: mixed().required().default(dayjs()),
    to: mixed().default(null),
  });

  return (
    <Formik
      initialValues={{ ...schema.cast(), ...init }}
      onSubmit={onSubmit}
      validationSchema={schema}
      enableReinitialize
    >
      {form}
    </Formik>
  );
};
