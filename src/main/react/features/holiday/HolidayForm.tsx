import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { Field, Form, Formik } from "formik";
import moment from "moment";
import Grid from "@material-ui/core/Grid";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { TextField } from "formik-material-ui";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import MenuItem from "@material-ui/core/MenuItem";
import { isDefined } from "../../utils/validation";
import { DatePickerField } from "../../components/fields/DatePickerField.tsx";
import { PeriodInputField } from "../../components/fields/PeriodInputField";
import { editDay, mutatePeriod } from "../period/Period.tsx";

export const HOLIDAY_FORM_ID = "holiday-form-id";

const now = moment();

export const schemaHolidayForm = Yup.object().shape({
  description: Yup.string()
    .required("Field required")
    .default(""),
  status: Yup.string()
    .required("Field required")
    .default("REQUESTED"),
  from: Yup.date()
    .required("From date is required")
    .default(now),
  to: Yup.date()
    .required("To date is required")
    .default(now),
  days: Yup.array()
    .default([8])
    .nullable(),
});

export function HolidayForm({ value, onSubmit }) {
  const [period, setPeriod] = useState(
    mutatePeriod({
      from: moment(),
      to: moment()
    })
  );

  const handleSubmit = data => {
    console.log('submit')
    if (isDefined(onSubmit))
      onSubmit({
        ...value,
        ...data,
        ...period
      });
  };

  useEffect(() => {
    setPeriod(
      mutatePeriod({
        from: value.from.clone(),
        to: value.to.clone(),
        days: value.days
      })
    );
  }, [value]);

  const renderForm = ({errors}) => {
    console.log(errors)
    return (

      <Form id={HOLIDAY_FORM_ID}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Field
                name="description"
                type="text"
                label="Description"
                fullWidth
                component={TextField}
              />
            </Grid>

            {value && (
              <Grid item xs={12}>
                <UserAuthorityUtil has={"HolidayAuthority.ADMIN"}>
                  <Field
                    fullWidth
                    type="text"
                    name="status"
                    label="Status"
                    select
                    variant="standard"
                    margin="normal"
                    component={TextField}
                  >
                    <MenuItem value="REQUESTED">REQUESTED</MenuItem>
                    <MenuItem value="APPROVED">APPROVED</MenuItem>
                    <MenuItem value="REJECTED">REJECTED</MenuItem>
                  </Field>
                </UserAuthorityUtil>
              </Grid>
            )}
            <Grid item xs={6}>
              <DatePickerField
                name="from"
                label="From"
                onChange={it =>
                  setPeriod(mutatePeriod(period, { from: it, to: period.to }))
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <DatePickerField
                name="to"
                label="To"
                onChange={it =>
                  setPeriod(mutatePeriod(period, { from: period.from, to: it }))
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <PeriodInputField
                name="days"
                from={period.from}
                to={period.to}
                days={period.days}
                editDay={(date, day) => setPeriod(editDay(period, date, day))}
              />
            </Grid>
          </Grid>
        </MuiPickersUtilsProvider>
      </Form>
    );
  }

  return (
    value && (
      <Formik
        enableReinitialize
        initialValues={value}
        onSubmit={handleSubmit}
        validationSchema={schemaHolidayForm}
        render={renderForm}
      />
    )
  );
}

HolidayForm.propTypes = {
  value: PropTypes.object,
  onSubmit: PropTypes.func
};
