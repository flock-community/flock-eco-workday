import {InputLabel, MenuItem, Select} from '@mui/material';
import { EventType } from '../../clients/EventClient';
import { EventTypeMapping } from '../../utils/mappings';
import FormControl from "@mui/material/FormControl";

export function EventTypeSelect({ onChange, value }) {
  const renderSelectOption = (item: EventType) => {
    return (
      <MenuItem value={item} key={item}>
        {EventTypeMapping[item]}
      </MenuItem>
    );
  };

  const handleOnChange = (event) => {
    event.stopPropagation();
    onChange(event.target.value);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="event-select-label">Event type</InputLabel>
    <Select
      fullWidth
      value={value || ''}
      labelId="event-select-label"
      onChange={handleOnChange}
      label="Event type"
      displayEmpty
    >
      {[
        EventType.GENERAL_EVENT,
        EventType.FLOCK_HACK_DAY,
        EventType.FLOCK_COMMUNITY_DAY,
        EventType.CONFERENCE,
      ].map((eventType) => renderSelectOption(eventType))}
    </Select>
    </FormControl>
  );
}
