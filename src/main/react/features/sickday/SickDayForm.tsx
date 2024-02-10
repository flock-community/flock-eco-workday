import React from "react";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { Field, Form, Formik } from "formik";
import Grid from "@material-ui/core/Grid";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { TextField } from "formik-material-ui";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import MenuItem from "@material-ui/core/MenuItem";
import { DatePickerField } from "../../components/fields/DatePickerField";
import { PeriodInputField } from "../../components/fields/PeriodInputField";
import dayjs from "dayjs";
import DayjsUtils from "@date-io/dayjs";
import { StatusSelect } from "../../components/status/StatusSelect";

export const SICKDAY_FORM_ID = "sick-day-form";

const now = dayjs();

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
      hours: data.days.reduce((acc, cur) => acc + parseFloat(cur || 0), 0),
    });
  };

  const renderForm = ({ values, setFieldValue }) => {
    const handleStatusChange = (newValue) => {
      setFieldValue("status", newValue);
    };

    return (
      <Form id={SICKDAY_FORM_ID}>
        <MuiPickersUtilsProvider utils={DayjsUtils}>
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
                <StatusSelect
                  value={values.status}
                  onChange={handleStatusChange}
                ></StatusSelect>
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
  };

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
