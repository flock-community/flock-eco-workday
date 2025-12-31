import { Field } from 'formik';
import { PersonSelector } from '../selector';
import type { PersonSelectorProps } from '../selector/PersonSelector';

type PersonSelectorFieldProps = { name: string } & Partial<PersonSelectorProps>;

export const PersonSelectorField = ({
  name,
  ...props
}: PersonSelectorFieldProps) => (
  <Field id={name} name={name}>
    {({
      field: { value },
      form: { touched, errors, setFieldValue, setFieldTouched },
    }) => (
      <PersonSelector
        value={value}
        onBlur={() => setFieldTouched(name, true)}
        onChange={(userCode) => setFieldValue(name, userCode)}
        error={touched[name] && errors[name]}
        embedded
        {...props}
      />
    )}
  </Field>
);
