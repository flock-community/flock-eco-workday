import React, { useState } from "react";
import { Typography, TextField } from "@material-ui/core";
import { useStyles } from "./styles";
import {
  CalendarDay as CalendarDayType,
  WorkDayState,
  EventData,
  LeaveData,
  SickData,
} from "./types";
import {
  EVENT_COLOR,
  VACATION_COLOR,
  SICKNESS_COLOR,
  OVERLAP_COLOR,
} from "./types";

interface CalendarDayProps {
  day: CalendarDayType;
  state: WorkDayState | null;
  events: EventData[];
  leaveData: LeaveData[];
  sickData: SickData[];
  overlapData?: { hours: number; description?: string }[];
  onHoursChange: (date: any, hours: number, type?: string) => void;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  state,
  events,
  leaveData,
  sickData,
  overlapData = [],
  onHoursChange,
}) => {
  const classes = useStyles();
  const { date, dayOfMonth, isCurrentMonth, hours, isSelected } = day;

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(hours.toString());

  // Sync inputValue with hours prop when it changes (e.g., after save/reload)
  React.useEffect(() => {
    if (!isEditing) {
      setInputValue(hours.toString());
    }
  }, [hours, isEditing]);

  // Only consider events, leave and sick data if the day is in the current month
  const hasEvent = isCurrentMonth && events && events.length > 0;
  const hasLeaveData = isCurrentMonth && leaveData && leaveData.length > 0;
  const hasSickData = isCurrentMonth && sickData && sickData.length > 0;
  const hasOverlap = isCurrentMonth && overlapData && overlapData.length > 0;

  // Get the actual hours (or default to 8 only if hours is not provided)
  const eventHours = hasEvent ? events[0].hours || 8 : 0;
  const leaveHours = hasLeaveData ? leaveData[0].hours || 8 : 0;
  const sickHours = hasSickData ? sickData[0].hours || 8 : 0;
  const overlapHours = hasOverlap ? overlapData[0].hours || 0 : 0;

  // Get status for leave days and sick days (approved or not)
  const leaveApproved = hasLeaveData && leaveData[0].status === "APPROVED";
  const sickApproved = hasSickData && sickData[0].status === "APPROVED";

  const handleClick = () => {
    if (state) {
      // Allow editing any day shown in the calendar, not just current month days
      // This enables setting hours for days in partial weeks at month boundaries
      setInputValue(hours.toString());
      setIsEditing(true);
    }
  };

  const handleChange = (e) => {
    // Allow only numbers
    const value = e.target.value.replace(/[^0-9]/g, "");
    setInputValue(value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Convert to number and update hours
    const newHours = inputValue === "" ? 0 : parseInt(inputValue, 10);
    if (newHours !== hours) {
      onHoursChange(date, newHours);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue(hours.toString());
    }
  };

  // Determine cell class based on current month and selection status
  const cellClassName = `${classes.dayCell}
    ${isSelected ? classes.dayCellSelected : ""}
    ${!isCurrentMonth ? classes.dayCellNotCurrentMonth : ""}`;

  return (
    <div className={cellClassName} onClick={handleClick}>
      <span className={classes.dayNumber}>{dayOfMonth}</span>

      {isEditing ? (
        <TextField
          autoFocus
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={classes.hoursInput}
          inputProps={{
            style: {
              textAlign: "center",
              fontSize: "1.5rem",
              width: "30px",
            },
          }}
        />
      ) : (
        <span className={classes.hoursDisplay}>
          {isCurrentMonth && hours > 0 ? hours : ""}
        </span>
      )}

      {/* Sick indicator - top right - only show for current month days */}
      {hasSickData && (
        <div
          className={classes.sickIndicator}
          style={
            sickApproved
              ? {
                  backgroundColor: SICKNESS_COLOR,
                  border: `2px solid ${SICKNESS_COLOR}`,
                }
              : {
                  border: `2px solid ${SICKNESS_COLOR}`,
                  color: SICKNESS_COLOR,
                  backgroundColor: "transparent",
                }
          }
          title={`${sickData[0].description || "Sick"} (${
            sickApproved ? "Approved" : "Pending"
          })`}
        >
          {sickHours}
        </div>
      )}

      {/* Event indicator - bottom right - only show for current month days */}
      {hasEvent && (
        <div
          className={classes.eventIndicator}
          style={{
            backgroundColor: EVENT_COLOR,
            border: `2px solid ${EVENT_COLOR}`,
          }}
          title={events[0].description || "Event"}
        >
          {eventHours}
        </div>
      )}

      {/* Vacation indicator - bottom left - only show for current month days */}
      {hasLeaveData && (
        <div
          className={classes.vacationIndicator}
          style={
            leaveApproved
              ? {
                  backgroundColor: VACATION_COLOR,
                  border: `2px solid ${VACATION_COLOR}`,
                }
              : {
                  border: `2px solid ${VACATION_COLOR}`,
                  color: VACATION_COLOR,
                  backgroundColor: "transparent",
                }
          }
          title={`${leaveData[0].description || "Vacation"} (${
            leaveApproved ? "Approved" : "Pending"
          })`}
        >
          {leaveHours}
        </div>
      )}

      {/* Overlap indicator - top left - only show for current month days */}
      {hasOverlap && (
        <div
          className={classes.overlapIndicator}
          style={{ border: `2px solid ${OVERLAP_COLOR}`, color: OVERLAP_COLOR }}
          title={overlapData[0].description || "Overlapping workday"}
        >
          {overlapHours}
        </div>
      )}
    </div>
  );
};
