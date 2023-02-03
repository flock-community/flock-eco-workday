import { Field } from "formik";
import React from "react";
import { DatePicker, DatePickerProps } from "@material-ui/pickers";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";

type DatePickerFieldProps = Omit<DatePickerProps, "value" | "onChange"> & {
  name: string;
  onChange?: (it: MaterialUiPickersDate) => void;
};

export function DatePickerField({ name, ...props }: DatePickerFieldProps) {
  return (
    <Field id={name} name={name}>
      {({ field: { value }, form: { setFieldValue, isSubmitting } }) => (
        <DatePicker
          value={value}
          onChange={(it) => {
            setFieldValue(name, it?.startOf('day'));
          }}
          disabled={isSubmitting}
          {...props}
        />
      )}
    </Field>
  );
}
