import React from "react";
import PropTypes from "prop-types";
import { Grid } from "@mui/material";
import { Field, Form, Formik } from "formik";
import { CheckboxWithLabel, TextField } from "formik-mui";
import { boolean, mixed, number, object } from "yup";
import { DatePickerField } from "../../components/fields/DatePickerField";
import dayjs from "dayjs";

export const EXTERNAL_CONTRACT_FORM_ID = "external-contract-form";

type ContractFormExternalProps = {
  value: any;
  onSubmit: (item: any) => void;
};

export const ContractFormExternal = ({
  value,
  onSubmit,
}: ContractFormExternalProps) => {
  const form = ({ values }) => (
    <Form id={EXTERNAL_CONTRACT_FORM_ID}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Field
            name="hourlyRate"
            type="number"
            label="Hourly rate"
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
      </Grid>
    </Form>
  );

  const schema = object({
    hourlyRate: number().required().default(80),
    hoursPerWeek: number().required().default(40),
    from: mixed().required().default(dayjs()),
    to: mixed().default(null),
    billable: boolean().default(true),
  });

  return (
    <Formik
      initialValues={{ ...schema.default(), ...value }}
      onSubmit={onSubmit}
      validationSchema={schema}
      enableReinitialize
    >
      {form}
    </Formik>
  );
};

ContractFormExternal.propTypes = {
  value: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
};

ContractFormExternal.defaultProps = {
  item: {
    client: null,
    user: null,
  },
};
