import React, {useEffect, useState} from "react";
import * as Yup from "yup";
import {Field, Form, Formik} from "formik";
import {TextField} from "formik-material-ui";
import HolidayClient from "../../clients/HolidayClient";
import {PeriodForm} from "../../components/PeriodForm";

export const HOLIDAY_FORM_ID = 'holiday-form-id'

export function HolidayForm({code, onSubmit}) {

  const [state, setState] = useState(null)

  useEffect(() => {
    if (code) {
      HolidayClient.findByCode(code)
        .then(res => {
          console.log(res)
          setState({
            ...res,
            period:{
              ...res.period,
              days: res.period.days.map(it => it.hours)
            }
          })
        })
    }
  }, [code])

  const handleSubmit = (value) => {
    onSubmit && onSubmit({
      ...state,
      ...value
    })
  }

  const handleChangePeriod = (value) => {
    setState({
      ...state,
      period: value
    })
  }

  const schema = Yup.object()
    .shape({
      description: Yup.string()
        .required('Field required')
        .default(''),
    })

  const renderForm = () => (<Form
    id={HOLIDAY_FORM_ID}>
    <Field
      name="description"
      type="text"
      label="Description"
      fullWidth
      component={TextField}/>
  </Form>)


  return (<>
    <Formik
      initialValues={{...schema.cast(), ...state}}
      onSubmit={handleSubmit}
      validationSchema={schema}
      enableReinitialize
      render={renderForm}/>
    <PeriodForm value={state && state.period} onChange={handleChangePeriod}/>
  </>)

}
