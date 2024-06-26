import React, { useState } from "react";
import { Button, Card, CardContent, CardHeader } from "@material-ui/core";
import { LeaveDayDialog } from "./LeaveDayDialog";
import { LeaveDayList } from "./LeaveDayList";
import { LeaveDayClient } from "../../clients/LeaveDayClient";
import AddIcon from "@material-ui/icons/Add";
import { Person } from "../../clients/PersonClient";
import { ISO_8601_DATE } from "../../clients/util/DateFormats";

type LeaveDayFeatureProps = {
  person: Person;
};

export function LeaveDayFeature({ person }: LeaveDayFeatureProps) {
  const [refresh, setRefresh] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<any>();

  function handleCompleteDialog() {
    setRefresh(!refresh);
    setOpen(false);
    setValue(null);
  }

  function handleClickAdd() {
    setValue(null);
    setOpen(true);
  }

  function handleClickRow(it) {
    setValue(it);
    setOpen(true);
  }

  function handleStatusChange(status, it) {
    LeaveDayClient.put(it.code, {
      ...it,
      status,
      from: it.from.format(ISO_8601_DATE),
      to: it.to.format(ISO_8601_DATE),
      days: it.days.length > 0 ? it.days : null,
    }).then(() => setRefresh(!refresh));
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Leave days"
          action={
            <Button onClick={handleClickAdd}>
              <AddIcon /> Add
            </Button>
          }
        />
        <CardContent>
          <LeaveDayList
            personId={person?.uuid}
            refresh={refresh}
            onClickRow={handleClickRow}
            onClickStatus={handleStatusChange}
          />
        </CardContent>
      </Card>
      <LeaveDayDialog
        open={open}
        code={value?.code}
        personId={person?.uuid}
        onComplete={handleCompleteDialog}
      />
    </>
  );
}
