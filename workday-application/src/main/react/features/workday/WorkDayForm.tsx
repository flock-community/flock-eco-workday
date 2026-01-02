import { ButtonGroup, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import UserAuthorityUtil from '@workday-user/user_utils/UserAuthorityUtil';
import dayjs from 'dayjs';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { AssignmentSelectorField } from '../../components/fields/AssignmentSelectorField';
import { DatePickerField } from '../../components/fields/DatePickerField';
import { DropzoneAreaField } from '../../components/fields/DropzoneAreaField';
import { PeriodInputField } from '../../components/fields/PeriodInputField';
import { StatusSelect } from '../../components/status/StatusSelect';
import { usePerson } from '../../hooks/PersonHook';
import { type DatePreset, datePresets } from '../../utils/DatePreset';
import { isDefined } from '../../utils/validation';
import { mutatePeriod } from '../period/Period';

export const WORKDAY_FORM_ID = 'work-day-form';

const now = dayjs();

export const schema = Yup.object().shape({
  status: Yup.string().required('Field required').default('REQUESTED'),
  assignmentCode: Yup.string()
    .required('Assignment is required')
    .nullable()
    .default(''),
  from: Yup.date().required('From date is required').default(now),
  to: Yup.date().required('To date is required').default(now),
  days: Yup.array().default([8]).nullable(),
  hours: Yup.number().default('0'),
  sheets: Yup.array().default([]),
});

type WorkDayFormProps = {
  value: any;
  onSubmit?: (data: any) => Promise<void> | void;
};

export function WorkDayForm({ value, onSubmit }: WorkDayFormProps) {
  const [person] = usePerson();

  const [daysSwitch, setDaysSwitch] = useState(!value.days);

  useEffect(() => {
    setDaysSwitch(!value.days);
  }, [value]);

  const handleSubmit = (data: any) => {
    if (isDefined(onSubmit)) {
      return onSubmit({
        assignmentCode: data.assignmentCode,
        from: data.from,
        to: data.to,
        days: daysSwitch ? undefined : data.days,
        hours: data.hours,
        status: data.status,
        sheets: data.sheets,
      });
    } else {
      return Promise.resolve();
    }
  };

  const handleSwitchChange = (ev) => {
    setDaysSwitch(ev.target.checked);
  };

  const renderSwitch = (
    <Grid container alignItems="center" spacing={1}>
      <Grid>
        <Switch checked={daysSwitch} onChange={handleSwitchChange} />
      </Grid>
      <Grid>
        <Typography>Hours only</Typography>
      </Grid>
    </Grid>
  );

  const renderDatePresetButtons = (setFieldValue: any) => {
    const setPeriod = (datePreset: DatePreset) => {
      setFieldValue('to', datePreset.to);
      setFieldValue('from', datePreset.from);
    };

    return (
      <ButtonGroup size="small" fullWidth>
        {datePresets.map((datePreset) => (
          <Button
            key={datePreset.title}
            variant="outlined"
            onClick={() => setPeriod(datePreset)}
          >
            {datePreset.title}
          </Button>
        ))}
      </ButtonGroup>
    );
  };

  const renderFormHours = ({ values, setFieldValue }) => (
    <>
      <Grid size={{ xs: 6 }}>
        <DatePickerField name="from" label="From" maxDate={values.to} />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <DatePickerField name="to" label="To" minDate={values.from} />
      </Grid>
      <Grid size={{ xs: 12 }}>{renderDatePresetButtons(setFieldValue)}</Grid>
      {(UserAuthorityUtil.hasAuthority('WorkDayAuthority.ADMIN') ||
        UserAuthorityUtil.hasAuthority('WorkDayAuthority.TOTAL_HOURS')) && (
        <Grid size={{ xs: 12 }}>{renderSwitch}</Grid>
      )}
      <Grid size={{ xs: 12 }}>
        {daysSwitch ? (
          <Field
            name="hours"
            type="number"
            label="Hours"
            component={TextField}
          />
        ) : (
          <PeriodInputField name="days" from={values.from} to={values.to} />
        )}
      </Grid>
    </>
  );

  const renderForm = ({ values, setFieldValue, isSubmitting }) => {
    const handleStatusChange = (newValue) => {
      setFieldValue('status', newValue);
    };

    return (
      <Form id={WORKDAY_FORM_ID}>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12 }}>
            <AssignmentSelectorField
              id="Assignment"
              name="assignmentCode"
              label="Assignment"
              personId={person?.uuid}
              from={values.from}
              to={values.to}
            />
          </Grid>

          <UserAuthorityUtil has={'WorkDayAuthority.ADMIN'}>
            <Grid size={{ xs: 12 }}>
              <StatusSelect
                value={values.status}
                onChange={handleStatusChange}
              ></StatusSelect>
            </Grid>
          </UserAuthorityUtil>
          <Grid size={{ xs: 12 }}>
            <hr />
          </Grid>
          {renderFormHours({ values, setFieldValue })}
          <Grid size={{ xs: 12 }}>
            <hr />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <DropzoneAreaField name="sheets" endpoint="/api/workdays/sheets" />
          </Grid>
        </Grid>
      </Form>
    );
  };

  return value ? (
    <Formik
      enableReinitialize
      initialValues={mutatePeriod(value) || schema.default()}
      onSubmit={handleSubmit}
      validationSchema={schema}
    >
      {renderForm}
    </Formik>
  ) : null;
}
