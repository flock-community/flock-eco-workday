import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { Field, Form, Formik } from "formik";
import moment from "moment";
import Grid from "@material-ui/core/Grid";
import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import Switch from "@material-ui/core/Switch";
import { Typography } from "@material-ui/core";
import { TextField } from "formik-material-ui";
import * as PropTypes from "prop-types";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import MenuItem from "@material-ui/core/MenuItem";
import { PeriodInputField } from "../../components/fields/PeriodInputField";
import { isDefined } from "../../utils/validation";
import { usePerson } from "../../hooks/PersonHook";
import { AssignmentSelectorField } from "../../components/fields/AssignmentSelectorField";
import { DatePickerField } from "../../components/fields/DatePickerField";
import { DropzoneAreaField } from "../../components/fields/DropzoneAreaField";

export const WORKDAY_FORM_ID = "work-day-form";

const now = moment();

export const schema = Yup.object().shape({
  status: Yup.string()
    .required("Field required")
    .default("REQUESTED"),
  assignmentCode: Yup.string()
    .required("Assignment is required")
    .default(""),
  from: Yup.date()
    .required("From date is required")
    .default(now),
  to: Yup.date()
    .required("To date is required")
    .default(now),
  days: Yup.array().default([8]).nullable(),
  hours: Yup.number().default('0'),
  sheets: Yup.array().default([])
});

/**
 * @return {null}
 */
export function WorkDayForm({ value, onSubmit }) {
  const [person] = usePerson();

  const [daysSwitch, setDaysSwitch] = useState(!value.days);

  useEffect(() => {
    if (value && value.days) {
      setDaysSwitch(value.days.length === 0);
    }
  }, [value]);

  const handleSubmit = data => {
    if (isDefined(onSubmit))
      onSubmit({
        assignmentCode: data.assignmentCode,
        from: data.from,
        to: data.to,
        days: daysSwitch ? undefined : data.days,
        hours: data.hours,
        status: data.status,
        sheets: data.sheets
      });
  };

  const handleSwitchChange = ev => {
    setDaysSwitch(ev.target.checked);
  };

  const renderSwitch = (
    <Grid container alignItems="center" spacing={1}>
      <Grid item>
        <Switch checked={daysSwitch} onChange={handleSwitchChange} />
      </Grid>
      <Grid item>
        <Typography>Hours only</Typography>
      </Grid>
    </Grid>
  );

  const renderFormHours = () => (
    <>
      <Grid item xs={6}>
        <DatePickerField name="from" label="From" fullWidth />
      </Grid>
      <Grid item xs={6}>
        <DatePickerField name="to" label="To" fullWidth />
      </Grid>
      <Grid item xs={12}>
        {renderSwitch}
      </Grid>
      <Grid item xs={12}>
        {daysSwitch ? (
          <Field
            name="hours"
            type="number"
            label="Hours"
            fullWidth
            component={TextField}
          />
        ) : (
          <PeriodInputField
            name="days"
            from={value && value.from}
            to={value && value.to}
          />
        )}
      </Grid>
    </>
  );

  const renderForm = () => (
    <Form id={WORKDAY_FORM_ID}>
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <AssignmentSelectorField
              fullWidth
              name="assignmentCode"
              label="Assignment"
              personCode={person.code}
            />
          </Grid>
          {value && (
            <UserAuthorityUtil has={"WorkDayAuthority.ADMIN"}>
              <Grid item xs={12}>
                <Field
                  fullWidth
                  type="text"
                  name="status"
                  label="Status"
                  select
                  variant="standard"
                  component={TextField}
                >
                  <MenuItem value="REQUESTED">REQUESTED</MenuItem>
                  <MenuItem value="APPROVED">APPROVED</MenuItem>
                  <MenuItem value="REJECTED">REJECTED</MenuItem>
                </Field>
              </Grid>
            </UserAuthorityUtil>
          )}
          <Grid item xs={12}>
            <hr />
          </Grid>
          {renderFormHours()}
          <Grid item xs={12}>
            <hr />
          </Grid>
          <Grid item xs={12}>
            <DropzoneAreaField name="sheets" endpoint="/api/workdays/sheets" />
          </Grid>
        </Grid>
      </MuiPickersUtilsProvider>
    </Form>
  );

  return value ? (
    <Formik
      enableReinitialize
      initialValues={value || schema.default()}
      onSubmit={handleSubmit}
      validationSchema={schema}
      render={renderForm}
    />
  ) : null;
}

WorkDayForm.propTypes = {
  value: PropTypes.object,
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  onSwitchChange: PropTypes.func,
  daysSwitch: PropTypes.func
};
