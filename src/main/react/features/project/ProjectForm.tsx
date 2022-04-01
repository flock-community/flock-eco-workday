import {Field, Form, Formik, FormikProps} from "formik";
import React, {useEffect, useState} from "react";
import {Project, ProjectClient} from "../../clients/ProjectClient";
import {TextField} from "formik-material-ui";
import * as yup from "yup";

export const PROJECT_FORM_ID = "project-form"

type ProjectFormProps = {
  projectCode?: string,
  onSubmit: (project: Project) => void
}

export default function ProjectForm({ projectCode, onSubmit } : ProjectFormProps) {

  const [project, setProject] = useState({name: ""})

  useEffect(() => {
    if (!projectCode) return

    ProjectClient.findByCode(projectCode)
      .then(res => setProject(res)) // FIXME: types
  }, [projectCode])

  const handleSubmit = (values, { setSubmitting }) => {
    onSubmit(values)
    setSubmitting(false)
  }

  const schema = yup.object().shape({
    name: yup.string().required()
  })

  const form = (props: FormikProps<any>) => (
    <Form id={PROJECT_FORM_ID}>
      <Field type="text" name="name" label="Name" component={TextField} />
    </Form>
  )

  return (
    <Formik
      enableReinitialize
      initialValues={{...project}}
      onSubmit={handleSubmit}
      validationSchema={schema}
    >
      {form}
    </Formik>
  )
}
