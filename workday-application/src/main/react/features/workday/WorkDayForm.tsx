import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { Field, Form, Formik } from "formik";
import Grid2 from "@mui/material/Grid2";
import Switch from "@mui/material/Switch";
import { ButtonGroup, Typography } from "@mui/material";
import { TextField } from "formik-mui";
import UserAuthorityUtil from "@workday-user/user_utils/UserAuthorityUtil";
import { PeriodInputField } from "../../components/fields/PeriodInputField";
import { isDefined } from "../../utils/validation";
import { usePerson } from "../../hooks/PersonHook";
import { AssignmentSelectorField } from "../../components/fields/AssignmentSelectorField";
import { DatePickerField } from "../../components/fields/DatePickerField";
import { DropzoneAreaField } from "../../components/fields/DropzoneAreaField";
import { mutatePeriod } from "../period/Period";
import Button from "@mui/material/Button";
import { DatePreset, datePresets } from "../../utils/DatePreset";
import dayjs from "dayjs";
import { StatusSelect } from "../../components/status/StatusSelect";
import PropTypes from "prop-types";

export const WORKDAY_FORM_ID = "work-day-form";

const now = dayjs();

export const schema = Yup.object().shape({
  status: Yup.string().required("Field required").default("REQUESTED"),
  assignmentCode: Yup.string()
    .required("Assignment is required")
    .nullable()
    .default(""),
  from: Yup.date().required("From date is required").default(now),
  to: Yup.date().required("To date is required").default(now),
  days: Yup.array().default([8]).nullable(),
  hours: Yup.number().default("0"),
  sheets: Yup.array().default([]),
});

/**
 * @return {null}
 */
export function WorkDayForm({ value, onSubmit }) {
  const [person] = usePerson();

  const [daysSwitch, setDaysSwitch] = useState(!value.days);

  useEffect(() => {
    setDaysSwitch(!value.days);
  }, [value]);

  const handleSubmit = (data: any) => {
    if (isDefined(onSubmit)) {
      return onSubmit({
        assignmentCode: data.assignmentCode,
        from: data.from,
        to: data.to,
        days: daysSwitch ? undefined : data.days,
        hours: data.hours,
        status: data.status,
        sheets: data.sheets,
      });
    } else {
      return Promise.resolve();
    }
  };

  const handleSwitchChange = (ev) => {
    setDaysSwitch(ev.target.checked);
  };

  const renderSwitch = (
    <Grid2 container alignItems="center" spacing={1}>
      <Grid2>
        <Switch checked={daysSwitch} onChange={handleSwitchChange} />
      </Grid2>
      <Grid2>
        <Typography>Hours only</Typography>
      </Grid2>
    </Grid2>
  );

  const renderDatePresetButtons = (setFieldValue: any) => {
    const setPeriod = (datePreset: DatePreset) => {
      setFieldValue("to", datePreset.to);
      setFieldValue("from", datePreset.from);
    };

    return (
      <ButtonGroup size="small" fullWidth>
        {datePresets.map((datePreset, index) => (
          <Button
            key={index}
            variant="outlined"
            onClick={() => setPeriod(datePreset)}
          >
            {datePreset.title}
          </Button>
        ))}
      </ButtonGroup>
    );
  };

  const renderFormHours = ({ values, setFieldValue }) => (
    <>
      <Grid2 size={{ xs: 6 }}>
        <DatePickerField name="from" label="From" maxDate={values.to} />
      </Grid2>
      <Grid2 size={{ xs: 6 }}>
        <DatePickerField name="to" label="To" minDate={values.from} />
      </Grid2>
      <Grid2 size={{ xs: 12 }}>
        {renderDatePresetButtons(setFieldValue)}
      </Grid2>
      {(UserAuthorityUtil.hasAuthority("WorkDayAuthority.ADMIN") ||
        UserAuthorityUtil.hasAuthority("WorkDayAuthority.TOTAL_HOURS")) && (
        <Grid2 size={{ xs: 12 }}>
          {renderSwitch}
        </Grid2>
      )}
      <Grid2 size={{ xs: 12 }}>
        {daysSwitch ? (
          <Field
            name="hours"
            type="number"
            label="Hours"
            component={TextField}
          />
        ) : (
          <PeriodInputField name="days" from={values.from} to={values.to} />
        )}
      </Grid2>
    </>
  );

  const renderForm = ({ values, setFieldValue, isSubmitting }) => {
    const handleStatusChange = (newValue) => {
      setFieldValue("status", newValue);
    };

    return (
      <Form id={WORKDAY_FORM_ID}>
        <Grid2 container spacing={1}>
          <Grid2 size={{ xs: 12 }}>
            <AssignmentSelectorField
              id="Assignment"
              name="assignmentCode"
              label="Assignment"
              personId={person?.uuid}
              from={values.from}
              to={values.to}
            />
          </Grid2>

          <UserAuthorityUtil has={"WorkDayAuthority.ADMIN"}>
            <Grid2 size={{ xs: 12 }}>
              <StatusSelect
                value={values.status}
                onChange={handleStatusChange}
              ></StatusSelect>
            </Grid2>
          </UserAuthorityUtil>
          <Grid2 size={{ xs: 12 }}>
            <hr />
          </Grid2>
          {renderFormHours({ values, setFieldValue })}
          <Grid2 size={{ xs: 12 }}>
            <hr />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <DropzoneAreaField name="sheets" endpoint="/api/workdays/sheets" />
          </Grid2>
        </Grid2>
      </Form>
    );
  };

  return value ? (
    <Formik
      enableReinitialize
      initialValues={mutatePeriod(value) || schema.default()}
      onSubmit={handleSubmit}
      validationSchema={schema}
    >
      {renderForm}
    </Formik>
  ) : null;
}

WorkDayForm.propTypes = {
  value: PropTypes.object,
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  onSwitchChange: PropTypes.func,
  daysSwitch: PropTypes.func,
};
