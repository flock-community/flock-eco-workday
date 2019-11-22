import React, {useEffect, useState} from "react"

import {makeStyles} from "@material-ui/core"
import {Field, Form, Formik} from "formik"
import * as Yup from "yup"
import {TextField} from "formik-material-ui"
import {ClientClient} from "../../clients/ClientClient"

export const CLIENT_FORM_ID = "client-form-id"

const useStyles = makeStyles({})

export function ClientForm({code, value, onSubmit}) {
  const classes = useStyles()

  const [state, setState] = useState(null)

  useEffect(() => {
    setState(value)
  }, [value])

  useEffect(() => {
    !value && code && ClientClient.findByCode(code).then(res => setState(res))
  }, [code])

  const handleSubmit = value => {
    onSubmit && onSubmit(value)
  }

  const schema = Yup.object().shape({
    name: Yup.string()
      .required("Required")
      .default(""),
  })

  const form = () => (
    <Form id={CLIENT_FORM_ID}>
      <Field name="name" type="text" label="Name" fullWidth component={TextField} />
    </Form>
  )

  return (
    <Formik
      initialValues={{...schema.cast(), ...state}}
      onSubmit={handleSubmit}
      validationSchema={schema}
      enableReinitialize
      render={form}
    />
  )
}
