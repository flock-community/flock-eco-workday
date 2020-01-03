import React from "react"
import PropTypes from "prop-types"
import {FormControl, Grid} from "@material-ui/core"
import {makeStyles} from "@material-ui/styles"
import * as Yup from "yup"
import {Form, Formik, Field} from "formik"
import {TextField as FormikTextField} from "formik-material-ui"

const useStyles = makeStyles(() => ({
  h70: {height: 70},
  w100: {width: "100%"},
}))

// form id as a reference point for buttons outside of the <form></form> scope to be
// able to submit this form
export const PERSON_FORM_ID = "person-form"

/** PersonForm
 *
 * @param {*} props
 */
export const PersonForm = props => {
  const {item, onSubmit} = props
  const classes = useStyles()

  const schema = Yup.object().shape({
    firstname: Yup.string()
      .required("Required")
      .default(""),
    lastname: Yup.string()
      .required("Required")
      .default(""),
    email: Yup.string()
      .email()
      .default(""),
    position: Yup.string().default(""),
    userCode: Yup.string(),
  })

  const form = () => (
    <Form id={PERSON_FORM_ID}>
      <Grid container item xs={12} spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl className={classes.h70} fullWidth>
            <Field
              id="firstname"
              type="text"
              label="firstname"
              name="firstname"
              required
              autoFocus
              component={FormikTextField}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl className={classes.h70} fullWidth>
            <Field
              id="lastname"
              type="text"
              label="lastname"
              name="lastname"
              required
              component={FormikTextField}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl className={classes.h70} fullWidth>
            <Field
              id="email"
              type="email"
              label="email"
              name="email"
              component={FormikTextField}
            />
          </FormControl>
        </Grid>
      </Grid>
    </Form>
  )

  return (
    <Formik
      initialValues={{...schema.cast(), ...item}}
      onSubmit={onSubmit} // use onSubmit func @PersonDialog
      validationSchema={schema}
      enableReinitialize
      render={form}
    />
  )
}

PersonForm.propTypes = {
  item: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
}
