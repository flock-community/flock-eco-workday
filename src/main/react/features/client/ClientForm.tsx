import React, {useEffect, useState} from "react";
import {Field, Form, Formik} from "formik";
import * as Yup from "yup";
import {TextField} from "formik-material-ui";
import {ClientClient} from "../../clients/ClientClient";

export const CLIENT_FORM_ID = "client-form-id";
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
      ClientClient.findByCode(code).then((res) => setState(res));
    }
  }, [code]);

  // eslint-disable-next-line no-shadow
  const handleSubmit = (value) => {
    onSubmit?.(value);
  };

  const schema = Yup.object().shape({
    name: Yup.string().required("Required").default(""),
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
      render={form}
    />
  );
}
