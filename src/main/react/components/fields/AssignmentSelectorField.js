import React from "react";
import { Field } from "formik";
import PropTypes from "prop-types";
import { AssignmentSelector } from "../selector/AssignmentSelector";

function AssignmentSelectorField({ name, ...props }) {
  return (
    <Field id={name} name={name} as="select">
      {({
        field: { value },
        form: { touched, errors, setFieldValue, setFieldTouched }
      }) => (
        <AssignmentSelector
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

AssignmentSelectorField.propTypes = {
  name: PropTypes.string
};

export { AssignmentSelectorField };
