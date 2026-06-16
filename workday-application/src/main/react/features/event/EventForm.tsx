import Grid from '@mui/material/Grid';
import dayjs from 'dayjs';
import {Field, Form, Formik, type FormikProps} from 'formik';
import {TextField} from 'formik-mui';
import {useState} from 'react';
import * as Yup from 'yup';
import {DatePickerField} from '../../components/fields/DatePickerField';
import {PeriodInputField} from '../../components/fields/PeriodInputField';
import {PersonSelectorField} from '../../components/fields/PersonSelectorField';
import {EventTypeMappingToBillable, EventTypeMappingToDefaultBudgetType} from '../../utils/mappings';
import {mutatePeriod} from '../period/Period';
import {EventTypeSelect} from './EventTypeSelect';
import {FormControl, InputLabel, MenuItem, Select} from '@mui/material';
import {EventBudgetType} from '../../utils/mappings';

export const EVENT_FORM_ID = 'event-form';

const now = dayjs();

export const eventFormSchema = Yup.object().shape({
  description: Yup.string().required('Description is required').default(''),
  from: Yup.date().required('From date is required').default(now),
  to: Yup.date().required('To date is required').default(now),
  days: Yup.array().default([8]).nullable(),
  personIds: Yup.array().default([]),
  budget: Yup.number().required().min(0).default(0),
  type: Yup.string().required('Field required').default('GENERAL_EVENT'),
  defaultTimeAllocationType: Yup.string().nullable().default(null),
});

type EventFormProps = {
  value: any;
  onSubmit?: (data: any) => void;
};

type EventFormFieldsProps = {
  values: any;
  setFieldValue: FormikProps<any>['setFieldValue'];
};

export function EventFormFields({values, setFieldValue}: EventFormFieldsProps) {
  const [resetHours, setResetHours] = useState<boolean>(false);

  const handleEventTypeChange = (newValue: string) => {
    setFieldValue('type', newValue);
    setResetHours(EventTypeMappingToBillable[newValue]);

    // Auto-update default time allocation type based on event type
    const defaultBudgetType = EventTypeMappingToDefaultBudgetType[newValue];
    setFieldValue('defaultTimeAllocationType', defaultBudgetType);
  };

  return (
    <Form id={EVENT_FORM_ID}>
      <Grid container spacing={1}>
        <Grid size={{xs: 12}}>
          <Field
            name="description"
            type="text"
            label="Description"
            fullWidth
            component={TextField}
          />
        </Grid>
        <Grid size={{xs: 12}}>
          <Field
            name="budget"
            type="number"
            label="Budget"
            fullWidth
            component={TextField}
          />
        </Grid>
        <Grid size={{xs: 12}}>
          <PersonSelectorField name="personIds" multiple fullWidth/>
        </Grid>
        <Grid size={{xs: 12}} style={{marginTop: '1rem'}}>
          <EventTypeSelect
            value={values.type}
            onChange={handleEventTypeChange}
          />
        </Grid>
        <Grid size={{xs: 12}}>
          <FormControl fullWidth>
            <InputLabel shrink id="default-time-allocation-type-label">
              Default Time Allocation Type
            </InputLabel>
            <Select
              labelId="default-time-allocation-type-label"
              value={values.defaultTimeAllocationType || ''}
              onChange={(e) =>
                setFieldValue('defaultTimeAllocationType', e.target.value || null)
              }
              label="Default Time Allocation Type"
              displayEmpty={true}
            >
              <MenuItem value="">
                <em>None (no time tracking)</em>
              </MenuItem>
              <MenuItem value={EventBudgetType.STUDY}>
                Study Time (deducts from study hours budget)
              </MenuItem>
              <MenuItem value={EventBudgetType.HACK}>
                Hack Time (deducts from hack hours budget)
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{xs: 6}}>
          <DatePickerField name="from" label="From" maxDate={values.to}/>
        </Grid>
        <Grid size={{xs: 6}}>
          <DatePickerField name="to" label="To" minDate={values.from}/>
        </Grid>
        <Grid size={{xs: 12}}>
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

export function EventForm({value, onSubmit}: EventFormProps) {
  const handleSubmit = (data: any) => {
    onSubmit?.({
      description: data.description,
      personIds: data.personIds,
      from: data.from,
      to: data.to,
      days: data.days,
      budget: data.budget,
      type: data.type,
      defaultTimeAllocationType: data.defaultTimeAllocationType,
    });
  };

  const init = {...eventFormSchema.default(), ...mutatePeriod(value)};
  return (
    value && (
      <Formik
        enableReinitialize
        initialValues={init}
        onSubmit={handleSubmit}
        validationSchema={eventFormSchema}
      >
        {({values, setFieldValue}) => (
          <EventFormFields values={values} setFieldValue={setFieldValue}/>
        )}
      </Formik>
    )
  );
}
