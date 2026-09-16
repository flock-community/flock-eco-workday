import { FormControl } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Field, Form, Formik } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-mui';
import { PersonSelectorField } from '../../components/fields/PersonSelectorField';
import { LAPTOP_FORM_SCHEMA, type LaptopFormValues } from './schema';

export const LAPTOP_FORM_ID = 'laptop-form';

type LaptopFormProps = {
  value?: LaptopFormValues;
  onSubmit: (values: LaptopFormValues) => void;
};

export function LaptopForm({ value, onSubmit }: LaptopFormProps) {
  const handleSubmit = (values: LaptopFormValues, { setSubmitting }) => {
    onSubmit(LAPTOP_FORM_SCHEMA.cast(values));
    setSubmitting(false);
  };

  return (
    <Formik
      enableReinitialize
      initialValues={{ ...LAPTOP_FORM_SCHEMA.getDefault(), ...value }}
      validationSchema={LAPTOP_FORM_SCHEMA}
      onSubmit={handleSubmit}
    >
      <Form id={LAPTOP_FORM_ID}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Field
              name="name"
              type="text"
              label="Name"
              fullWidth
              component={TextField}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Field
              name="serialNumber"
              type="text"
              label="Serial number"
              fullWidth
              component={TextField}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <PersonSelectorField name="personId" label="Person" fullWidth />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <Field
                name="contractSigned"
                type="checkbox"
                Label={{ label: 'Contract signed' }}
                component={CheckboxWithLabel}
              />
            </FormControl>
          </Grid>
        </Grid>
      </Form>
    </Formik>
  );
}
