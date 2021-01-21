import React from "react";
import { FormControl, Grid } from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import { TextField as FormikTextField } from "formik-material-ui";
import { PERSON_FORM_SCHEMA } from "./schema";
import { UserSelectorField } from "../../components/fields/UserSelectorField";

export const PERSON_FORM_ID = "person-form";

type PersonFormProps = {
  item: any;
  onSubmit: (item: any) => void;
};
export function PersonForm({ item, onSubmit }: PersonFormProps) {
  const form = () => (
    <Form id={PERSON_FORM_ID}>
      <Grid container item xs={12} spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Field
              id="firstname"
              type="text"
              label="firstname"
              name="firstname"
              required
              autoFocus
              component={FormikTextField}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <Field
              id="lastname"
              type="text"
              label="lastname"
              name="lastname"
              required
              component={FormikTextField}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <Field
              id="email"
              type="email"
              label="email"
              name="email"
              component={FormikTextField}
            />
          </FormControl>
          <FormControl fullWidth>
            <Field
              id="number"
              label="number"
              name="number"
              component={FormikTextField}
            />
          </FormControl>
          <FormControl fullWidth>
            <UserSelectorField name="userCode" />
          </FormControl>
        </Grid>
      </Grid>
    </Form>
  );

  return (
    <Formik
      initialValues={{
        ...PERSON_FORM_SCHEMA.default(),
        ...item,
        userCode: item?.user,
      }}
      onSubmit={onSubmit}
      validationSchema={PERSON_FORM_SCHEMA}
      enableReinitialize
    >
      {form}
    </Formik>
  );
}
