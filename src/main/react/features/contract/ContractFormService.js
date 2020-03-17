import React from "react"
import PropTypes from "prop-types"
import {Grid} from "@material-ui/core"
import {Field, Form, Formik} from "formik"
import {MuiPickersUtilsProvider} from "@material-ui/pickers"
import MomentUtils from "@date-io/moment"
import {TextField} from "formik-material-ui"
import {mixed, number, object} from "yup"
import moment from "moment"
import {DatePickerField} from "../../components/fields/DatePickerField"

// form id as a reference point for buttons outside of the <form></form> scope to be
// able to submit this form
export const SERVICE_CONTRACT_FORM_ID = "service-contract-form"

/** PersonForm
 *
 * @param {*} props
 */
export const ContractFormService = props => {
  const {value, onSubmit} = props

  const form = () => (
    <Form id={SERVICE_CONTRACT_FORM_ID}>
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Field
              name="monthlyCosts"
              type="number"
              label="Monthly costs"
              fullWidth
              component={TextField}
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              name="description"
              type="text"
              label="Description"
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
        </Grid>
      </MuiPickersUtilsProvider>
    </Form>
  )

  const init = value && {
    monthlyCost: value.hourlyRate,
    role: value.role,
    from: value.from,
    to: value.to,
  }

  const schema = object({
    monthlyCost: number()
      .required()
      .default(4000),
    from: mixed()
      .required()
      .default(moment()),
    to: mixed().default(null),
  })

  return (
    <Formik
      initialValues={{...schema.cast(), ...init}}
      onSubmit={onSubmit}
      validationSchema={schema}
      enableReinitialize
      render={form}
    />
  )
}

ContractFormService.propTypes = {
  value: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
}

ContractFormService.defaultProps = {
  item: {
    client: null,
    user: null,
  },
}
