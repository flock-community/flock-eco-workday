import React from "react";
import { Field } from "formik";
import {
  AssignmentSelector,
  AssignmentSelectorProps,
} from "../selector/AssignmentSelector";

type AssignmentSelectorFieldProps = AssignmentSelectorProps & { name: string };

export const AssignmentSelectorField = ({
  name,
  ...props
}: AssignmentSelectorFieldProps) => {
  return (
    <Field id={name} name={name}>
      {({
        field: { value },
        form: { touched, errors, setFieldValue, setFieldTouched },
      }) => (
        <AssignmentSelector
          {...props}
          value={value}
          onBlur={() => setFieldTouched(name, true)}
          onChange={(userCode) => {
            setFieldValue(name, userCode);
          }}
          // @ts-ignore
          error={touched[name] && errors[name]}
        />
      )}
    </Field>
  );
};
