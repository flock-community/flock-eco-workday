import React from "react";
import PropTypes from "prop-types";
import { Grid2 } from "@mui/material";
import { Field, Form, Formik } from "formik";
import { TextField } from "formik-mui";
import { mixed, number, object } from "yup";
import { DatePickerField } from "../../components/fields/DatePickerField";
import dayjs from "dayjs";

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
      <Grid2 container spacing={1}>
        <Grid2 size={{ xs: 12 }}>
          <Field
            name="monthlyFee"
            type="number"
            label="Monthly fee"
            fullWidth
            component={TextField}
          />
        </Grid2>
        <Grid2 size={{ xs: 6 }}>
          <DatePickerField
            name="from"
            label="Start date"
            maxDate={values.to ? values.to : undefined}
          />
        </Grid2>
        <Grid2 size={{ xs: 6 }}>
          <DatePickerField name="to" label="End date" minDate={values.from} />
        </Grid2>
      </Grid2>
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
