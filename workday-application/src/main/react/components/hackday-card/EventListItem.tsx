import { FormGroup, InputAdornment, TextField } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import { alpha, styled } from '@mui/material/styles';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FlockEvent } from '../../clients/EventClient';
import { DMY_DATE } from '../../clients/util/DateFormats';
import { usePerson } from '../../hooks/PersonHook';
import { isPersonAttending } from '../../utils/EventUtils';

const PREFIX = 'EventListItem';

const HOURS_SAVE_DEBOUNCE_MS = 600;

const classes = {
  active: `${PREFIX}Active`,
};

const StyledListItem = styled(ListItem)(({ theme }) => ({
  [`&.${classes.active}`]: {
    backgroundColor: alpha(theme.palette.primary.main, 0.14),
  },
}));

type FlockEventListItemProps = {
  event: FlockEvent;
  onEventToggle: (
    flockEvent: FlockEvent,
    isSubscribed: boolean,
    hours?: number,
  ) => void;
};

export function EventListItem({
  event,
  onEventToggle,
}: FlockEventListItemProps) {
  const [person] = usePerson();

  const dateString = useMemo(
    () =>
      event.from.isSame(event.to, 'day')
        ? `date: ${event.from.format(DMY_DATE)}`
        : `from: ${event.from.format(DMY_DATE)} to: ${event.to.format(DMY_DATE)}`,
    [event],
  );

  const attendingPerServer = person?.uuid
    ? isPersonAttending(event, person.uuid)
    : false;
  const [btnState, setBtnState] = useState<boolean>(attendingPerServer);
  const [hours, setHours] = useState<number>(event.hours);
  const editingRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setBtnState(attendingPerServer);
  }, [attendingPerServer]);

  useEffect(() => {
    // Don't let a re-fetch overwrite hours mid-edit.
    if (!editingRef.current) {
      setHours(event.hours);
    }
  }, [event.hours]);

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    [],
  );

  const handleToggle = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const next = !btnState;
    setBtnState(next);
    onEventToggle(event, next, next ? hours : undefined);
  };

  const handleHoursChange = (value: number) => {
    setHours(value);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      onEventToggle(event, true, value);
    }, HOURS_SAVE_DEBOUNCE_MS);
  };

  return (
    <StyledListItem
      data-testid={'flock-event-list-item'}
      className={btnState ? classes.active : ''}
    >
      <ListItemText primary={event.description} secondary={dateString} />
      <FormGroup row style={{ alignItems: 'center', gap: 8 }}>
        {btnState && (
          <TextField
            type="number"
            size="small"
            value={Number.isFinite(hours) ? hours : ''}
            onFocus={() => {
              editingRef.current = true;
            }}
            onBlur={() => {
              editingRef.current = false;
            }}
            onChange={(e) => handleHoursChange(Number(e.target.value))}
            sx={{
              width: 96,
              '& input[type=number]': { MozAppearance: 'textfield' },
              '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
                { WebkitAppearance: 'none', margin: 0 },
            }}
            slotProps={{
              htmlInput: { min: 0, step: 1, 'aria-label': 'Hack hours' },
              input: {
                endAdornment: <InputAdornment position="end">h</InputAdornment>,
              },
            }}
          />
        )}
        <Switch
          checked={btnState}
          onChange={handleToggle}
          name="presentToggle"
          color="primary"
        />
      </FormGroup>
    </StyledListItem>
  );
}
