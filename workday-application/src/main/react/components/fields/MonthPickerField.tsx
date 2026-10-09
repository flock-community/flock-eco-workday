import { DatePicker } from '@mui/x-date-pickers';
import { Field, getIn } from 'formik';

type MonthPickerFieldProps = {
  name: string;
  label: string;
  helperText?: string;
};

/** Picks a month (MM-YYYY) into a Formik field holding a Dayjs at the start of that month. */
export const MonthPickerField = ({
  name,
  label,
  helperText,
}: MonthPickerFieldProps) => (
  <Field name={name}>
    {({
      field: { value },
      form: { setFieldValue, setFieldTouched, touched, errors, isSubmitting },
    }) => {
      const error = getIn(touched, name) && getIn(errors, name);
      return (
        <DatePicker
          label={label}
          value={value || null}
          views={['year', 'month']}
          openTo="year"
          format="MM-YYYY"
          onChange={(it) => {
            setFieldValue(name, it ? it.startOf('month') : null);
          }}
          onClose={() => setFieldTouched(name, true)}
          disabled={isSubmitting}
          slotProps={{
            field: { clearable: true },
            textField: {
              fullWidth: true,
              name,
              onBlur: () => setFieldTouched(name, true),
              error: Boolean(error),
              helperText: error || helperText,
            },
          }}
        />
      );
    }}
  </Field>
);
