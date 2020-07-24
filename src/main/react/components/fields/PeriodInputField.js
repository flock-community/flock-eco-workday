import { Field } from "formik";
import React from "react";
import PropTypes from "prop-types";
import { PeriodInput } from "../inputs/PeriodInput";

export function PeriodInputField({ name, ...props }) {
  return (
    <Field id={name} name={name}>
      {({ field: { value }, form: { values, setFieldValue } }) => {
        const val = {
          from: values.from,
          to: values.to,
          days: value
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
