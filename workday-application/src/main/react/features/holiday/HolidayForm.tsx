import React from "react";
import * as Yup from "yup";
import { Field, Form, Formik } from "formik";
import Grid2 from "@mui/material/Grid2";
import { TextField } from "formik-mui";
import UserAuthorityUtil from "@workday-user/user_utils/UserAuthorityUtil";
import { DatePickerField } from "../../components/fields/DatePickerField";
import { PeriodInputField } from "../../components/fields/PeriodInputField";
import dayjs from "dayjs";
import { StatusSelect } from "../../components/status/StatusSelect";
import { LEAVE_DAY_DIALOG_FORM_ID } from "./LeaveDayDialog";

export const HOLIDAY_FORM_ID = "holiday-form-id";

const now = dayjs();

export const schemaHoliDayForm = Yup.object().shape({
  description: Yup.string().required("Field required").default(""),
  status: Yup.string().required("Field required").default("REQUESTED"),
  from: Yup.date().required("From date is required").default(now),
  to: Yup.date().required("To date is required").default(now),
  days: Yup.array().default([8]).nullable(),
});

type HolidayFormProps = {
  value: any;
  onSubmit?: (item: any) => void;
};

export function HolidayForm({ value, onSubmit }: HolidayFormProps) {
  const handleSubmit = (data) => {
    onSubmit?.({
      ...value,
      ...data,
      hours: data.days.reduce((acc, cur) => acc + parseFloat(cur || 0), 0),
    });
  };

  const renderForm = ({ values, setFieldValue }) => {
    const handleStatusChange = (newValue) => {
      setFieldValue("status", newValue);
    };

    return (
      <Form id={LEAVE_DAY_DIALOG_FORM_ID}>
        <Grid2 container spacing={1}>
          <Grid2 size={{ xs: 12 }}>
            <Field
              name="description"
              type="text"
              label="Description"
              fullWidth
              component={TextField}
            />
          </Grid2>

          {value && (
            <Grid2 size={{ xs: 12 }}>
              <UserAuthorityUtil has={"HolidayAuthority.ADMIN"}>
                <StatusSelect
                  value={values.status}
                  onChange={handleStatusChange}
                ></StatusSelect>
              </UserAuthorityUtil>
            </Grid2>
          )}
          <Grid2 size={{ xs: 6 }}>
            <DatePickerField name="from" label="From" maxDate={values.to} />
          </Grid2>
          <Grid2 size={{ xs: 6 }}>
            <DatePickerField name="to" label="To" minDate={values.from} />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <PeriodInputField name="days" from={values.from} to={values.to} />
          </Grid2>
        </Grid2>
      </Form>
    );
  };

  return (
    <Formik
      enableReinitialize
      initialValues={value}
      onSubmit={handleSubmit}
      validationSchema={schemaHoliDayForm}
    >
      {renderForm}
    </Formik>
  );
}
