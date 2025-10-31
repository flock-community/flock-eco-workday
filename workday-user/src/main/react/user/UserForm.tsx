import React, {useEffect, useState} from 'react'

import Grid from '@material-ui/core/Grid'

import FormControl from '@material-ui/core/FormControl'
import UserClient from './UserClient'
import {Field, FieldArray, Form, Formik} from 'formik'
import {Checkbox, TextField} from 'formik-material-ui'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormGroup from '@material-ui/core/FormGroup'
import FormLabel from '@material-ui/core/FormLabel'
import * as Yup from 'yup'

export const USER_FORM_ID = 'user-form-id'

const init = {
  name: '',
  email: '',
  authorities: null,
}

/**
 * @return {null}
 */
export function UserForm({value, onSummit, ...props}) {
  const [state, setState] = useState(init)
  const [formRef, setFormRef] = useState(null)
  const [authorities, setAuthorities] = useState(null)

  useEffect(() => {
    if (!props.authorities) {
      UserClient.findAllAuthorities().then(setAuthorities)
    } else {
      setAuthorities(props.authorities)
    }
  }, [])

  useEffect(() => {
    if (value && authorities) {
      setState({
        ...init,
        ...value,
        authorities: authorities.map(
          (it) => value.authorities.indexOf(it) >= 0,
        ),
      })
    } else {
      setState({
        ...init,
        authorities: !authorities ? [] : authorities.map(() => false),
      })
    }
  }, [value, authorities])

  const handleSubmit = (value) => {
    onSummit &&
      onSummit({
        ...value,
        authorities: authorities
          .map((it, index) => (value.authorities[index] ? it : null))
          .filter((it) => it !== null),
      })
  }

  const validation = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string()
      .required('Email is required')
      .email('Enter a valid email'),
    authorities: Yup.array(),
  })

  if (!authorities || authorities.length !== state.authorities.length)
    return null

  return (
    <Formik
      ref={setFormRef}
      onSubmit={handleSubmit}
      enableReinitialize
      initialValues={state}
      validationSchema={validation}
    >
      <Form id={USER_FORM_ID}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Field fullWidth name="name" label="Name" component={TextField} />
          </Grid>

          <Grid item xs={12}>
            <Field fullWidth name="email" label="Email" component={TextField} />
          </Grid>

          <Grid item xs={12}>
            <FieldArray
              name="authorities"
              render={(arrayHelpers) => (
                <FormControl component="fieldset">
                  <FormLabel component="legend">Authorities</FormLabel>
                  <FormGroup>
                    {authorities.map((value, i) => (
                      <FormControlLabel
                        key={`user-form-authorities-${i}`}
                        control={
                          <Field
                            name={`authorities[${i}]`}
                            component={Checkbox}
                          />
                        }
                        label={value}
                      />
                    ))}
                  </FormGroup>
                </FormControl>
              )}
            />
          </Grid>
        </Grid>
      </Form>
    </Formik>
  )
}
