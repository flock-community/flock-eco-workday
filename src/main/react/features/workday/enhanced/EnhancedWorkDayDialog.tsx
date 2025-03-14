import React, { useEffect, useState } from "react";
import { Box, Dialog, DialogContent, Divider, Grid } from "@material-ui/core";
import WorkIcon from "@material-ui/icons/Work";
import { ConfirmDialog } from "@flock-community/flock-eco-core/src/main/react/components/ConfirmDialog";
import Typography from "@material-ui/core/Typography";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import { WorkDayClient } from "../../../clients/WorkDayClient";
import { TransitionSlider } from "../../../components/transitions/Slide";
import { DialogFooter, DialogHeader } from "../../../components/dialog";
import { schema, WORKDAY_FORM_ID } from "../WorkDayForm";
import { isDefined } from "../../../utils/validation";
import { ISO_8601_DATE } from "../../../clients/util/DateFormats";
import Button from "@material-ui/core/Button";
import { ExportClient } from "../../../clients/ExportClient";
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
import { WorkDayProps, WorkDayState, ExportStatusProps, EventData, LeaveData, SickData } from "./types";
import { EventClient } from "../../../clients/EventClient";
import { LeaveDayClient, LEAVE_DAY_PAGE_SIZE } from "../../../clients/LeaveDayClient";
import { SickDayClient, SICKDAY_PAGE_SIZE } from "../../../clients/SickDayClient";
import { usePerson } from "../../../hooks/PersonHook";

// Extend dayjs with needed plugins
dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);

export function EnhancedWorkDayDialog({ personFullName, open, code, onComplete }: WorkDayProps) {
  const classes = useStyles();
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [showWeekends, setShowWeekends] = useState<boolean>(false);

  const [currentMonth, setCurrentMonth] = useState<dayjs.Dayjs>(dayjs());
  const [state, setState] = useState<WorkDayState | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [leaveData, setLeaveData] = useState<LeaveData[]>([]);
  const [sickData, setSickData] = useState<SickData[]>([]);
  const [exportLink, setExportLink] = useState<ExportStatusProps>({
    loading: false,
    link: null,
  });

  // Use the person hook to get the current person
  const [person] = usePerson();

  // Helper function to fetch all pages of data
  const fetchAllPages = async (fetchFn, pageSize) => {
    let page = 0;
    let allData = [];
    let hasMore = true;

    // Continue fetching until there's no more data
    while (hasMore) {
      const response = await fetchFn(page);
      const items = response.list || [];
      allData = [...allData, ...items];

      // Check if we've reached the last page
      hasMore = items.length === pageSize;
      page++;
    }

    return allData;
  };

  // Function to fetch events, leave days, and sick days for the current month
  const fetchAdditionalData = async (personId: string) => {
    if (!personId) return;

    try {
      // Fetch all events
      const allEvents = await fetchAllPages((page) => EventClient.getAll(page), 10);
      const personEvents = allEvents.filter(event =>
        event.persons.some(p => p.uuid === personId)
      );

      // Format events data
      const formattedEvents = personEvents.flatMap(event => {
        const days: EventData[] = [];
        const startDate = event.from;
        const endDate = event.to;

        let currentDate = startDate;
        while (currentDate.isSameOrBefore(endDate, 'day')) {
          days.push({
            date: currentDate.format('YYYY-MM-DD'),
            hours: event.hours,
            description: event.description
          });
          currentDate = currentDate.add(1, 'day');
        }

        return days;
      });

      // Group events by date and take only the first event for each date
      const eventsMap = new Map<string, EventData>();
      formattedEvents.forEach(event => {
        if (!eventsMap.has(event.date)) {
          eventsMap.set(event.date, event);
        }
      });

      setEvents(Array.from(eventsMap.values()));

      // Fetch all leave days (vacation) for the person
      const allLeaveDays = await fetchAllPages(
        (page) => LeaveDayClient.findAllByPersonId(personId, page),
        LEAVE_DAY_PAGE_SIZE
      );

      // Format leave days data
      const formattedLeaveDays = allLeaveDays.flatMap(leaveDay => {
        const days: LeaveData[] = [];
        const startDate = leaveDay.from;
        const endDate = leaveDay.to;

        let currentDate = startDate;
        while (currentDate.isSameOrBefore(endDate, 'day')) {
          days.push({
            date: currentDate.format('YYYY-MM-DD'),
            // Ensure leave hours are capped at 8
            hours: Math.min(leaveDay.hours || 8, 8),
            description: leaveDay.description,
            status: leaveDay.status
          });
          currentDate = currentDate.add(1, 'day');
        }

        return days;
      });

      // Group leave days by date
      const leaveDaysMap = new Map<string, LeaveData>();
      formattedLeaveDays.forEach(leaveDay => {
        const dateKey = leaveDay.date;
        if (!leaveDaysMap.has(dateKey)) {
          leaveDaysMap.set(dateKey, leaveDay);
        } else {
          // If there's already an entry for this date, don't add a duplicate
          // Just update status to APPROVED if any of the entries are approved
          if (leaveDay.status === 'APPROVED' && leaveDaysMap.get(dateKey).status !== 'APPROVED') {
            leaveDaysMap.set(dateKey, {
              ...leaveDaysMap.get(dateKey),
              status: 'APPROVED'
            });
          }
        }
      });

      setLeaveData(Array.from(leaveDaysMap.values()));

      // Fetch all sick days for the person
      const allSickDays = await fetchAllPages(
        (page) => SickDayClient.findAllByPersonId(personId, page),
        SICKDAY_PAGE_SIZE
      );

      // Format sick days data
      const formattedSickDays = allSickDays.flatMap(sickDay => {
        const days: SickData[] = [];
        const startDate = sickDay.from;
        const endDate = sickDay.to;

        let currentDate = startDate;
        while (currentDate.isSameOrBefore(endDate, 'day')) {
          days.push({
            date: currentDate.format('YYYY-MM-DD'),
            // Ensure sick hours are capped at 8
            hours: Math.min(sickDay.hours || 8, 8),
            description: sickDay.description,
            status: sickDay.status
          });
          currentDate = currentDate.add(1, 'day');
        }

        return days;
      });

      // Group sick days by date
      const sickDaysMap = new Map<string, SickData>();
      formattedSickDays.forEach(sickDay => {
        const dateKey = sickDay.date;
        if (!sickDaysMap.has(dateKey)) {
          sickDaysMap.set(dateKey, sickDay);
        } else {
          // If there's already an entry for this date, don't add a duplicate
          // Just update status to APPROVED if any of the entries are approved
          if (sickDay.status === 'APPROVED' && sickDaysMap.get(dateKey).status !== 'APPROVED') {
            sickDaysMap.set(dateKey, {
              ...sickDaysMap.get(dateKey),
              status: 'APPROVED'
            });
          }
        }
      });

      setSickData(Array.from(sickDaysMap.values()));

    } catch (error) {
      console.error("Error fetching additional data:", error);
    }
  };

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      if (code) {
        WorkDayClient.get(code).then((res) => {
          setState({
            assignmentCode: res.assignment.code,
            from: res.from,
            to: res.to,
            days: res.days,
            hours: res.hours,
            status: res.status,
            sheets: res.sheets,
            personId: person?.uuid
          });

          // Set current month to match the loaded data
          setCurrentMonth(res.from);

          // Fetch additional data if we have a person ID
          if (person?.uuid) {
            fetchAdditionalData(person.uuid);
          }
        });
      } else {
        setState(schema.cast());

        // Fetch additional data if we have a person ID
        if (person?.uuid) {
          fetchAdditionalData(person.uuid);
        }
      }
    } else {
      setState(null);
    }
  }, [open, code, person]);

  // Refetch additional data when month changes
  useEffect(() => {
    if (person?.uuid) {
      fetchAdditionalData(person.uuid);
    }
  }, [currentMonth]);

  // Handle form submission
  const handleSubmit = (it) => {
    setProcessing(true);
    const body = {
      from: it.from.format(ISO_8601_DATE),
      to: it.to.format(ISO_8601_DATE),
      days: it.days ? it.days : null,
      hours: it.days
        ? it.days.reduce((acc, cur) => acc + parseFloat(cur || 0), 0)
        : it.hours,
      assignmentCode: it.assignmentCode,
      status: it.status,
      sheets: it.sheets
    };

    if (code) {
      return WorkDayClient.put(code, body).then((res) => {
        if (isDefined(onComplete)) {
          setProcessing(false);
          onComplete(res);
        }
        setState(null);
      });
    } else {
      return WorkDayClient.post(body).then((res) => {
        if (isDefined(onComplete)) onComplete(res);
        setState(null);
        setProcessing(false);
      });
    }
  };

  // Delete workday
  const handleDelete = () => {
    WorkDayClient.delete(code).then(() => {
      if (isDefined(onComplete)) onComplete();
      setOpenDelete(false);
      setProcessing(true);
    });
  };

  const handleDeleteOpen = () => {
    setOpenDelete(true);
  };

  const handleDeleteClose = () => {
    setOpenDelete(false);
  };

  const handleClose = () => {
    if (isDefined(onComplete)) onComplete();
    setState(null);
  };

  // Export functionality
  const handleExport =
    code && UserAuthorityUtil.hasAuthority("WorkDayAuthority.ADMIN")
      ? async () => {
          setExportLink({ loading: true, link: null });
          const response = await ExportClient().exportWorkday(code);
          setExportLink({ loading: false, link: response.link });
          setProcessing(true);
        }
      : null;

  const headline = UserAuthorityUtil.hasAuthority("WorkDayAuthority.ADMIN")
    ? `Create Workday | ${personFullName}`
    : "Create Workday";

  function clearExportLink() {
    setExportLink({
      loading: false,
      link: null,
    });
  }

  // Update hours for a specific day
  const handleDayHoursChange = (date, hours, type = 'regular') => {
    if (!state) return;

    // Clone the current state to avoid direct mutation
    const newState = { ...state };

    if (type === 'regular') {
      // Check if the date is within the current range
      const isWithinRange = date.isBetween(newState.from, newState.to, 'day', '[]');

      if (isWithinRange) {
        // Calculate the index in the days array
        const dayIndex = date.diff(newState.from, 'day');

        // Update the existing day
        if (newState.days) {
          const newDays = [...newState.days];
          newDays[dayIndex] = hours;
          newState.days = newDays;
        } else {
          // Initialize days array if needed
          const dayCount = newState.to.diff(newState.from, 'day') + 1;
          const newDays = Array(dayCount).fill(0);
          newDays[dayIndex] = hours;
          newState.days = newDays;
        }
      } else {
        // The date is outside the current range, we need to expand it
        let newFrom = newState.from;
        let newTo = newState.to;

        if (date.isBefore(newState.from)) {
          // Extend the range earlier
          newFrom = date;
        } else if (date.isAfter(newState.to)) {
          // Extend the range later
          newTo = date;
        }

        // Calculate the new day count
        const newDayCount = newTo.diff(newFrom, 'day') + 1;

        // Create a new days array with all zeros
        const newDays = Array(newDayCount).fill(0);

        // Copy existing days data to the correct position in the new array
        if (newState.days) {
          const offset = newFrom.diff(newState.from, 'day');

          for (let i = 0; i < newState.days.length; i++) {
            const newIndex = i - offset;
            if (newIndex >= 0 && newIndex < newDays.length) {
              newDays[newIndex] = newState.days[i];
            }
          }
        }

        // Set the hours for the clicked day
        const clickedDayIndex = date.diff(newFrom, 'day');
        newDays[clickedDayIndex] = hours;

        // Update the state with the new range and days
        newState.from = newFrom;
        newState.to = newTo;
        newState.days = newDays;
      }

      // Update the state
      setState(newState);
    }
  };

  // Handle date range change
  const handleDateRangeChange = (from, to) => {
    if (!state) return;

    // Clone the current state to avoid direct mutation
    const newState = { ...state };

    // Calculate the new day count
    const newDayCount = to.diff(from, 'day') + 1;

    // Create a new days array or use the existing one
    let newDays;
    if (newState.days) {
      // If the range is reduced, truncate the array
      if (newDayCount <= newState.days.length) {
        newDays = newState.days.slice(0, newDayCount);
      } else {
        // If the range is expanded, add zeros for the new days
        newDays = [...newState.days];
        while (newDays.length < newDayCount) {
          newDays.push(0);
        }
      }
    } else {
      // If no days array exists, create a new one filled with zeros
      newDays = Array(newDayCount).fill(0);
    }

    // Update the state with the new range and days
    newState.from = from;
    newState.to = to;
    newState.days = newDays;

    setState(newState);
  };

  // Quick fill options
  const handleQuickFill = (hours) => {
    if (!state || !state.days) return;

    const newDays = [...state.days].map(() => hours);
    setState({
      ...state,
      days: newDays,
    });
  };

  // Toggle weekend visibility
  const handleToggleWeekends = (event) => {
    setShowWeekends(event.target.checked);
  };

  // Render the form elements (assignment, status, etc.)
  const renderFormFields = () => {
    if (!state) return null;

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

              <UserAuthorityUtil has={"WorkDayAuthority.ADMIN"}>
                <Grid item xs={12}>
                  <StatusSelect
                    value={values.status}
                    onChange={(newValue) => setFieldValue("status", newValue)}
                  />
                </Grid>
              </UserAuthorityUtil>

              <Grid item xs={12}>
                <CalendarGrid
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
                  values={values}
                  setFieldValue={setFieldValue}
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
        <DialogContent className={classes.dialogContent}>
          <UserAuthorityUtil has={"WorkDayAuthority.ADMIN"}>
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
