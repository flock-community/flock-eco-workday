import { Field } from 'formik';
import { UserSelector } from '../selector/UserSelector';

type UserSelectorFieldProps = {
  name: string;
};

export function UserSelectorField({ name }: UserSelectorFieldProps) {
  return (
    <Field id={name} name={name} as="select">
      {({ field: { value }, form: { setFieldValue } }) => (
        <UserSelector
          embedded
          selectedItem={value}
          onChange={(userCode) => setFieldValue(name, userCode)}
        />
      )}
    </Field>
  );
}
