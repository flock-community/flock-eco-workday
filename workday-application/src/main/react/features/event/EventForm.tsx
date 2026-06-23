import { MenuItem } from '@mui/material';
import Grid from '@mui/material/Grid';
import dayjs from 'dayjs';
import { Field, Form, Formik, type FormikProps } from 'formik';
import { TextField } from 'formik-mui';
import { useState } from 'react';
import * as Yup from 'yup';
import { DatePickerField } from '../../components/fields/DatePickerField';
import { PeriodInputField } from '../../components/fields/PeriodInputField';
import { PersonSelectorField } from '../../components/fields/PersonSelectorField';
import { EventTypeMappingToBillable } from '../../utils/mappings';
import { mutatePeriod } from '../period/Period';
import { EventTypeSelect } from './EventTypeSelect';

export const EVENT_FORM_ID = 'event-form';

const schema = Yup.object().shape({
  description: Yup.string().required('Description is required').default(''),
  from: Yup.mixed<dayjs.Dayjs>()
    .required('From date is required')
    .default(() => dayjs()),
  to: Yup.mixed<dayjs.Dayjs>()
    .required('To date is required')
    .default(() => dayjs()),
  days: Yup.array().default([8]).nullable(),
  personIds: Yup.array().default([]),
  costs: Yup.number().required().min(0).default(0),
  type: Yup.string().required('Field required').default('GENERAL_EVENT'),
  budgetCategory: Yup.string().nullable().default(''),
});

type EventFormProps = {
  value: any;
  onSubmit?: (data: any) => void;
};

type EventFormFieldsProps = {
  values: any;
  setFieldValue: FormikProps<any>['setFieldValue'];
};

function EventFormFields({ values, setFieldValue }: EventFormFieldsProps) {
  const [resetHours, setResetHours] = useState<boolean>(false);
  const isExistingEvent = Boolean(values.code);

  const handleEventTypeChange = (newValue: string) => {
    setFieldValue('type', newValue);
    setResetHours(EventTypeMappingToBillable[newValue]);
  };

  return (
    <Form id={EVENT_FORM_ID}>
      <Grid container spacing={1}>
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
          <Field
            name="costs"
            type="number"
            label="Costs"
            fullWidth
            component={TextField}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Field
            name="budgetCategory"
            label="Budget category"
            select
            fullWidth
            disabled={isExistingEvent}
            helperText={
              isExistingEvent
                ? "Budget category can't be changed after creation"
                : undefined
            }
            component={TextField}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="HACK">Hack</MenuItem>
            <MenuItem value="TRAINING">Training</MenuItem>
          </Field>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <PersonSelectorField name="personIds" multiple fullWidth />
        </Grid>
        <Grid size={{ xs: 12 }} style={{ marginTop: '1rem' }}>
          <EventTypeSelect
            value={values.type}
            onChange={handleEventTypeChange}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <DatePickerField name="from" label="From" maxDate={values.to} />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <DatePickerField name="to" label="To" minDate={values.from} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <PeriodInputField
            name="days"
            from={values.from}
            to={values.to}
            reset={resetHours}
          />
        </Grid>
      </Grid>
    </Form>
  );
}

export function EventForm({ value, onSubmit }: EventFormProps) {
  const handleSubmit = (data: any) => {
    onSubmit?.({
      description: data.description,
      personIds: data.personIds,
      from: data.from,
      to: data.to,
      days: data.days,
      costs: data.costs,
      type: data.type,
      budgetCategory: data.budgetCategory,
    });
  };

  const init = { ...schema.getDefault(), ...mutatePeriod(value) };
  return (
    value && (
      <Formik
        enableReinitialize
        initialValues={init}
        onSubmit={handleSubmit}
        validationSchema={schema}
      >
        {({ values, setFieldValue }) => (
          <EventFormFields values={values} setFieldValue={setFieldValue} />
        )}
      </Formik>
    )
  );
}
