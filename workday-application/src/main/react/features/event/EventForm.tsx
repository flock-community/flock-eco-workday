import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import dayjs from 'dayjs';
import { Field, Form, Formik, type FormikProps } from 'formik';
import { TextField } from 'formik-mui';
import { useState } from 'react';
import * as Yup from 'yup';
import type { EventType } from '../../clients/EventClient';
import { DatePickerField } from '../../components/fields/DatePickerField';
import { PeriodInputField } from '../../components/fields/PeriodInputField';
import { PersonSelectorField } from '../../components/fields/PersonSelectorField';
import {
  EventTypeBudgetLabel,
  EventTypeMappingToBillable,
} from '../../utils/mappings';
import { mutatePeriod } from '../period/Period';
import { EventParticipants, initParticipants } from './EventParticipants';
import { EventTypeSelect } from './EventTypeSelect';

const sumHours = (days: unknown): number =>
  Array.isArray(days)
    ? days.reduce<number>((acc, cur) => acc + (Number(cur) || 0), 0)
    : 0;

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
  participants: Yup.array().default([]),
  costs: Yup.number().required().min(0).default(0),
  type: Yup.string().required('Field required').default('GENERAL_EVENT'),
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

  const handleEventTypeChange = (newValue: string) => {
    setFieldValue('type', newValue);
    setResetHours(EventTypeMappingToBillable[newValue]);
  };

  const budgetLabel = EventTypeBudgetLabel[values.type];

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
        <Grid size={{ xs: 12 }}>
          <Field
            name="costs"
            type="number"
            label="Costs"
            fullWidth
            component={TextField}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <PersonSelectorField name="personIds" multiple fullWidth />
        </Grid>
        <Grid size={{ xs: 12 }} style={{ marginTop: '1rem' }}>
          <EventTypeSelect
            value={values.type}
            onChange={handleEventTypeChange}
          />
          {budgetLabel && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: 'block' }}
            >
              {budgetLabel}
            </Typography>
          )}
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
        <Grid size={{ xs: 12 }}>
          <EventParticipants
            personIds={values.personIds ?? []}
            participants={values.participants ?? []}
            defaultHours={sumHours(values.days)}
            defaultDays={values.days ?? []}
            from={values.from}
            to={values.to}
            total={Number(values.costs) || 0}
            type={values.type}
            knownPersons={values.persons}
            setFieldValue={setFieldValue}
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
      participants: data.participants,
      from: data.from,
      to: data.to,
      days: data.days,
      costs: data.costs,
      type: data.type,
    });
  };

  const base = { ...schema.getDefault(), ...mutatePeriod(value) };
  const init = {
    ...base,
    participants: initParticipants(
      value.eventDays,
      sumHours(base.days),
      base.type as EventType,
      Number(base.costs) || 0,
      base.days ?? [],
    ),
  };
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
