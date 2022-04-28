import React, { useState } from "react";
import { Grid } from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { TextField } from "formik-material-ui";
import { DatePickerField } from "../../components/fields/DatePickerField";
import { ClientSelectorField } from "../../components/fields/ClientSelectorField";
import { ASSIGNMENT_FORM_SCHEMA } from "./AssignmentSchema";
import { ProjectSelectorField } from "../../components/fields/ProjectSelectorField";
import AddIcon from "@material-ui/icons/Add";
import Button from "@material-ui/core/Button";
import ProjectDialog from "../project/ProjectDialog";
import { Assignment, AssignmentRequest } from "../../clients/AssignmentClient";
import DayjsUtils from "@date-io/dayjs";

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
        <MuiPickersUtilsProvider utils={DayjsUtils}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Field
                name="hourlyRate"
                type="number"
                label="Hourly rate"
                fullWidth
                component={TextField}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                name="hoursPerWeek"
                type="number"
                label="Hours per week"
                fullWidth
                component={TextField}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                name="role"
                type="text"
                label="Role"
                fullWidth
                component={TextField}
              />
            </Grid>
            <Grid item xs={6}>
              <DatePickerField
                name="from"
                label="Start date"
                fullWidth
                maxDate={values.to ? values.to : undefined}
              />
            </Grid>
            <Grid item xs={6}>
              <DatePickerField
                name="to"
                label="End date"
                fullWidth
                clearable
                minDate={values.from}
              />
            </Grid>
            <Grid item xs={12}>
              <ClientSelectorField name="clientCode" fullWidth />
            </Grid>
            <Grid item xs={12}>
              <ProjectSelectorField
                onRefresh={handleRefresh}
                refresh={doRefresh}
                name="projectCode"
                fullWidth
              />
            </Grid>
            <Grid>
              <Button onClick={createProject}>
                <AddIcon /> Add project
              </Button>
            </Grid>
          </Grid>
        </MuiPickersUtilsProvider>
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
