import React from "react";
import { Field } from "formik";
import PropTypes from "prop-types";
import { ClientSelector } from "../selector/ClientSelector";

function ClientSelectorField({ name, ...props }) {
  return (
    <Field id={name} name={name} as="select">
      {({
        field: { value },
        form: { touched, errors, setFieldValue, setFieldTouched }
      }) => (
        <ClientSelector
          embedded
          value={value}
          onBlur={() => setFieldTouched(name, true)}
          onChange={userCode => setFieldValue(name, userCode)}
          error={touched[name] && errors[name]}
          {...props}
        />
      )}
    </Field>
  );
}

ClientSelectorField.propTypes = {
  name: PropTypes.string
};

export { ClientSelectorField };
