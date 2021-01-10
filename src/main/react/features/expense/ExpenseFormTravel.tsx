import React from "react";
import { Grid } from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { TextField } from "formik-material-ui";
import * as Yup from "yup";
import { DatePickerField } from "../../components/fields/DatePickerField";
import moment from "moment";

export const EXPENSE_TRAVEL_FORM_ID = "travel-expense-form";

const schema = Yup.object({
  description: Yup.string().required().default(""),
  date: Yup.mixed().required().default(moment()),
  distance: Yup.number().required().default(""),
  allowance: Yup.number().required().default(""),
});

type ExpenseFormTravelProps = {
  value: any;
  onSubmit: (item: any) => void;
};

export const ExpenseFormTravel = ({
  value,
  onSubmit,
}: ExpenseFormTravelProps) => {
  const form = ({ errors }) => {
    console.log(errors);
    return (
      <Form id={EXPENSE_TRAVEL_FORM_ID}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Field
                name="description"
                label="Description"
                fullWidth
                component={TextField}
              />
            </Grid>
            <Grid item xs={12}>
              <DatePickerField name="date" label="Date" fullWidth />
            </Grid>
            <Grid item xs={12}>
              <Field
                name="distance"
                type="number"
                label="Distance"
                fullWidth
                component={TextField}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                name="allowance"
                type="number"
                label="Allowance"
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
      initialValues={{
        ...schema.cast(),
        ...value,
      }}
      onSubmit={onSubmit}
      validationSchema={schema}
      enableReinitialize
    >
      {form}
    </Formik>
  );
};
