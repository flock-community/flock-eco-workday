import { Field, Form, Formik, type FormikProps } from 'formik';
import { TextField } from 'formik-mui';
import { useEffect, useState } from 'react';
import * as yup from 'yup';
import {
  type Project,
  ProjectClient,
  type ProjectRequest,
} from '../../clients/ProjectClient';

export const PROJECT_FORM_ID = 'project-form';

type ProjectFormProps = {
  projectCode?: string;
  onSubmit: (project: Project) => void;
};

export default function ProjectForm({
  projectCode,
  onSubmit,
}: ProjectFormProps) {
  const [project, setProject] = useState<ProjectRequest>({ name: '' });

  useEffect(() => {
    if (!projectCode) return;

    ProjectClient.get(projectCode).then((res) => setProject(res));
  }, [projectCode]);

  const handleSubmit = (values, { setSubmitting }) => {
    onSubmit(values);
    setSubmitting(false);
  };

  const schema: unknown = yup.object().shape({
    name: yup.string().required(),
  });

  const form = (_props: FormikProps<any>) => (
    <Form id={PROJECT_FORM_ID}>
      <Field type="text" name="name" label="Name" component={TextField} />
    </Form>
  );

  return (
    <Formik
      enableReinitialize
      initialValues={{ ...project }}
      onSubmit={handleSubmit}
      validationSchema={schema}
    >
      {form}
    </Formik>
  );
}
