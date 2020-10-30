import { Field } from "formik";
import React from "react";
import {DatePicker, DatePickerProps} from "@material-ui/pickers"
import {MaterialUiPickersDate} from "@material-ui/pickers/typings/date"

type Rest = Omit<DatePickerProps, 'value' | 'onChange'>
type Props = Rest & {
  name: string,
  onChange?: (it:MaterialUiPickersDate) => void,
}

export function DatePickerField({ name, onChange, ...props }:Props) {
  return (
    <Field id={name} name={name}>
      {({ field: { value }, form: { setFieldValue } }) => (
        <DatePicker
          value={value}
          onChange={it => {
            setFieldValue(name, it);
            if (onChange) onChange(it);
          }}
          {...props}
        />
      )}
    </Field>
  );
}
