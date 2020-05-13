import React from "react"
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
import UserAuthorityUtil from "@flock-eco/feature-user/src/main/react/user_utils/UserAuthorityUtil"
import MenuItem from "@material-ui/core/MenuItem"
import {PeriodInputField} from "../../components/fields/PeriodInputField"
import {isDefined} from "../../utils/validation"
import {usePerson} from "../../hooks/PersonHook"
import {AssignmentSelectorField} from "../../components/fields/AssignmentSelectorField"
import {DatePickerField} from "../../components/fields/DatePickerField"

export const WORKDAY_FORM_ID = "work-day-form"

const now = moment()

export const schemaWorkDayForm = Yup.object().shape({
  status: Yup.string()
    .required("Field required")
    .default("REQUESTED"),
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
export function WorkDayForm({value, onSubmit, onChange, onSwitchChange, daysSwitch}) {
  const [person] = usePerson()

  const handleSubmit = data => {
    if (isDefined(onSubmit))
      onSubmit({
        assignmentCode: data.assignmentCode,
        from: data.from,
        to: data.to,
        days: daysSwitch ? undefined : data.days,
        hours: data.hours,
        status: data.status,
      })
  }

  const handleChange = it => {
    onChange(it)
  }

  const handleSwitchChange = it => {
    onSwitchChange(it)
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
          {value && (
            <Grid item xs={12}>
              <UserAuthorityUtil has={"WorkDayAuthority.ADMIN"}>
                <Field
                  fullWidth
                  type="text"
                  name="status"
                  label="Status"
                  select
                  variant="standard"
                  margin="normal"
                  component={TextField}
                >
                  <MenuItem value="REQUESTED">REQUESTED</MenuItem>
                  <MenuItem value="APPROVED">APPROVED</MenuItem>
                  <MenuItem value="REJECTED">REJECTED</MenuItem>
                </Field>
              </UserAuthorityUtil>
            </Grid>
          )}
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
                from={value && value.from}
                to={value && value.to}
              />
            )}
          </Grid>
        </Grid>
      </MuiPickersUtilsProvider>
    </Form>
  )

  return (
    value && (
      <Formik
        enableReinitialize
        initialValues={value}
        onSubmit={handleSubmit}
        validationSchema={schemaWorkDayForm}
        validate={handleChange}
        render={renderForm}
      />
    )
  )
}

WorkDayForm.propTypes = {
  value: PropTypes.object,
  onSubmit: PropTypes.func,
}
