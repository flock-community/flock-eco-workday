import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import * as Yup from "yup"
import {Form, Formik} from "formik"
import moment from "moment"
import Grid from "@material-ui/core/Grid"
import MomentUtils from "@date-io/moment"
import {MuiPickersUtilsProvider} from "@material-ui/pickers"
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
  days: Yup.array().required("Required"),
})

export function WorkDayForm({code, onSubmit}) {
  const [person] = usePerson()

  const [state, setState] = useState(null)

  useEffect(() => {
    if (code) {
      WorkDayClient.get(code).then(res => {
        setState({
          code: res.code,
          assignmentCode: res.assignmentCode,
          from: res.from,
          to: res.to,
          days: res.days,
        })
      })
    } else {
      setState(schema.cast())
    }
  }, [code])

  const handleSubmit = value => {
    if (isDefined(onSubmit))
      onSubmit({
        ...state,
        ...value,
      })
  }

  const handleChange = it => {
    setState(it)
  }

  const renderForm = () => (
    <Form id={WORKDAY_FORM_ID}>
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <AssignmentSelectorField
              fullWidth
              name="assignmentCode"
              personCode={person.code}
            />
          </Grid>
          <Grid item xs={6}>
            <DatePickerField name="from" fullWidth />
          </Grid>
          <Grid item xs={6}>
            <DatePickerField name="to" fullWidth />
          </Grid>
          <Grid item xs={12}>
            <PeriodInputField
              name="days"
              from={state && state.from}
              to={state && state.to}
            />
          </Grid>
        </Grid>
      </MuiPickersUtilsProvider>
    </Form>
  )

  if (!state) {
    return <></>
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Formik
          enableReinitialize
          initialValues={state}
          onSubmit={handleSubmit}
          validationSchema={schema}
          validate={handleChange}
          render={renderForm}
        />
      </Grid>
    </Grid>
  )
}

WorkDayForm.propTypes = {
  code: PropTypes.string,
  onSubmit: PropTypes.func,
}
