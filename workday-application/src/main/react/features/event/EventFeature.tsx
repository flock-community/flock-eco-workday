import AddIcon from '@mui/icons-material/Add';
import { Box, Card, CardContent, CardHeader } from '@mui/material';
import Button from '@mui/material/Button';
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
      className={'flow'}
      flow-gap={'wide'}
      style={{ paddingBottom: '1.5rem' }}
    >
      <Card>
        <CardHeader
          title="Events"
          action={
            <Button onClick={handleClickAdd}>
              <AddIcon /> Add
            </Button>
          }
        />
        <CardContent>
          <EventList onClickRow={handleClickRow} refresh={reload} />
        </CardContent>
      </Card>
      <EventDialog
        open={open}
        code={state?.code}
        onComplete={handleCompleteDialog}
      />
    </Box>
  );
}
