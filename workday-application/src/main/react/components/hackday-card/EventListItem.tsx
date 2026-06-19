import { FormGroup } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import { alpha, styled } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import type { FlockEvent } from '../../clients/EventClient';
import { DMY_DATE } from '../../clients/util/DateFormats';
import { usePerson } from '../../hooks/PersonHook';
import { isPersonAttending } from '../../utils/EventUtils';

const PREFIX = 'EventListItem';

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
  onEventToggle: (flockEvent: FlockEvent, isSubscribed: boolean) => void;
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

  useEffect(() => {
    setBtnState(attendingPerServer);
  }, [attendingPerServer]);

  const handleChange = () => {
    setBtnState(!btnState);
    onEventToggle(event, !btnState);
  };

  return (
    <StyledListItem
      data-testid={'flock-event-list-item'}
      className={btnState ? classes.active : ''}
    >
      <ListItemText primary={event.description} secondary={dateString} />
      <FormGroup row>
        <Switch
          checked={btnState}
          onChange={handleChange}
          name="presentToggle"
          color="primary"
        />
      </FormGroup>
    </StyledListItem>
  );
}
