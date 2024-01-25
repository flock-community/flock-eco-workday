import React, { useState } from "react";
import { Button, Card, CardContent, CardHeader } from "@material-ui/core";
import { SickDayDialog } from "./SickDayDialog";
import { SickDayList } from "./SickDayList";
import { SickDayClient } from "../../clients/SickDayClient";
import { Person } from "../../clients/PersonClient";
import AddIcon from "@material-ui/icons/Add";
import { ISO_8601_DATE } from "../../clients/util/DateFormats";
import type { DayProps } from "../../types";

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
