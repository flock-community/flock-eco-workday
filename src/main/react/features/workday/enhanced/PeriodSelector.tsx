import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Select,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  Grid,
  Box,
  Chip,
  Paper,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import dayjs from "dayjs";
import { Period } from "./types";

// Simple ID generator function to replace uuid
const generateId = () => {
  return `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

interface PeriodSelectorProps {
  periods: Period[];
  onChange: (periods: Period[]) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  periods,
  onChange,
}) => {
  // Generate weeks for selection (3 months before and after current date)
  const getWeekOptions = () => {
    const options = [];
    const startDate = dayjs().subtract(3, "month");
    const endDate = dayjs().add(3, "month");

    let currentDate = startDate.startOf("week");
    while (currentDate.isBefore(endDate)) {
      const weekNumber = currentDate.week();
      const year = currentDate.year();
      const label = `Week ${weekNumber} (${currentDate.format("DD MMM")})`;
      options.push({
        value: currentDate.format("YYYY-MM-DD"),
        label,
        weekNumber,
        year,
      });
      currentDate = currentDate.add(1, "week");
    }

    return options;
  };

  // Generate months for selection (1 year before and after current date)
  const getMonthOptions = () => {
    const options = [];
    const startDate = dayjs().subtract(1, "year");
    const endDate = dayjs().add(1, "year");

    let currentDate = startDate.startOf("month");
    while (currentDate.isBefore(endDate)) {
      const label = currentDate.format("MMMM YYYY");
      options.push({
        value: currentDate.format("YYYY-MM-DD"),
        label,
      });
      currentDate = currentDate.add(1, "month");
    }

    return options;
  };

  const weekOptions = getWeekOptions();
  const monthOptions = getMonthOptions();

  // Handle period type change
  const handleTypeChange = (periodId: string, viewType: "month" | "week") => {
    const updatedPeriods = periods.map((period) => {
      if (period.id === periodId) {
        // Get default date for the new view type
        let date = dayjs();
        let from, to;

        if (viewType === "month") {
          date = date.startOf("month");
          from = date.startOf("month");
          to = date.endOf("month");
        } else {
          date = date.startOf("week");
          from = date;
          to = date.endOf("week");
        }

        return {
          ...period,
          viewType,
          date,
          from,
          to,
        };
      }
      return period;
    });

    onChange(updatedPeriods);
  };

  // Handle period date change
  const handleDateChange = (periodId: string, dateValue: string) => {
    const date = dayjs(dateValue);

    const updatedPeriods = periods.map((period) => {
      if (period.id === periodId) {
        let from, to;

        if (period.viewType === "month") {
          from = date.startOf("month");
          to = date.endOf("month");
        } else {
          from = date.startOf("week");
          to = date.endOf("week");
        }

        return {
          ...period,
          date,
          from,
          to,
        };
      }
      return period;
    });

    // Check for overlaps and adjust if needed
    const adjustedPeriods = adjustForOverlaps(updatedPeriods);
    onChange(adjustedPeriods);
  };

  // Add new period
  const handleAddPeriod = () => {
    // Find the latest end date from existing periods
    let latestEndDate =
      periods.length > 0
        ? periods.reduce(
            (latest, period) =>
              period.to.isAfter(latest) ? period.to : latest,
            periods[0].to
          )
        : dayjs();

    // Default to month view, starting after the latest period
    const newDate = latestEndDate.add(1, "day").startOf("month");
    const newPeriod: Period = {
      id: generateId(),
      viewType: "month",
      date: newDate,
      from: newDate.startOf("month"),
      to: newDate.endOf("month"),
    };

    // Check for overlaps and adjust if needed
    const newPeriods = [...periods, newPeriod];
    const adjustedPeriods = adjustForOverlaps(newPeriods);

    onChange(adjustedPeriods);
  };

  // Remove period
  const handleRemovePeriod = (periodId: string) => {
    const updatedPeriods = periods.filter((period) => period.id !== periodId);
    onChange(updatedPeriods);
  };

  // Adjust periods to prevent overlaps
  const adjustForOverlaps = (periodsToAdjust: Period[]): Period[] => {
    // Sort periods by start date
    const sortedPeriods = [...periodsToAdjust].sort((a, b) =>
      a.from.isBefore(b.from) ? -1 : a.from.isAfter(b.from) ? 1 : 0
    );

    const adjustedPeriods: Period[] = [];

    sortedPeriods.forEach((period, index) => {
      if (index === 0) {
        // First period doesn't need adjustment
        adjustedPeriods.push(period);
      } else {
        const prevPeriod = adjustedPeriods[index - 1];

        // Check if the current period overlaps with the previous one
        if (
          period.from.isBefore(prevPeriod.to) ||
          period.from.isSame(prevPeriod.to)
        ) {
          // Adjust the start date to be after the previous period
          const newFrom = prevPeriod.to.add(1, "day");
          let newTo;

          if (period.viewType === "month") {
            // For month view, adjust to end of the month containing newFrom
            newTo = newFrom.endOf("month");
          } else {
            // For week view, adjust to end of the week containing newFrom
            newTo = newFrom.endOf("week");
          }

          adjustedPeriods.push({
            ...period,
            from: newFrom,
            to: newTo,
            date:
              period.viewType === "month"
                ? newFrom.startOf("month")
                : newFrom.startOf("week"),
          });
        } else {
          // No overlap, keep the period as is
          adjustedPeriods.push(period);
        }
      }
    });

    return adjustedPeriods;
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Periodes
      </Typography>

      {periods.map((period, index) => (
        <Paper key={period.id} style={{ padding: 16, marginBottom: 16 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel id={`period-type-label-${period.id}`}>
                  Type
                </InputLabel>
                <Select
                  labelId={`period-type-label-${period.id}`}
                  value={period.viewType}
                  onChange={(e) =>
                    handleTypeChange(
                      period.id,
                      e.target.value as "month" | "week"
                    )
                  }
                >
                  <MenuItem value="month">Maand</MenuItem>
                  <MenuItem value="week">Week</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={7}>
              <FormControl fullWidth>
                <InputLabel id={`period-date-label-${period.id}`}>
                  {period.viewType === "month" ? "Maand" : "Week"}
                </InputLabel>
                <Select
                  labelId={`period-date-label-${period.id}`}
                  value={period.date.format("YYYY-MM-DD")}
                  onChange={(e) =>
                    handleDateChange(period.id, e.target.value as string)
                  }
                >
                  {period.viewType === "month"
                    ? monthOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))
                    : weekOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={2}>
              {periods.length > 1 && (
                <IconButton
                  color="secondary"
                  onClick={() => handleRemovePeriod(period.id)}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Grid>

            <Grid item xs={12}>
              <Box mt={1}>
                <Chip
                  label={`Van: ${period.from.format("DD MMM YYYY")}`}
                  style={{ marginRight: 8 }}
                />
                <Chip label={`Tot: ${period.to.format("DD MMM YYYY")}`} />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Button
        variant="outlined"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddPeriod}
      >
        Voeg periode toe
      </Button>
    </div>
  );
};
