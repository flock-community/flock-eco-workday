import { Field } from "formik";
import React from "react";
import PropTypes from "prop-types";
import { PeriodInput } from "../inputs/PeriodInput";

export function PeriodInputField({ name, from, to, days, ...props }) {
  return (
    <Field id={name} name={name}>
      {({ form: { setFieldValue } }) => {
        const val = {
          from,
          to,
          days
        };
        return (
          <PeriodInput
            value={val}
            onChange={it => setFieldValue(name, it)}
            {...props}
          />
        );
      }}
    </Field>
  );
}

PeriodInputField.propTypes = {
  name: PropTypes.string
};
