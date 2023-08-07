import React from "react";
import { Field } from "formik";
import {ShirtSizeSelector} from "../selector/ShirtSizeSelector";

type ShirtSizeSelectorFieldProperties = {
  name: string;
};

export function ShirtSizeSelectorField({ name }: ShirtSizeSelectorFieldProperties) {
  return (
    <Field id={name} name={name} as="select">
      {({ field: { value }, form: { setFieldValue } }) => {
        return (
          <ShirtSizeSelector
            selectedItem={value}
            onChange={(shoeSize) => setFieldValue(name, shoeSize)}
          />
        );
      }}
    </Field>
  )
}
