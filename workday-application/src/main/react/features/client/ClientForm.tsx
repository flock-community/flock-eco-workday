import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { ClientClient } from '../../clients/ClientClient';

export const CLIENT_FORM_ID = 'client-form-id';
type ClientFormProps = {
  code?: string;
  value?: any;
  onSubmit?: (item?: any) => void;
};

export function ClientForm({ code, value, onSubmit }: ClientFormProps) {
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    setState(value);
  }, [value]);

  useEffect(() => {
    if (!value && code) {
      ClientClient.get(code).then((res) => setState(res));
    }
  }, [code, value]);

  const handleSubmit = (value) => {
    onSubmit?.(value);
  };

  const schema = Yup.object().shape({
    name: Yup.string().required('Required').default(''),
  });

  const form = () => (
    <Form id={CLIENT_FORM_ID}>
      <Field
        name="name"
        type="text"
        label="Name"
        fullWidth
        component={TextField}
      />
    </Form>
  );

  return (
    <Formik
      initialValues={{ ...schema.cast(), ...state }}
      onSubmit={handleSubmit}
      validationSchema={schema}
      enableReinitialize
    >
      {form}
    </Formik>
  );
}
