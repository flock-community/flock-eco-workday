import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { Field, Form, Formik } from "formik";
import moment from "moment";
import Grid from "@material-ui/core/Grid";
import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { TextField } from "formik-material-ui";
import { isDefined } from "../../utils/validation";
import { EventClient } from "../../clients/EventClient";
import { DatePickerField } from "../../components/fields/DatePickerField";
import { PersonSelectorField } from "../../components/fields/PersonSelectorField";
import { PeriodInputField } from "../../components/fields/PeriodInputField";
import { editDay, mutatePeriod } from "../period/Period.tsx";

export const EVENT_FORM_ID = "work-day-form";

const now = moment();

const schema = Yup.object().shape({
  description: Yup.string()
    .required("Assignment is required")
    .default(""),
  from: Yup.date()
    .required("From date is required")
    .default(now),
  to: Yup.date()
    .required("To date is required")
    .default(now),
  days: Yup.array().required("Required"),
  personCodes: Yup.array().default([])
});

/**
 * @return {null}
 */
export function EventForm({ code, onSubmit, open }) {
  const [state, setState] = useState(null);
  const [period, setPeriod] = useState(
    mutatePeriod({
      from: moment(),
      to: moment()
    })
  );

  useEffect(() => {
    if (open) {
      if (code) {
        EventClient.get(code).then(res => {
          setState({
            description: res.description,
            from: res.from,
            to: res.to,
            days: res.days,
            personCodes: res.persons.map(it => it.code)
          });
          setPeriod(
            mutatePeriod({
              from: res.from,
              to: res.to,
              days: res.days
            })
          );
        });
      } else {
        setState(schema.cast());
        setPeriod(
          mutatePeriod({
            from: moment(),
            to: moment()
          })
        );
      }
    }
  }, [code]);

  const handleSubmit = value => {
    if (isDefined(onSubmit))
      onSubmit({
        ...value,
        ...state,
        ...period
      });
  };

  const handleChange = it => {
    setState(it);
  };

  const renderForm = () => (
    <Form id={EVENT_FORM_ID}>
      <MuiPickersUtilsProvider utils={MomentUtils}>
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
            <PersonSelectorField name="personCodes" multiple />
          </Grid>
          <Grid item xs={6}>
            {period && (
              <DatePickerField
                name="from"
                label="From"
                onChange={it =>
                  setPeriod(mutatePeriod(period, { from: it, to: period.to }))
                }
                fullWidth
              />
            )}
          </Grid>
          <Grid item xs={6}>
            {period && (
              <DatePickerField
                name="to"
                label="To"
                onChange={it =>
                  setPeriod(mutatePeriod(period, { from: period.from, to: it }))
                }
                fullWidth
              />
            )}
          </Grid>
          <Grid item xs={12}>
            {period && (
              <PeriodInputField
                name="days"
                from={period.from}
                to={period.to}
                days={period.days}
                editDay={(date, day) => setPeriod(editDay(period, date, day))}
              />
            )}
          </Grid>
        </Grid>
      </MuiPickersUtilsProvider>
    </Form>
  );

  return (
    state && (
      <Formik
        enableReinitialize
        initialValues={state}
        onSubmit={handleSubmit}
        validationSchema={schema}
        validate={handleChange}
        render={renderForm}
      />
    )
  );
}

EventForm.propTypes = {
  code: PropTypes.string,
  onSubmit: PropTypes.func
};
