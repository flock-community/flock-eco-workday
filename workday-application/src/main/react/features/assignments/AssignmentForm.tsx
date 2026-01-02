import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import { useState } from 'react';
import type {
  Assignment,
  AssignmentRequest,
} from '../../clients/AssignmentClient';
import { ClientSelectorField } from '../../components/fields/ClientSelectorField';
import { DatePickerField } from '../../components/fields/DatePickerField';
import { ProjectSelectorField } from '../../components/fields/ProjectSelectorField';
import ProjectDialog from '../project/ProjectDialog';
import { ASSIGNMENT_FORM_SCHEMA } from './AssignmentSchema';

// form id as a reference point for buttons outside of the <form></form> scope to be
// able to submit this form
export const ASSIGNMENT_FORM_ID = 'assignment-form';

type AssignmentFormProps = {
  value: Assignment;
  onSubmit: (item: AssignmentRequest) => void;
};
export const AssignmentForm = ({ value, onSubmit }: AssignmentFormProps) => {
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const doRefresh = () => setRefresh(!refresh);

  const createProject = () => {
    setProjectDialogOpen(true);
  };

  const closeProjectDialog = () => {
    doRefresh();
    setProjectDialogOpen(false);
  };

  const form = ({ values, setFieldValue }) => {
    const handleRefresh = (promise) => {
      promise.then((_res) => {
        console.log(`Items in project selector updated`);
      });
    };

    return (
      <Form id={ASSIGNMENT_FORM_ID}>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12 }}>
            <Field
              name="hourlyRate"
              type="number"
              label="Hourly rate"
              fullWidth
              component={TextField}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Field
              name="hoursPerWeek"
              type="number"
              label="Hours per week"
              fullWidth
              component={TextField}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Field
              name="role"
              type="text"
              label="Role"
              fullWidth
              component={TextField}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <DatePickerField
              name="from"
              label="Start date"
              maxDate={values.to ? values.to : undefined}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <DatePickerField name="to" label="End date" minDate={values.from} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ClientSelectorField name="clientCode" fullWidth />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ProjectSelectorField
              onRefresh={handleRefresh}
              refresh={doRefresh}
              name="projectCode"
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button onClick={createProject}>
              <AddIcon /> Add project
            </Button>
          </Grid>
        </Grid>
      </Form>
    );
  };

  const projectDialog = (
    <ProjectDialog open={projectDialogOpen} closeDialog={closeProjectDialog} />
  );

  const init = value && {
    hourlyRate: value.hourlyRate,
    hoursPerWeek: value.hoursPerWeek,
    role: value.role,
    from: value.from,
    to: value.to,
    clientCode: value.client.code,
    personId: value.person.uuid,
    projectCode: value.project?.code,
  };
  return (
    <>
      <Formik
        initialValues={{ ...ASSIGNMENT_FORM_SCHEMA.cast(), ...init }}
        onSubmit={onSubmit}
        validationSchema={ASSIGNMENT_FORM_SCHEMA}
        enableReinitialize
      >
        {form}
      </Formik>
      {projectDialog}
    </>
  );
};
