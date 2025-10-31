import React from "react";
import * as Yup from "yup";
import { Field, Form, Formik } from "formik";
import Grid from "@material-ui/core/Grid";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { TextField } from "formik-material-ui";
import UserAuthorityUtil from "@workday-user/user_utils/UserAuthorityUtil";
import MenuItem from "@material-ui/core/MenuItem";
import { DatePickerField } from "../../components/fields/DatePickerField";
import { PeriodInputField } from "../../components/fields/PeriodInputField";
import dayjs from "dayjs";
import DayjsUtils from "@date-io/dayjs";
import { LEAVE_DAY_DIALOG_FORM_ID } from "./LeaveDayDialog";

const now = dayjs();

export const schemaLeaveDayForm = Yup.object().shape({
  description: Yup.string().required("Description is required").default(""),
  status: Yup.string().required("Status is required").default("REQUESTED"),
  from: Yup.date().required("From date is required").default(now),
  to: Yup.date().required("To date is required").default(now),
  days: Yup.array().default([8]).nullable(),
});

type LeaveDayFormProps = {
  value: any;
  onSubmit?: (item: any) => void;
};

export function LeaveDayForm({ value, onSubmit }: LeaveDayFormProps) {
  const handleSubmit = (data) => {
    onSubmit?.({
      ...value,
      ...data,
      hours: data.days.reduce((acc, cur) => acc + parseFloat(cur || 0), 0),
    });
  };

  const renderForm = ({ values }) => {
    return (
      <Form id={LEAVE_DAY_DIALOG_FORM_ID}>
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

            {value && (
              <Grid item xs={12}>
                <UserAuthorityUtil has={"LeaveDayAuthority.ADMIN"}>
                  <Field
                    name="status"
                    type="text"
                    label="Status"
                    variant="standard"
                    margin="normal"
                    fullWidth
                    select
                    component={TextField}
                  >
                    <MenuItem value="REQUESTED">REQUESTED</MenuItem>
                    <MenuItem value="APPROVED">APPROVED</MenuItem>
                    <MenuItem value="REJECTED">REJECTED</MenuItem>
                    <MenuItem value="DONE">DONE</MenuItem>
                  </Field>
                </UserAuthorityUtil>
              </Grid>
            )}

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
    <Formik
      enableReinitialize
      initialValues={value}
      onSubmit={handleSubmit}
      validationSchema={schemaLeaveDayForm}
    >
      {renderForm}
    </Formik>
  );
}
