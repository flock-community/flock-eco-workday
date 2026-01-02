import AddIcon from '@mui/icons-material/Add';
import { Button, Card, CardContent, CardHeader } from '@mui/material';
import { useState } from 'react';
import type { Person } from '../../clients/PersonClient';
import { SickDayClient } from '../../clients/SickDayClient';
import { ISO_8601_DATE } from '../../clients/util/DateFormats';
import type { DayProps } from '../../types';
import { SickDayDialog } from './SickDayDialog';
import { SickDayList } from './SickDayList';

type SickDayFeatureProps = {
  person: Person;
};

export function SickDayFeature({ person }: SickDayFeatureProps) {
  const [refresh, setRefresh] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<any>(null);

  function handleCompleteDialog() {
    setRefresh(!refresh);
    setOpen(false);
    setValue(null);
  }

  function handleClickAdd() {
    setValue(null);
    setOpen(true);
  }

  function handleClickRow(item: DayProps) {
    setValue(item);
    setOpen(true);
  }

  function handleStatusChange(status: string, it: DayProps) {
    SickDayClient.put(it.code, {
      ...it,
      status,
      from: it.from.format(ISO_8601_DATE),
      to: it.to.format(ISO_8601_DATE),
    }).then(() => setRefresh(!refresh));
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Sick days"
          action={
            <Button onClick={handleClickAdd}>
              <AddIcon /> Add
            </Button>
          }
        />
        <CardContent>
          <SickDayList
            personId={person?.uuid}
            onClickRow={handleClickRow}
            refresh={refresh}
            onClickStatus={handleStatusChange}
          />
        </CardContent>
      </Card>
      <SickDayDialog
        personFullName={person.fullName}
        open={open}
        code={value?.code}
        personId={person?.uuid}
        onComplete={handleCompleteDialog}
      />
    </>
  );
}
