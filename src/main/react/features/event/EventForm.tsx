import React from "react";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { Field, Form, Formik } from "formik";
import Grid from "@material-ui/core/Grid";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import {CheckboxWithLabel, TextField} from "formik-material-ui";
import { DatePickerField } from "../../components/fields/DatePickerField";
import { PersonSelectorField } from "../../components/fields/PersonSelectorField";
import { PeriodInputField } from "../../components/fields/PeriodInputField";
import { mutatePeriod } from "../period/Period";
import dayjs from "dayjs";
import DayjsUtils from "@date-io/dayjs";
import {EventTypeSelect} from "./EventTypeSelect";
import {FormControl} from "@material-ui/core";
import {EventTypeMappingToBillable} from "../../utils/mappings";

export const EVENT_FORM_ID = "work-day-form";

const now = dayjs();

const schema = Yup.object().shape({
  description: Yup.string().required("Description is required").default(""),
  from: Yup.date().required("From date is required").default(now),
  to: Yup.date().required("To date is required").default(now),
  days: Yup.array().default([8]).nullable(),
  personIds: Yup.array().default([]),
  costs: Yup.number().required().min(0).default(0),
  type: Yup.string().required("Field required").default("GENERAL_EVENT"),
  billable: Yup.boolean().default(false)
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
      billable: data.billable,
    });
  };

  const renderForm = ({values, setFieldValue}) => {
    const handleEventTypeChange = (newValue) => {
      setFieldValue("type", newValue);
      setFieldValue("billable", EventTypeMappingToBillable[newValue]);
    };

    return (
      <Form id={EVENT_FORM_ID}>
        <MuiPickersUtilsProvider utils={DayjsUtils}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Field
                name="description"
                type="text"
                label="Description"
                fullWidth
                component={TextField}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                name="costs"
                type="number"
                label="Costs"
                fullWidth
                component={TextField}
              />
            </Grid>
            <Grid item xs={12}>
              <PersonSelectorField name="personIds" multiple fullWidth/>
            </Grid>
            <Grid item xs={6} style={{marginTop: '1rem'}}>
              <EventTypeSelect value={values.type} onChange={handleEventTypeChange}/>
            </Grid>
            <Grid item xs={6} style={{marginTop: '1rem'}}>
              <FormControl fullWidth>
                <Field
                  name="billable"
                  type="checkbox"
                  Label={{label: "Are these hours billable to client?"}}
                  component={CheckboxWithLabel}
                />
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <DatePickerField
                name="from"
                label="From"
                maxDate={values.to}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <DatePickerField
                name="to"
                label="To"
                minDate={values.from}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <PeriodInputField name="days" from={values.from} to={values.to}/>
            </Grid>
          </Grid>
        </MuiPickersUtilsProvider>
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
