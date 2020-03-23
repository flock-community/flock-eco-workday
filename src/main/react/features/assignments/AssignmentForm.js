import React from "react"
import PropTypes from "prop-types"
import {Grid} from "@material-ui/core"
import {Field, Form, Formik} from "formik"
import {MuiPickersUtilsProvider} from "@material-ui/pickers"
import MomentUtils from "@date-io/moment"
import {TextField} from "formik-material-ui"
import {DatePickerField} from "../../components/fields/DatePickerField"
import {ClientSelectorField} from "../../components/fields/ClientSelectorField"
import {ASSIGNMENT_FORM_SCHEMA} from "./AssignmentSchema"

// form id as a reference point for buttons outside of the <form></form> scope to be
// able to submit this form
export const ASSIGNMENT_FORM_ID = "assignment-form"

/** PersonForm
 *
 * @param {*} props
 */
export const AssignmentForm = ({value, onSubmit}) => {
  const form = () => (
    <Form id={ASSIGNMENT_FORM_ID}>
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Field
              name="hourlyRate"
              type="number"
              label="Hourly rate"
              fullWidth
              component={TextField}
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              name="hoursPerWeek"
              type="number"
              label="Hours per week"
              fullWidth
              component={TextField}
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              name="role"
              type="text"
              label="Role"
              fullWidth
              component={TextField}
            />
          </Grid>
          <Grid item xs={6}>
            <DatePickerField name="from" label="Start date" fullWidth />
          </Grid>
          <Grid item xs={6}>
            <DatePickerField name="to" label="End date" fullWidth clearable />
          </Grid>
          <Grid item xs={12}>
            <ClientSelectorField name="clientCode" fullWidth />
          </Grid>
        </Grid>
      </MuiPickersUtilsProvider>
    </Form>
  )

  const init = value && {
    hourlyRate: value.hourlyRate,
    hoursPerWeek: value.hoursPerWeek,
    role: value.role,
    from: value.from,
    to: value.to,
    clientCode: value.client.code,
    personCode: value.person.code,
  }
  return (
    <Formik
      initialValues={{...ASSIGNMENT_FORM_SCHEMA.cast(), ...init}}
      onSubmit={onSubmit}
      validationSchema={ASSIGNMENT_FORM_SCHEMA}
      enableReinitialize
      render={form}
    />
  )
}

AssignmentForm.propTypes = {
  value: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
}
