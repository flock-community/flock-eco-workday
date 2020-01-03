import React from "react"
import {Field} from "formik"
import {UserSelector} from "./UserSelector"

const fieldName = "userCode"

function UserSelectorFormInput() {
  return (
    <Field id={fieldName} name={fieldName} as="select">
      {({field: {value}, form: {setFieldValue}}) => (
        <UserSelector
          embedded
          selectedItem={value}
          onChange={userCode => setFieldValue(fieldName, userCode)}
        />
      )}
    </Field>
  )
}

UserSelectorFormInput.propTypes = {}

export {UserSelectorFormInput}
