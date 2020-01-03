import React from "react"
import PropTypes from "prop-types"
import {FormControl, Grid} from "@material-ui/core"
import {makeStyles} from "@material-ui/styles"
import {Form, Formik, Field} from "formik"
import {TextField as FormikTextField} from "formik-material-ui"
import {UserSelectorFormInput} from "../../components/selector"
import {PERSON_FORM_SCHEMA} from "./schema"

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
          <FormControl className={classes.h79} fullWidth>
            <UserSelectorFormInput />
          </FormControl>
        </Grid>
      </Grid>
    </Form>
  )

  return (
    <Formik
      initialValues={{...PERSON_FORM_SCHEMA.cast(), ...item}}
      onSubmit={onSubmit} // use onSubmit func @PersonDialog
      validationSchema={PERSON_FORM_SCHEMA}
      enableReinitialize
      render={form}
    />
  )
}

PersonForm.propTypes = {
  item: PropTypes.shape({
    firstname: PropTypes.string,
    lastname: PropTypes.string,
    email: PropTypes.string,
    position: PropTypes.string,
    user: PropTypes.any,
  }),
  onSubmit: PropTypes.func.isRequired,
}

PersonForm.defaultProps = {
  item: {
    firstname: null,
    lastname: null,
    email: null,
    position: null,
    user: null,
  },
}
