import { Field } from "formik";
import React from "react";
import { DatePicker, DatePickerProps } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { DMY_DATE } from "../../clients/util/DateFormats";

type DatePickerFieldProps = Omit<
  DatePickerProps<Dayjs>,
  "value" | "onChange"
> & {
  name: string;
  onChange?: (it: Dayjs | null) => void;
};

export const DatePickerField = ({
  name,
  label,
  format,
  ...slotProps
}: DatePickerFieldProps) => {
  return (
    <Field name={name}>
      {({ field: { value }, form: { setFieldValue, isSubmitting } }) => (
        <DatePicker
          label={label}
          value={value || null}
          format={DMY_DATE}
          onChange={(it) => {
            setFieldValue(name, it?.startOf("day"));
          }}
          disabled={isSubmitting}
          slotProps={{
            ...slotProps,
            textField: {
              fullWidth: true,
            },
          }}
        />
      )}
    </Field>
  );
};
