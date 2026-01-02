import AddIcon from '@mui/icons-material/Add';
import { Card, CardContent, CardHeader } from '@mui/material';
import Button from '@mui/material/Button';
import { useContext, useState } from 'react';
import { ApplicationContext } from '../../application/ApplicationContext';
import type { Person } from '../../clients/PersonClient';
import { ISO_8601_DATE } from '../../clients/util/DateFormats';
import { WorkDayClient } from '../../clients/WorkDayClient';
import { addError } from '../../hooks/ErrorHook';
import { WorkDayDialog } from './WorkDayDialog';
import { WorkDayList } from './WorkDayList';

type WorkDayFeatureProps = {
  person: Person;
};

export function WorkDayFeature({ person }: WorkDayFeatureProps) {
  const [refresh, setRefresh] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<any>();
  const { authorities } = useContext(ApplicationContext);

  function handleCompleteDialog() {
    setRefresh(!refresh);
    setOpen(false);
    setValue(undefined);
  }

  function handleClickAdd() {
    if (person === null) {
      addError('No person selected');
    } else {
      setValue(undefined);
      setOpen(true);
    }
  }

  function handleClickRow(item) {
    setValue(item);
    setOpen(true);
  }

  function handleStatusChange(status, it) {
    WorkDayClient.put(it.code, {
      ...it,
      from: it.from.format(ISO_8601_DATE),
      to: it.to.format(ISO_8601_DATE),
      status,
      assignmentCode: it.assignment.code,
      days: it.days.length > 0 ? it.days : null,
    }).then(() => setRefresh(!refresh));
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Work days"
          action={
            <Button onClick={handleClickAdd}>
              <AddIcon /> Add
            </Button>
          }
        />
        <CardContent>
          <WorkDayList
            personId={person.uuid}
            onClickRow={handleClickRow}
            refresh={refresh}
            onClickStatus={handleStatusChange}
          />
        </CardContent>
      </Card>
      <WorkDayDialog
        personFullName={person.fullName}
        open={open}
        code={value?.code}
        onComplete={handleCompleteDialog}
      />
    </>
  );
}
