import {Field} from "formik"
import React from "react"
import {DatePicker} from "@material-ui/pickers"
import PropTypes from "prop-types"

export function DatePickerField({name, ...props}) {
  return (
    <Field id={name} name={name}>
      {({field: {value}, form: {setFieldValue}}) => (
        <DatePicker value={value} onChange={it => setFieldValue(name, it)} {...props} />
      )}
    </Field>
  )
}

DatePickerField.propTypes = {
  name: PropTypes.string,
}