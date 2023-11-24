import React, {useEffect} from "react";
import { FormControl, Grid } from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import {
  CheckboxWithLabel,
  TextField as FormikTextField,
} from "formik-material-ui";
import { PERSON_FORM_SCHEMA } from "./schema";
import { UserSelectorField } from "../../components/fields/UserSelectorField";
import { DatePickerField } from "../../components/fields/DatePickerField";
import DayjsUtils from "@date-io/dayjs";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import {ShoeSizeSelectorField} from "../../components/fields/ShoeSizeSelectorField";
import {ShirtSizeSelectorField} from "../../components/fields/ShirtSizeSelectorField";

export const PERSON_FORM_ID = "person-form";

type PersonFormProps = {
  item: any;
  onSubmit: (item: any) => void;
};

export function PersonForm({ item, onSubmit }: PersonFormProps) {
  const form = () => (
    <Form id={PERSON_FORM_ID}>
      <MuiPickersUtilsProvider utils={DayjsUtils}>
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
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <Field
                id="number"
                label="number"
                name="number"
                component={FormikTextField}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <DatePickerField
              name="birthdate"
              label="Birthdate"
              fullWidth
              clearable
            />
          </Grid>
          <Grid item xs={12}>
            <DatePickerField
              name="joinDate"
              label="Join date"
              fullWidth
              clearable
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <UserSelectorField name="userCode" />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                  <ShoeSizeSelectorField name="shoeSize" />
              </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                  <ShirtSizeSelectorField name="shirtSize" />
              </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <Field
                id="googleDriveId"
                type="text"
                label="Google Drive map Id"
                name="googleDriveId"
                component={FormikTextField}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <Field
                name="reminders"
                type="checkbox"
                Label={{ label: "Reminders" }}
                component={CheckboxWithLabel}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <Field
                name="receiveEmail"
                type="checkbox"
                Label={{ label: "Receive system emails" }}
                component={CheckboxWithLabel}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <Field
                name="active"
                type="checkbox"
                Label={{ label: "Active" }}
                component={CheckboxWithLabel}
              />
            </FormControl>
          </Grid>
        </Grid>
      </MuiPickersUtilsProvider>
    </Form>
  );

  return (
    <Formik
      initialValues={{
        ...PERSON_FORM_SCHEMA.cast(),
        active: true,
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
