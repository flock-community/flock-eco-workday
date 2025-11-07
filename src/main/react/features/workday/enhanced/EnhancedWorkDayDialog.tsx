import React, { useEffect, useState, useCallback, useRef } from "react";
import { Box, Dialog, DialogContent, Divider, Grid } from "@material-ui/core";
import WorkIcon from "@material-ui/icons/Work";
import { ConfirmDialog } from "@flock-community/flock-eco-core/src/main/react/components/ConfirmDialog";
import Typography from "@material-ui/core/Typography";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import { WorkDayClient } from "../../../clients/WorkDayClient";
import { TransitionSlider } from "../../../components/transitions/Slide";
import { DialogFooter, DialogHeader } from "../../../components/dialog";
import { schema, WORKDAY_FORM_ID } from "../WorkDayForm";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import { AssignmentSelectorField } from "../../../components/fields/AssignmentSelectorField";
import { StatusSelect } from "../../../components/status/StatusSelect";
import { DropzoneAreaField } from "../../../components/fields/DropzoneAreaField";
import isoWeek from "dayjs/plugin/isoWeek";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useStyles } from "./styles";
import { CalendarGrid } from "./CalendarGrid";
import { WorkDayProps, WorkDayState } from "./types";
import { usePerson } from "../../../hooks/PersonHook";
import { useWorkdayData } from "../hooks/useWorkdayData";
import { useWorkdayFormHandlers } from "../hooks/useWorkdayFormHandlers";
import { useWorkdayDateHandlers } from "../hooks/useWorkdayDateHandlers";

// Extend dayjs with needed plugins
dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);

export function EnhancedWorkDayDialog({
  personFullName,
  open,
  code,
  onComplete,
}: WorkDayProps) {
  const classes = useStyles();
  const [showWeekends, setShowWeekends] = useState<boolean>(false);

  // Initialize with null to ensure we set it properly when data loads
  const [currentMonth, setCurrentMonth] = useState<dayjs.Dayjs | null>(null);
  const [state, setState] = useState<WorkDayState | null>(null);
  // NEW: Add state to track all displayed months - using useRef to prevent render loops
  const initialMonthsRef = useRef<dayjs.Dayjs[]>([]);

  // Track the previous code value to detect changes
  const [prevCode, setPrevCode] = useState<string | undefined>(undefined);

  // NEW: Add state to track selected weeks across all month periods
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);

  // Use the person hook to get the current person
  const [person] = usePerson();

  // Use workday data hook for fetching events, leave, sick days, and overlapping workdays
  const {
    events,
    leaveData,
    sickData,
    overlappingWorkdays,
    loading: dataLoading,
  } = useWorkdayData({
    personId: person?.uuid,
    currentMonth,
    currentWorkdayCode: code,
    enabled: open,
  });

  // Use form handlers hook for submission, deletion, and export
  const {
    processing,
    openDelete,
    exportLink,
    handleSubmit,
    handleDelete,
    handleDeleteOpen,
    handleDeleteClose,
    handleClose,
    handleExport,
    clearExportLink,
  } = useWorkdayFormHandlers({
    code,
    selectedWeeks,
    onComplete,
    onStateChange: setState,
  });

  // Use date handlers hook for day/date operations
  const {
    handleDayHoursChange,
    handleDateRangeChange,
    handleQuickFill,
    handleToggleWeekends,
    handleMonthsChange,
  } = useWorkdayDateHandlers({
    state,
    currentMonth,
    events,
    leaveData,
    sickData,
    initialMonthsRef,
    onStateChange: setState,
    onCurrentMonthChange: setCurrentMonth,
    onShowWeekendsChange: setShowWeekends,
  });

  // For debugging
  const logRef = useRef(false);

  // Reset dialog state when it closes
  useEffect(() => {
    if (!open) {
      // Reset everything when dialog closes
      setState(null);
      setPrevCode(undefined);
      initialMonthsRef.current = [];
      logRef.current = false;
    }
  }, [open]);

  // Complete reset when code changes
  useEffect(() => {
    if (code !== prevCode) {
      // Code has changed, reset the state
      setState(null);
      setCurrentMonth(null);
      initialMonthsRef.current = [];
      logRef.current = false;

      // Update the previous code
      setPrevCode(code);
    }
  }, [code, prevCode]);

  // Load data when dialog opens or code changes
  useEffect(() => {
    if (!open) return;

    const loadWorkday = async () => {
      try {
        if (code) {
          const res = await WorkDayClient.get(code);
          const workDayState = {
            assignmentCode: res.assignment.code,
            from: res.from,
            to: res.to,
            days: res.days,
            hours: res.hours,
            status: res.status,
            sheets: res.sheets,
            personId: person?.uuid,
          };

          setState(workDayState);

          // When editing an existing workday, determine all months in the range
          // Extract all months from the state's date range
          const months = [];
          let current = dayjs(res.from).startOf("month");
          const end = dayjs(res.to).endOf("month");

          // Add all months in the date range
          while (current.isSameOrBefore(end, "month")) {
            months.push(dayjs(current));
            current = current.add(1, "month");
          }

          // Debug logging - only do once
          if (!logRef.current) {
            console.log(
              "Loading existing workday with range:",
              res.from.format("YYYY-MM-DD"),
              "to",
              res.to.format("YYYY-MM-DD")
            );
            console.log(
              "Detected months:",
              months.map((m) => m.format("YYYY-MM"))
            );
            logRef.current = true;
          }

          // Set the first month as current and all months as displayed
          if (months.length > 0) {
            setCurrentMonth(months[0]);
            initialMonthsRef.current = months;
          }
        } else {
          // For new workdays, initialize with current person
          const now = dayjs();
          const initialState = {
            ...schema.cast(),
            from: now, // Ensure from is a Dayjs object, not Date
            to: now, // Ensure to is a Dayjs object, not Date
            personId: person?.uuid || null,
          };
          setState(initialState);

          // For new workdays, use the current month
          setCurrentMonth(now);
          initialMonthsRef.current = [now.startOf("month")];
        }
      } catch (error) {
        console.error("Error loading workday data:", error);
        // TODO: Add user-facing error message
      }
    };

    loadWorkday();
  }, [open, code, person]);

  // NEW: Update selected weeks - use useCallback to prevent infinite loops
  const handleSelectedWeeksChange = useCallback((weeks: number[]) => {
    setSelectedWeeks(weeks);
  }, []);

  const headline = UserAuthorityUtil.hasAuthority("WorkDayAuthority.ADMIN")
    ? `Create Workday | ${personFullName}`
    : "Create Workday";

  // Render the form elements (assignment, status, etc.)
  const renderFormFields = () => {
    if (!state || !currentMonth) return null;

    // Show loading message if person is not loaded yet or doesn't have uuid
    if (!person || !person.uuid) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <Typography>Loading...</Typography>
        </Box>
      );
    }

    // Force initialMonthsRef to have at least one month
    if (initialMonthsRef.current.length === 0 && currentMonth) {
      initialMonthsRef.current = [currentMonth.startOf("month")];
    }

    // Check if period spans multiple months and ensure all months are included
    if (state && state.from && state.to) {
      const fromMonth = dayjs(state.from).startOf("month");
      const toMonth = dayjs(state.to).startOf("month");

      // If from and to are in different months, make sure both are in initialMonthsRef
      if (
        !fromMonth.isSame(toMonth, "month") &&
        initialMonthsRef.current.length < 2
      ) {
        console.log(
          "Period spans multiple months:",
          fromMonth.format("YYYY-MM"),
          toMonth.format("YYYY-MM")
        );

        // Create a comprehensive list of all months in the range
        const months = [];
        let current = dayjs(fromMonth);

        while (current.isSameOrBefore(toMonth, "month")) {
          months.push(dayjs(current)); // Create new instance to avoid reference issues
          current = current.add(1, "month");
        }

        // Update initialMonthsRef if we found multiple months
        if (months.length > 1) {
          console.log(
            "Updating initialMonthsRef to include all",
            months.length,
            "months"
          );
          initialMonthsRef.current = months;
        }
      }
    }

    return (
      <Formik
        enableReinitialize
        initialValues={state}
        onSubmit={handleSubmit}
        validationSchema={schema}
      >
        {({ values, setFieldValue }) => (
          <Form id={WORKDAY_FORM_ID}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <AssignmentSelectorField
                  fullWidth
                  name="assignmentCode"
                  label="Assignment"
                  personId={person?.uuid}
                  from={values.from}
                  to={values.to}
                />
              </Grid>

              <UserAuthorityUtil has="WorkDayAuthority.ADMIN">
                <Grid item xs={12}>
                  <StatusSelect
                    value={values.status}
                    onChange={(newValue) => setFieldValue("status", newValue)}
                  />
                </Grid>
              </UserAuthorityUtil>

              <Grid item xs={12}>
                <CalendarGrid
                  // Don't use a key that changes with every render, as this recreates the component
                  // and loses internal state like the selected month
                  currentMonth={currentMonth}
                  state={state}
                  events={events}
                  leaveData={leaveData}
                  sickData={sickData}
                  showWeekends={showWeekends}
                  onMonthChange={setCurrentMonth}
                  onToggleWeekends={handleToggleWeekends}
                  onDayHoursChange={handleDayHoursChange}
                  onQuickFill={handleQuickFill}
                  onDateRangeChange={handleDateRangeChange}
                  onSelectedWeeksChange={handleSelectedWeeksChange}
                  initialMonths={initialMonthsRef.current}
                  onMonthsChange={handleMonthsChange}
                  values={values}
                  setFieldValue={setFieldValue}
                  overlappingWorkdays={overlappingWorkdays}
                />
              </Grid>

              <Grid item xs={12}>
                <DropzoneAreaField
                  name="sheets"
                  endpoint="/api/workdays/sheets"
                />
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    );
  };

  return (
    <>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={TransitionSlider}
      >
        <DialogHeader
          icon={<WorkIcon />}
          headline={headline}
          subheadline="Add your workday."
          onClose={handleClose}
        />
        <DialogContent className={`${classes.dialogContent} ${classes.typographyRoot}`}>
          <UserAuthorityUtil has="WorkDayAuthority.ADMIN">
            <Box my="1rem">
              <Typography variant={"h5"} component={"h2"}>
                {personFullName}
              </Typography>
            </Box>
          </UserAuthorityUtil>
          {renderFormFields()}
        </DialogContent>
        <Divider />
        <DialogFooter
          formId={WORKDAY_FORM_ID}
          onClose={handleClose}
          onDelete={handleDeleteOpen}
          onExport={handleExport}
          disableDelete={
            !UserAuthorityUtil.hasAuthority("WorkDayAuthority.ADMIN") &&
            state &&
            state.status !== "REQUESTED"
          }
          disableEdit={
            !UserAuthorityUtil.hasAuthority("WorkDayAuthority.ADMIN") &&
            state &&
            state.status !== "REQUESTED"
          }
          processingExport={exportLink.loading}
          processing={processing}
        />
      </Dialog>
      <ConfirmDialog
        open={openDelete}
        onClose={handleDeleteClose}
        onConfirm={handleDelete}
      >
        <Typography>Are you sure you want to remove this workday.</Typography>
      </ConfirmDialog>
      <Snackbar
        open={exportLink.link != null}
        onClose={clearExportLink}
        autoHideDuration={6000}
      >
        <div className={classes.exportSnackBar}>
          <Typography className={classes.exportMessage}>
            Export of workday to google drive is done.
          </Typography>
          <Button
            onClick={clearExportLink}
            href={exportLink.link!}
            target="_blank"
          >
            Open in tab
          </Button>
        </div>
      </Snackbar>
    </>
  );
}
