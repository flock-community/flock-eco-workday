import { Field } from 'formik';
import { ProjectSelector } from '../selector/ProjectSelector';

export function ProjectSelectorField({ name, ...props }) {
  return (
    <Field id={name} name={name}>
      {({
        field: { value },
        form: { touched, errors, setFieldValue, setFieldTouched },
      }) => (
        <ProjectSelector
          embedded
          value={value}
          onBlur={() => setFieldTouched(name, true)}
          onChange={(userCode) => setFieldValue(name, userCode)}
          // @ts-expect-error
          error={touched[name] && errors[name]}
          {...props}
        />
      )}
    </Field>
  );
}
