import React from "react";
import {
  Paper,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
} from "@material-ui/core";

export interface FreeDaySettingsValue {
  enabled: boolean;
  frequency: string;
  dayOfWeek: number;
}

interface FreeDaySettingsProps {
  value: FreeDaySettingsValue;
  onChange: (settings: FreeDaySettingsValue) => void;
  showWeekends: boolean;
  onToggleWeekends: (event: React.ChangeEvent<HTMLInputElement>) => void;
  classes: {
    freeDaySettings: string;
    freeDayRow: string;
    weekendToggle: string;
  };
}

export const FreeDaySettings: React.FC<FreeDaySettingsProps> = ({
  value,
  onChange,
  showWeekends,
  onToggleWeekends,
  classes,
}) => {
  const handleFreeDayToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      enabled: event.target.checked,
    });
  };

  const handleFrequencyChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    onChange({
      ...value,
      frequency: event.target.value as string,
    });
  };

  const handleDayOfWeekChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    onChange({
      ...value,
      dayOfWeek: parseInt(event.target.value as string),
    });
  };

  return (
    <Paper className={classes.freeDaySettings}>
      <div className={classes.freeDayRow}>
        <FormControlLabel
          control={
            <Checkbox
              checked={value.enabled}
              onChange={handleFreeDayToggle}
              name="enableFreeDay"
              color="primary"
            />
          }
          label="Vrije dag optie"
          style={{ marginRight: 16 }}
        />

        {value.enabled && (
          <>
            <Select
              value={value.frequency}
              onChange={handleFrequencyChange}
              style={{ marginRight: 8 }}
            >
              <MenuItem value="every">Elke week</MenuItem>
              <MenuItem value="odd">Oneven weken</MenuItem>
              <MenuItem value="even">Even weken</MenuItem>
            </Select>

            <Select
              value={value.dayOfWeek}
              onChange={handleDayOfWeekChange}
              style={{ marginLeft: 8 }}
            >
              <MenuItem value={1}>Maandag</MenuItem>
              <MenuItem value={2}>Dinsdag</MenuItem>
              <MenuItem value={3}>Woensdag</MenuItem>
              <MenuItem value={4}>Donderdag</MenuItem>
              <MenuItem value={5}>Vrijdag</MenuItem>
              <MenuItem value={6}>Zaterdag</MenuItem>
              <MenuItem value={0}>Zondag</MenuItem>
            </Select>
          </>
        )}

        <div className={classes.weekendToggle}>
          <FormControlLabel
            control={
              <Checkbox
                checked={showWeekends}
                onChange={onToggleWeekends}
                name="showWeekends"
                color="primary"
              />
            }
            label="Toon weekend dagen"
          />
        </div>
      </div>
    </Paper>
  );
};
