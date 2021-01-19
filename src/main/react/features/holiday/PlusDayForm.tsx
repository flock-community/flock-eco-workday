import React from "react";
import * as Yup from "yup";
import { Field, Form, Formik } from "formik";
import moment from "moment";
import Grid from "@material-ui/core/Grid";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { TextField } from "formik-material-ui";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import MenuItem from "@material-ui/core/MenuItem";
import { DatePickerField } from "../../components/fields/DatePickerField";

export const HOLIDAY_FORM_ID = "holiday-form-id";

const now = moment();

export const schemaPlusDayForm = Yup.object().shape({
  description: Yup.string().required("Field required").default(""),
  status: Yup.string().required("Field required").default("REQUESTED"),
  from: Yup.date().required("From date is required").default(now),
  to: Yup.date().required("To date is required").default(now),
  hours: Yup.string().required("To date is required").default(""),
});

type PlusDayFormProps = {
  value: any;
  onSubmit?: (item: any) => void;
};

export function PlusDayForm({ value, onSubmit }: PlusDayFormProps) {
  const handleSubmit = (data) => {
    onSubmit?.({
      ...value,
      ...data,
      days: null,
    });
  };

  const renderForm = ({ values }) => {
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
                fullWidth
                maxDate={values.to}
              />
            </Grid>
            <Grid item xs={6}>
              <DatePickerField
                name="to"
                label="To"
                fullWidth
                minDate={values.from}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                name="hours"
                type="number"
                label="Hours"
                fullWidth
                component={TextField}
              />
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
      validationSchema={schemaPlusDayForm}
    >
      {renderForm}
    </Formik>
  );
}
