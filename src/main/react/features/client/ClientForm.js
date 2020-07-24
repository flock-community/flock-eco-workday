import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
// import {makeStyles} from "@material-ui/core"
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { TextField } from "formik-material-ui";
import { ClientClient } from "../../clients/ClientClient";
import { isDefined } from "../../utils/validation";

export const CLIENT_FORM_ID = "client-form-id";

// const useStyles = makeStyles({})

export function ClientForm(props) {
  const { code, value, onSubmit } = props;
  const [state, setState] = useState(null);

  // const classes = useStyles()

  useEffect(() => {
    setState(value);
  }, [value]);

  useEffect(() => {
    // TODO: fix this! eslint-disable and remove
    // eslint-disable-next-line
    !value && code && ClientClient.findByCode(code).then(res => setState(res));
  }, [code]);

  // eslint-disable-next-line no-shadow
  const handleSubmit = value => {
    if (isDefined(onSubmit)) onSubmit(value);
  };

  const schema = Yup.object().shape({
    name: Yup.string()
      .required("Required")
      .default("")
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

ClientForm.propTypes = {
  code: PropTypes.string,
  value: PropTypes.any,
  onSubmit: PropTypes.func
};
