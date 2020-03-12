import React from "react"
import {Field} from "formik"
import PropTypes from "prop-types"
import {PersonSelector} from "../selector"

function PersonSelectorField({name, ...props}) {
  return (
    <Field id={name} name={name} as="select">
      {({field: {value}, form: {touched, errors, setFieldValue, setFieldTouched}}) => (
        <PersonSelector
          value={value}
          onBlur={() => setFieldTouched(name, true)}
          onChange={userCode => setFieldValue(name, userCode)}
          error={touched[name] && errors[name]}
          embedded
          {...props}
        />
      )}
    </Field>
  )
}

PersonSelectorField.propTypes = {
  name: PropTypes.string,
}

export {PersonSelectorField}
