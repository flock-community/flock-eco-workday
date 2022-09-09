import React from "react";
import PropTypes from "prop-types";
import { Grid } from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { TextField } from "formik-material-ui";
import { mixed, number, object } from "yup";
import { DatePickerField } from "../../components/fields/DatePickerField";
import DayjsUtils from "@date-io/dayjs";
import dayjs from "dayjs";
import { DMY_DATE } from "../../clients/util/DateFormats";

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
      <MuiPickersUtilsProvider utils={DayjsUtils}>
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
              format={DMY_DATE}
              maxDate={values.to ? values.to : undefined}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <DatePickerField
              name="to"
              label="End date"
              format={DMY_DATE}
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
    from: mixed().required().default(dayjs()),
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
