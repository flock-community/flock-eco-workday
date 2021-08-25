import React from "react";
import PropTypes from "prop-types";
import { Grid } from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { CheckboxWithLabel, TextField } from "formik-material-ui";
import { mixed, number, object, boolean } from "yup";
import moment from "moment";
import { DatePickerField } from "../../components/fields/DatePickerField";

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
      <MuiPickersUtilsProvider utils={MomentUtils}>
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
              fullWidth
              maxDate={values.to ? values.to : undefined}
            />
          </Grid>
          <Grid item xs={6}>
            <DatePickerField
              name="to"
              label="End date"
              fullWidth
              minDate={values.from}
              clearable
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              name="billable"
              type="checkbox"
              Label={{ label: "Billable" }}
              component={CheckboxWithLabel}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              name="holidayHours"
              type="number"
              label="Holiday hours"
              fullWidth
              component={TextField}
            />
          </Grid>
        </Grid>
      </MuiPickersUtilsProvider>
    </Form>
  );

  const init = value && {
    monthlySalary: value.monthlySalary,
    hoursPerWeek: value.hoursPerWeek,
    from: value.from,
    to: value.to,
    billable: value.billable,
    holidayHours: value.holidayHours,
  };

  const schema = object({
    monthlySalary: number().required().default(4000),
    hoursPerWeek: number().required().default(40),
    from: mixed().required().default(moment()),
    to: mixed().default(null),
    billable: boolean().default(true),
    holidayHours: number().required().default(192),
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
