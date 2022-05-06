import React from "react";
import PropTypes from "prop-types";
import { Grid } from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DayjsUtils from "@date-io/dayjs";
import { TextField } from "formik-material-ui";
import * as Yup from "yup";
import { DatePickerField } from "../../components/fields/DatePickerField";
import { DropzoneAreaField } from "../../components/fields/DropzoneAreaField";
import dayjs from "dayjs";

export const EXPENSE_COST_FORM_ID = "cost-expense-form";

type ExpenseFormCostProps = {
  value: any;
  onSubmit: (item: any) => void;
};

export const ExpenseFormCost = ({ value, onSubmit }: ExpenseFormCostProps) => {
  const schema = Yup.object({
    description: Yup.string().required().default(""),
    amount: Yup.number().required().default(0),
    date: Yup.mixed().required().default(dayjs()),
    files: Yup.array().default([]),
  });

  const form = () => (
    <Form id={EXPENSE_COST_FORM_ID}>
      <MuiPickersUtilsProvider utils={DayjsUtils}>
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
              name="amount"
              type="number"
              label="Amount"
              fullWidth
              component={TextField}
            />
          </Grid>
          <Grid item xs={12}>
            <DropzoneAreaField name="files" endpoint="/api/expenses/files" />
          </Grid>
        </Grid>
      </MuiPickersUtilsProvider>
    </Form>
  );

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

ExpenseFormCost.propTypes = {
  value: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
};
