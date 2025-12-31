import React, { useState } from "react";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { Field, Form, Formik } from "formik";
import Grid2 from "@mui/material/Grid2";
import { TextField } from "formik-mui";
import { DatePickerField } from "../../components/fields/DatePickerField";
import { PersonSelectorField } from "../../components/fields/PersonSelectorField";
import { PeriodInputField } from "../../components/fields/PeriodInputField";
import { mutatePeriod } from "../period/Period";
import dayjs from "dayjs";
import { EventTypeSelect } from "./EventTypeSelect";
import { EventTypeMappingToBillable } from "../../utils/mappings";

export const EVENT_FORM_ID = "event-form";

const now = dayjs();

const schema = Yup.object().shape({
  description: Yup.string().required("Description is required").default(""),
  from: Yup.date().required("From date is required").default(now),
  to: Yup.date().required("To date is required").default(now),
  days: Yup.array().default([8]).nullable(),
  personIds: Yup.array().default([]),
  costs: Yup.number().required().min(0).default(0),
  type: Yup.string().required("Field required").default("GENERAL_EVENT"),
});

/**
 * @return {null}
 */
export function EventForm({ value, onSubmit }) {
  const handleSubmit = (data) => {
    onSubmit?.({
      description: data.description,
      personIds: data.personIds,
      from: data.from,
      to: data.to,
      days: data.days,
      costs: data.costs,
      type: data.type,
    });
  };

  const renderForm = ({ values, setFieldValue }) => {
    const [resetHours, setResetHours] = useState<boolean>(false);

    const handleEventTypeChange = (newValue) => {
      setFieldValue("type", newValue);
      setResetHours(EventTypeMappingToBillable[newValue]);
    };

    return (
      <Form id={EVENT_FORM_ID}>
        <Grid2 container spacing={1}>
          <Grid2 size={{ xs: 12 }}>
            <Field
              name="description"
              type="text"
              label="Description"
              fullWidth
              component={TextField}
            />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <Field
              name="costs"
              type="number"
              label="Costs"
              fullWidth
              component={TextField}
            />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <PersonSelectorField name="personIds" multiple fullWidth />
          </Grid2>
          <Grid2 size={{ xs: 12 }} style={{ marginTop: "1rem" }}>
            <EventTypeSelect
              value={values.type}
              onChange={handleEventTypeChange}
            />
          </Grid2>
          <Grid2 size={{ xs: 6 }}>
            <DatePickerField name="from" label="From" maxDate={values.to} />
          </Grid2>
          <Grid2 size={{ xs: 6 }}>
            <DatePickerField name="to" label="To" minDate={values.from} />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <PeriodInputField
              name="days"
              from={values.from}
              to={values.to}
              reset={resetHours}
            />
          </Grid2>
        </Grid2>
      </Form>
    );
  };

  const init = { ...schema.default(), ...mutatePeriod(value) };
  return (
    value && (
      <Formik
        enableReinitialize
        initialValues={init}
        onSubmit={handleSubmit}
        validationSchema={schema}
      >
        {renderForm}
      </Formik>
    )
  );
}

EventForm.propTypes = {
  code: PropTypes.string,
  onSubmit: PropTypes.func,
};
