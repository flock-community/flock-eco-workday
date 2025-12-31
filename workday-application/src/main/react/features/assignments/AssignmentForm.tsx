import React, { useState } from "react";
import { Grid2 } from "@mui/material";
import { Field, Form, Formik } from "formik";
import { TextField } from "formik-mui";
import { DatePickerField } from "../../components/fields/DatePickerField";
import { ClientSelectorField } from "../../components/fields/ClientSelectorField";
import { ASSIGNMENT_FORM_SCHEMA } from "./AssignmentSchema";
import { ProjectSelectorField } from "../../components/fields/ProjectSelectorField";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import ProjectDialog from "../project/ProjectDialog";
import { Assignment, AssignmentRequest } from "../../clients/AssignmentClient";

// form id as a reference point for buttons outside of the <form></form> scope to be
// able to submit this form
export const ASSIGNMENT_FORM_ID = "assignment-form";

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
      promise.then((res) => {
        console.log(`Items in project selector updated`);
      });
    };

    return (
      <Form id={ASSIGNMENT_FORM_ID}>
        <Grid2 container spacing={1}>
          <Grid2 size={{ xs: 12 }}>
            <Field
              name="hourlyRate"
              type="number"
              label="Hourly rate"
              fullWidth
              component={TextField}
            />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <Field
              name="hoursPerWeek"
              type="number"
              label="Hours per week"
              fullWidth
              component={TextField}
            />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <Field
              name="role"
              type="text"
              label="Role"
              fullWidth
              component={TextField}
            />
          </Grid2>
          <Grid2 size={{ xs: 6 }}>
            <DatePickerField
              name="from"
              label="Start date"
              maxDate={values.to ? values.to : undefined}
            />
          </Grid2>
          <Grid2 size={{ xs: 6 }}>
            <DatePickerField name="to" label="End date" minDate={values.from} />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <ClientSelectorField name="clientCode" fullWidth />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <ProjectSelectorField
              onRefresh={handleRefresh}
              refresh={doRefresh}
              name="projectCode"
              fullWidth
            />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <Button onClick={createProject}>
              <AddIcon /> Add project
            </Button>
          </Grid2>
        </Grid2>
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
