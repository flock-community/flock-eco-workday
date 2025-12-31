import React from "react";
import PropTypes from "prop-types";
import { Grid2 } from "@mui/material";
import { Field, Form, Formik } from "formik";
import { TextField } from "formik-mui";
import * as Yup from "yup";
import { DatePickerField } from "../../components/fields/DatePickerField";
import { DropzoneAreaField } from "../../components/fields/DropzoneAreaField";
import dayjs from "dayjs";
import { CostExpense } from "../../models/Expense";

export const EXPENSE_COST_FORM_ID = "cost-expense-form";

type ExpenseFormCostProps = {
  value: any;
  onSubmit: (item: CostExpense) => void;
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
      <Grid2 container spacing={1}>
        <Grid2 size={{ xs: 12 }}>
          <Field
            name="description"
            label="Description"
            component={TextField}
            fullWidth
          />
        </Grid2>
        <Grid2 size={{ xs: 12 }}>
          <DatePickerField name="date" label="Date" />
        </Grid2>
        <Grid2 size={{ xs: 12 }}>
          <Field
            name="amount"
            type="number"
            label="Amount"
            fullWidth
            component={TextField}
          />
        </Grid2>
        <Grid2 size={{ xs: 12 }}>
          <DropzoneAreaField name="files" endpoint="/api/expenses/files" />
        </Grid2>
      </Grid2>
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
