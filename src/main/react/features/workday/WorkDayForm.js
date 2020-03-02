import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import * as Yup from "yup"
import {Form, Formik} from "formik"
import moment from "moment"
import Grid from "@material-ui/core/Grid"
import {PeriodForm} from "../../components/PeriodForm"
import {isDefined} from "../../utils/validation"
import {usePerson} from "../../hooks/PersonHook"
import {AssignmentSelectorField} from "../../components/fields/AssignmentSelectorField"
import {WorkDayClient} from "../../clients/WorkDayClient"

export const WORKDAY_FORM_ID = "work-day-form"

export function WorkDayForm({code, onSubmit}) {
  const [person] = usePerson()

  const [state, setState] = useState(null)

  useEffect(() => {
    if (code) {
      WorkDayClient.get(code).then(res => {
        setState({
          code: res.code,
          personCode: res.person,
          period: {
            dates: [res.from, res.to],
            days: res.days.map(it => it.hours),
          },
        })
      })
    } else {
      const now = moment()
      setState({
        period: {
          dates: [now, now],
        },
      })
    }
  }, [code])

  const handleSubmit = value => {
    if (isDefined(onSubmit))
      onSubmit({
        ...state,
        ...value,
      })
  }

  const handleChangePeriod = value => {
    setState({
      ...state,
      period: value,
    })
  }

  const schema = Yup.object().shape({
    assignmentCode: Yup.string()
      .required("Required")
      .default(""),
  })

  const renderForm = () => (
    <Form id={WORKDAY_FORM_ID}>
      <AssignmentSelectorField
        fullWidth
        name="assignmentCode"
        personCode={person.code}
      />
    </Form>
  )

  if (!state) return <></>

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Formik
          initialValues={{
            ...schema.cast(),
            description: state.description,
            status: state.status,
          }}
          onSubmit={handleSubmit}
          validationSchema={schema}
          render={renderForm}
        />
      </Grid>
      <Grid item xs={12}>
        <PeriodForm value={state && state.period} onChange={handleChangePeriod} />
      </Grid>
    </Grid>
  )
}

WorkDayForm.propTypes = {
  code: PropTypes.string,
  onSubmit: PropTypes.func,
}
