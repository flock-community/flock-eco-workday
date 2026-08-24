import { useState } from 'react';
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
      from: it.from.format(ISO_8601_DATE),
      to: it.to.format(ISO_8601_DATE),
      hours: it.hours,
      days: it.days.length > 0 ? it.days : null,
      status,
      assignmentCode: it.assignment.code,
      sheets: it.sheets,
    }).then(() => setRefresh(!refresh));
  }

  return (
    <>
      <WorkDayList
        personId={person.uuid}
        onClickRow={handleClickRow}
        refresh={refresh}
        onClickStatus={handleStatusChange}
        onClickAdd={handleClickAdd}
      />
      <WorkDayDialog
        personFullName={person.fullName}
        open={open}
        code={value?.code}
        onComplete={handleCompleteDialog}
      />
    </>
  );
}
