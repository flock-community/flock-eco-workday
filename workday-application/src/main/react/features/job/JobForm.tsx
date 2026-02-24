import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import { Field, Form, Formik } from 'formik';
import { Select, TextField } from 'formik-mui';
import type { Job, JobRequest } from '../../clients/JobClient';
import { ClientSelectorField } from '../../components/fields/ClientSelectorField';
import { DatePickerField } from '../../components/fields/DatePickerField';
import { DropzoneAreaField } from '../../components/fields/DropzoneAreaField';
import { JOB_FORM_SCHEMA } from './JobSchema';

export const JOB_FORM_ID = 'job-form';

type JobFormProps = {
  value: Job | null;
  onSubmit: (item: JobRequest) => void;
};

export function JobForm({ value, onSubmit }: JobFormProps) {
  const handleSubmit = (values) => {
    onSubmit({
      title: values.title,
      description: values.description,
      hourlyRate: values.hourlyRate,
      hoursPerWeek: values.hoursPerWeek,
      from: values.from,
      to: values.to,
      status: values.status,
      clientCode: values.clientCode,
      documents: (values.documents ?? []).map((d) => ({
        name: d.name,
        file: d.fileReference ?? d.file,
      })),
    });
  };

  const init = value
    ? {
        title: value.title,
        description: value.description,
        hourlyRate: value.hourlyRate,
        hoursPerWeek: value.hoursPerWeek,
        from: value.from,
        to: value.to,
        status: value.status,
        clientCode: value.client?.code ?? null,
        documents: (value.documents ?? []).map((d) => ({
          name: d.name,
          fileReference: d.file,
        })),
      }
    : undefined;

  const form = ({ values }) => (
    <Form id={JOB_FORM_ID}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          <Field
            name="title"
            type="text"
            label="Title"
            fullWidth
            component={TextField}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Field
            name="description"
            type="text"
            label="Description"
            fullWidth
            multiline
            minRows={3}
            component={TextField}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Field
            name="hourlyRate"
            type="number"
            label="Hourly rate"
            fullWidth
            component={TextField}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Field
            name="hoursPerWeek"
            type="number"
            label="Hours per week"
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
          <Field name="status" label="Status" fullWidth component={Select}>
            <MenuItem value="DRAFT">Draft</MenuItem>
            <MenuItem value="OPEN">Open</MenuItem>
            <MenuItem value="CLOSED">Closed</MenuItem>
          </Field>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <ClientSelectorField name="clientCode" fullWidth />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <DropzoneAreaField name="documents" endpoint="/api/jobs/files" />
        </Grid>
      </Grid>
    </Form>
  );

  return (
    <Formik
      initialValues={{ ...JOB_FORM_SCHEMA.cast(), ...init }}
      onSubmit={handleSubmit}
      validationSchema={JOB_FORM_SCHEMA}
      enableReinitialize
    >
      {form}
    </Formik>
  );
}
