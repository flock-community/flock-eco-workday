import React from "react";
import * as Yup from "yup";
import {Field, Form, Formik} from "formik";
import moment from "moment";
import Grid from "@material-ui/core/Grid";
import {MuiPickersUtilsProvider} from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import {TextField} from "formik-material-ui";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import MenuItem from "@material-ui/core/MenuItem";
import {DatePickerField} from "../../components/fields/DatePickerField";
import {PeriodInputField} from "../../components/fields/PeriodInputField";

export const HOLIDAY_FORM_ID = "holiday-form-id";

const now = moment();

export const schemaHolidayForm = Yup.object().shape({
  description: Yup.string().required("Field required").default(""),
  status: Yup.string().required("Field required").default("REQUESTED"),
  from: Yup.date().required("From date is required").default(now),
  to: Yup.date().required("To date is required").default(now),
  days: Yup.array().default([8]).nullable(),
});

type HolidayFormProps = {
  value: any;
  onSubmit?: (item: any) => void;
};

export function HolidayForm({value, onSubmit}: HolidayFormProps) {
  const handleSubmit = (data) => {
    onSubmit?.({
      ...value,
      ...data,
      hours: data.days.reduce((acc, cur) => acc + parseFloat(cur), 0)
    });
  };

  const renderForm = ({values}) => {
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
              <PeriodInputField name="days" from={values.from} to={values.to}/>
            </Grid>
          </Grid>
        </MuiPickersUtilsProvider>
      </Form>
    );
  };

  const init = {
    ...schemaHolidayForm.default(),
    ...value,
  }

  return (<Formik
    enableReinitialize
    initialValues={init}
    onSubmit={handleSubmit}
    validationSchema={schemaHolidayForm}
  >
    {renderForm}
  </Formik>);
}
