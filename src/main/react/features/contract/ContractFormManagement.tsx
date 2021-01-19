import React from "react";
import PropTypes from "prop-types";
import { Grid } from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { TextField } from "formik-material-ui";
import { mixed, number, object } from "yup";
import moment from "moment";
import { DatePickerField } from "../../components/fields/DatePickerField";

// form id as a reference point for buttons outside of the <form></form> scope to be
// able to submit this form
export const MANAGEMENT_CONTRACT_FORM_ID = "management-contract-form";

type ContractFormManagementProps = {
  value: any;
  onSubmit: (item: any) => void;
};

export const ContractFormManagement = ({
  value,
  onSubmit,
}: ContractFormManagementProps) => {
  const form = ({ values }) => (
    <Form id={MANAGEMENT_CONTRACT_FORM_ID}>
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Field
              name="monthlyFee"
              type="number"
              label="Monthly fee"
              fullWidth
              component={TextField}
            />
          </Grid>
          <Grid item xs={6}>
            <DatePickerField
              name="from"
              label="Start date"
              maxDate={values.to ? values.to : undefined}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <DatePickerField
              name="to"
              label="End date"
              minDate={values.from}
              fullWidth
              clearable
            />
          </Grid>
        </Grid>
      </MuiPickersUtilsProvider>
    </Form>
  );

  const init = value && {
    monthlyFee: value.monthlyFee,
    role: value.role,
    from: value.from,
    to: value.to,
  };

  const schema = object({
    monthlyFee: number().required().default(4000),
    from: mixed().required().default(moment()),
    to: mixed().default(null),
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

ContractFormManagement.propTypes = {
  value: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
};

ContractFormManagement.defaultProps = {
  item: {
    client: null,
    user: null,
  },
};
