import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import * as Yup from "yup"
import {Form, Formik} from "formik"
import moment from "moment"
import Grid from "@material-ui/core/Grid"
import {PeriodForm} from "../../components/PeriodForm"
import {SickdayClient} from "../../clients/SickdayClient"
import {isDefined} from "../../utils/validation"

export const SICKDAY_FORM_ID = "sickday-form"

export function SickdayForm({code, onSubmit}) {
  const [state, setState] = useState(null)

  useEffect(() => {
    if (code) {
      SickdayClient.get(code).then(res => {
        setState({
          code: res.code,
          personCode: res.person,
          period: {
            dates: [res.period.from, res.period.to],
            days: res.period.days.map(it => it.hours),
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

  const schema = Yup.object().shape({})

  const renderForm = () => <Form id={SICKDAY_FORM_ID}></Form>

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

SickdayForm.propTypes = {
  code: PropTypes.string,
  onSubmit: PropTypes.func,
}
