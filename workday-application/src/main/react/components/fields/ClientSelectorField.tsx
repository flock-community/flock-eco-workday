import React from "react";
import { Field, FieldProps } from "formik";
import { ClientSelector } from "../selector/ClientSelector";

export function ClientSelectorField({ name, ...props }) {
  return (
    <Field
      id={name}
      name={name}
      render={({
        field: { value },
        form: { touched, errors, setFieldValue, setFieldTouched },
      }: FieldProps<string>) => (
        <ClientSelector
          embedded
          value={value}
          onBlur={() => setFieldTouched(name, true)}
          onChange={(userCode) => setFieldValue(name, userCode)}
          // @ts-ignore
          error={touched[name] && errors[name]}
          {...props}
        />
      )}
    ></Field>
  );
}
