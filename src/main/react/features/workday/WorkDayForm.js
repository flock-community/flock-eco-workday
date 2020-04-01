import React, {useEffect, useState} from "react"
import * as Yup from "yup"
import {Field, Form, Formik} from "formik"
import moment from "moment"
import Grid from "@material-ui/core/Grid"
import MomentUtils from "@date-io/moment"
import {MuiPickersUtilsProvider} from "@material-ui/pickers"
import Switch from "@material-ui/core/Switch"
import {Typography} from "@material-ui/core"
import {TextField} from "formik-material-ui"
import * as PropTypes from "prop-types"
import {PeriodInputField} from "../../components/fields/PeriodInputField"
import {isDefined} from "../../utils/validation"
import {usePerson} from "../../hooks/PersonHook"
import {AssignmentSelectorField} from "../../components/fields/AssignmentSelectorField"
import {WorkDayClient} from "../../clients/WorkDayClient"
import {DatePickerField} from "../../components/fields/DatePickerField"

export const WORKDAY_FORM_ID = "work-day-form"

const now = moment()

const schema = Yup.object().shape({
  assignmentCode: Yup.string()
    .required("Assignment is required")
    .default(""),
  from: Yup.date()
    .required("From date is required")
    .default(now),
  to: Yup.date()
    .required("To date is required")
    .default(now),
  days: Yup.array(),
  hours: Yup.number(),
})

/**
 * @return {null}
 */
export function WorkDayForm({code, onSubmit}) {
  const [person] = usePerson()

  const [state, setState] = useState(null)
  const [daysSwitch, setDaysSwitch] = useState(false)

  useEffect(() => {
    if (code) {
      WorkDayClient.get(code).then(res => {
        setState({
          assignmentCode: res.assignment.code,
          from: res.from,
          to: res.to,
          days: res.days,
          hours: res.hours,
        })
        setDaysSwitch(res.days.length === 0)
      })
    } else {
      setState(schema.cast())
    }
  }, [code])

  const handleSubmit = value => {
    if (isDefined(onSubmit))
      onSubmit({
        assignmentCode: value.assignmentCode,
        from: value.from,
        to: value.to,
        days: daysSwitch ? undefined : value.days,
        hours: value.hours,
      })
  }

  const handleChange = it => {
    setState(it)
  }

  const handleSwitchChange = () => {
    setDaysSwitch(!daysSwitch)
  }

  const renderSwitch = (
    <Typography>
      <Grid container alignItems="center" spacing={1}>
        <Grid item>
          <Switch checked={daysSwitch} onChange={handleSwitchChange} />
        </Grid>
        <Grid item>Hours only</Grid>
      </Grid>
    </Typography>
  )

  const renderForm = () => (
    <Form id={WORKDAY_FORM_ID}>
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <AssignmentSelectorField
              fullWidth
              name="assignmentCode"
              label="Assignment"
              personCode={person.code}
            />
          </Grid>
          <Grid item xs={6}>
            <DatePickerField name="from" label="From" fullWidth />
          </Grid>
          <Grid item xs={6}>
            <DatePickerField name="to" label="To" fullWidth />
          </Grid>
          <Grid item xs={12}>
            {renderSwitch}
          </Grid>
          <Grid item xs={12}>
            {daysSwitch ? (
              <Field
                name="hours"
                type="number"
                label="Hours"
                fullWidth
                component={TextField}
              />
            ) : (
              <PeriodInputField
                name="days"
                from={state && state.from}
                to={state && state.to}
              />
            )}
          </Grid>
        </Grid>
      </MuiPickersUtilsProvider>
    </Form>
  )

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
  )
}

WorkDayForm.propTypes = {
  code: PropTypes.string,
  onSubmit: PropTypes.func,
}
