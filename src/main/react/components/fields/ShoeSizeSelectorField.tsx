import React from "React";
import { Field } from "formik";
import {ShoeSizeSelector} from "../selector/ShoeSizeSelector";

type ShoeSizeSelectorFieldProperties = {
  name: string;
};

export function ShoeSizeSelectorField({ name }: ShoeSizeSelectorFieldProperties) {
    return (
        <Field id={name} name={name} as="select">
            {({ field: { value }, form: { setFieldValue } }) => {
              return (
                <ShoeSizeSelector
                  selectedItem={value}
                  onChange={(shoeSize) => setFieldValue(name, shoeSize)}
                />
              );
            }}
        </Field>
    )
}
