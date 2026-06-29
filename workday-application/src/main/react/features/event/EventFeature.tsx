import { Box } from '@mui/material';
import { useState } from 'react';
import type { FlockEvent } from '../../clients/EventClient';
import { EventDialog } from './EventDialog';
import { EventList } from './EventList';

export function EventFeature() {
  const [reload, setReload] = useState(false);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<FlockEvent | undefined>(undefined);

  function handleCompleteDialog() {
    setReload(!reload);
    setOpen(false);
    setState(undefined);
  }

  function handleClickAdd() {
    setState(undefined);
    setOpen(true);
  }

  function handleClickRow(item: FlockEvent) {
    setState(item);
    setOpen(true);
  }

  return (
    <Box
      className={'flow full-width'}
      flow-gap={'wide'}
      style={{ paddingInline: 24, paddingBottom: '1.5rem' }}
    >
      <EventList
        onClickRow={handleClickRow}
        onClickAdd={handleClickAdd}
        refresh={reload}
      />
      <EventDialog
        open={open}
        code={state?.code}
        onComplete={handleCompleteDialog}
      />
    </Box>
  );
}
