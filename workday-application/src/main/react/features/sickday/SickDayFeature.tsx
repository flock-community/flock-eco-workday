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
      from: it.from.format(ISO_8601_DATE),
      to: it.to.format(ISO_8601_DATE),
      hours: it.hours,
      days: it.days,
      status,
      description: it.description,
      personId: it.personId,
    }).then(() => setRefresh(!refresh));
  }

  return (
    <>
      <SickDayList
        personId={person?.uuid}
        onClickRow={handleClickRow}
        refresh={refresh}
        onClickStatus={handleStatusChange}
        onClickAdd={handleClickAdd}
      />
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
