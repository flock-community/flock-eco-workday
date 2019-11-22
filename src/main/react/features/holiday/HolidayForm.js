import React, {useEffect, useState} from "react"
import * as Yup from "yup"
import {Field, Form, Formik} from "formik"
import {TextField} from "formik-material-ui"
import moment from "moment"
import Grid from "@material-ui/core/Grid"
import MenuItem from "@material-ui/core/MenuItem"
import UserAuthorityUtil from "@flock-eco/feature-user/src/main/react/user_utils/UserAuthorityUtil"
import {PeriodForm} from "../../components/PeriodForm"
import HolidayClient from "../../clients/HolidayClient"

export const HOLIDAY_FORM_ID = "holiday-form-id"

export function HolidayForm({code, onSubmit}) {
  const [state, setState] = useState(null)

  useEffect(() => {
    if (code) {
      HolidayClient.findByCode(code).then(res => {
        setState({
          ...res,
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
          days: [8],
        },
      })
    }
  }, [code])

  const handleSubmit = value => {
    console.log(state, value)
    onSubmit &&
      onSubmit({
        ...state,
        ...value,
      })
  }

  const handleChangePeriod = value => {
    console.log(value)
    setState({
      ...state,
      period: value,
    })
  }

  const schema = Yup.object().shape({
    description: Yup.string()
      .required("Field required")
      .default(""),
  })

  const renderForm = () => (
    <Form id={HOLIDAY_FORM_ID}>
      <Field
        name="description"
        type="text"
        label="Description"
        fullWidth
        component={TextField}
      />
      {code && (
        <UserAuthorityUtil has={"HolidayAuthority.ADMIN"}>
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
      )}
    </Form>
  )

  if (!state) return null

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
