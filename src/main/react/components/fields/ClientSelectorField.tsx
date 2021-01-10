import React from "react";
import { Field } from "formik";
import { ClientSelector } from "../selector/ClientSelector";

export function ClientSelectorField({ name, ...props }) {
  return (
    <Field id={name} name={name}>
      {({
        field: { value },
        form: { touched, errors, setFieldValue, setFieldTouched },
      }) => (
        <ClientSelector
          embedded
          value={value}
          onBlur={() => setFieldTouched(name, true)}
          onChange={(userCode) => setFieldValue(name, userCode)}
          error={touched[name] && errors[name]}
          {...props}
        />
      )}
    </Field>
  );
}
