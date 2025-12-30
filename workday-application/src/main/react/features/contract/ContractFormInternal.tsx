import React from "react";
import PropTypes from "prop-types";
import { Grid } from "@mui/material";
import { Field, Form, Formik } from "formik";
import { CheckboxWithLabel, TextField } from "formik-mui";
import { boolean, mixed, number, object } from "yup";
import { DatePickerField } from "../../components/fields/DatePickerField";
import dayjs from "dayjs";

export const INTERNAL_CONTRACT_FORM_ID = "internal-contract-form";

type ContractFormInternalProps = {
  value: any;
  onSubmit: (item: any) => void;
};

export const ContractFormInternal = ({
  value,
  onSubmit,
}: ContractFormInternalProps) => {
  const form = ({ values }) => (
    <Form id={INTERNAL_CONTRACT_FORM_ID}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Field
            name="monthlySalary"
            type="number"
            label="Monthly salary"
            fullWidth
            component={TextField}
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            name="hoursPerWeek"
            type="number"
            label="Hours per week"
            fullWidth
            component={TextField}
          />
        </Grid>
        <Grid item xs={6}>
          <DatePickerField
            name="from"
            label="Start date"
            maxDate={values.to ? values.to : undefined}
          />
        </Grid>
        <Grid item xs={6}>
          <DatePickerField name="to" label="End date" minDate={values.from} />
        </Grid>
        <Grid item xs={12}>
          <Field
            name="billable"
            type="checkbox"
            Label={{ label: "Billable" }}
            component={CheckboxWithLabel}
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            name="holidayHours"
            type="number"
            label="Holiday hours"
            component={TextField}
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            name="hackHours"
            type="number"
            label="Hack hours"
            fullWidth
            component={TextField}
          />
        </Grid>
      </Grid>
    </Form>
  );

  const init = value && {
    monthlySalary: value.monthlySalary,
    hoursPerWeek: value.hoursPerWeek,
    from: value.from,
    to: value.to,
    billable: value.billable,
    holidayHours: value.holidayHours,
    hackHours: value.hackHours,
  };

  const schema = object({
    monthlySalary: number().required().default(4000),
    hoursPerWeek: number().required().default(40),
    from: mixed().required().default(dayjs()),
    to: mixed().default(null),
    billable: boolean().default(true),
    holidayHours: number().required().default(192),
    hackHours: number().required().default(160),
  });

  return (
    <Formik
      initialValues={{ ...schema.cast(), ...init }}
      onSubmit={onSubmit}
      validationSchema={schema}
      enableReinitialize
    >
      {form}
    </Formik>
  );
};

ContractFormInternal.propTypes = {
  value: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
};

ContractFormInternal.defaultProps = {
  item: {
    client: null,
    user: null,
  },
};
