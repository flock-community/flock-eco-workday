import { FormControl } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Field, Form, Formik } from 'formik';
import { CheckboxWithLabel, TextField as FormikTextField } from 'formik-mui';
import { DatePickerField } from '../../components/fields/DatePickerField';
import { ShirtSizeSelectorField } from '../../components/fields/ShirtSizeSelectorField';
import { ShoeSizeSelectorField } from '../../components/fields/ShoeSizeSelectorField';
import { UserSelectorField } from '../../components/fields/UserSelectorField';
import { PERSON_FORM_SCHEMA } from './schema';

export const PERSON_FORM_ID = 'person-form';

type PersonFormProps = {
  item: any;
  onSubmit: (item: any) => void;
};

export function PersonForm({ item, onSubmit }: PersonFormProps) {
  const form = () => (
    <Form id={PERSON_FORM_ID}>
      <Grid container size={{ xs: 12 }} spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <Field
              id="firstname"
              type="text"
              label="firstname"
              name="firstname"
              required
              autoFocus
              component={FormikTextField}
            />
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <Field
              id="lastname"
              type="text"
              label="lastname"
              name="lastname"
              required
              component={FormikTextField}
            />
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth>
            <Field
              id="email"
              type="email"
              label="email"
              name="email"
              component={FormikTextField}
            />
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth>
            <Field
              id="number"
              label="number"
              name="number"
              component={FormikTextField}
            />
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <DatePickerField name="birthdate" label="Birthdate" />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <DatePickerField name="joinDate" label="Join date" />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth>
            <UserSelectorField name="userCode" />
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <ShoeSizeSelectorField name="shoeSize" />
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <ShirtSizeSelectorField name="shirtSize" />
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth>
            <Field
              id="googleDriveId"
              type="text"
              label="Google Drive map Id"
              name="googleDriveId"
              component={FormikTextField}
            />
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth>
            <Field
              name="reminders"
              type="checkbox"
              Label={{ label: 'Reminders' }}
              component={CheckboxWithLabel}
            />
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth>
            <Field
              name="receiveEmail"
              type="checkbox"
              Label={{ label: 'Receive system emails' }}
              component={CheckboxWithLabel}
            />
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth>
            <Field
              name="active"
              type="checkbox"
              Label={{ label: 'Active' }}
              component={CheckboxWithLabel}
            />
          </FormControl>
        </Grid>
      </Grid>
    </Form>
  );

  return (
    <Formik
      initialValues={{
        ...PERSON_FORM_SCHEMA.cast(),
        active: true,
        ...item,
        userCode: item?.user,
      }}
      onSubmit={onSubmit}
      validationSchema={PERSON_FORM_SCHEMA}
      enableReinitialize
    >
      {form}
    </Formik>
  );
}
