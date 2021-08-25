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
import { DatePickerField } from "../../components/fields/DatePickerField";
import { PeriodInputField } from "../../components/fields/PeriodInputField";
import { mutatePeriod } from "../period/Period";

export const SICKDAY_FORM_ID = "sick-day-form";

const now = moment();

export const schemaSickDayForm = Yup.object().shape({
  description: Yup.string().default(""),
  status: Yup.string().required("Field required").default("REQUESTED"),
  from: Yup.date().required("From date is required").default(now),
  to: Yup.date().required("To date is required").default(now),
  days: Yup.array().default([8]).nullable(),
});

export function SickDayForm({ value, onSubmit }) {
  const handleSubmit = (data) => {
    onSubmit?.({
      ...value,
      ...data,
      hours: data.days.reduce((acc, cur) => acc + parseFloat(cur), 0),
    });
  };

  const renderForm = ({ values }) => (
    <Form id={SICKDAY_FORM_ID}>
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
          <Grid item xs={12}>
            <UserAuthorityUtil has={"SickdayAuthority.ADMIN"}>
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
          <Grid item xs={6}>
            <DatePickerField
              name="from"
              label="From"
              maxDate={values.to}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <DatePickerField
              name="to"
              label="To"
              minDate={values.from}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <PeriodInputField name="days" from={values.from} to={values.to} />
          </Grid>
        </Grid>
      </MuiPickersUtilsProvider>
    </Form>
  );

  return (
    value && (
      <Formik
        enableReinitialize
        initialValues={value}
        onSubmit={handleSubmit}
        validationSchema={schemaSickDayForm}
      >
        {renderForm}
      </Formik>
    )
  );
}

SickDayForm.propTypes = {
  value: PropTypes.object,
  onSubmit: PropTypes.func,
};
